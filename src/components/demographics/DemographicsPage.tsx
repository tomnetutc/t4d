import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeDistribution,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import HorizontalBarChart, { BarItem } from '../charts/HorizontalBarChart';
import PieChart, { PieSlice } from '../charts/PieChart';
import {
  DEMOGRAPHICS_NAV,
  GENDER_CATS,
  AGEGROUP_CATS,
  RACE_VARIABLES, RaceVar,
  HH_SIZE_CATS,
  INSTITUTION_CATS, INSTITUTION_LABELS,
} from './demographicsData';
import {
  HOUSUNIT_SLICES,
  TENURE_CATS, TENURE_SHORT,
} from '../household/householdData';
import './DemographicsPage.css';

const TOP_MENU_H = 65;
const SKIP_SET = new Set(['Seen but not answered', 'Appropriate skip', 'Missing (other)']);
const PIE_PALETTE = ['#3580b8', '#2ba88c', '#e87d2e', '#ead97c', '#c5c5c5', '#e25b61'];

/* ── helpers ─────────────────────────────────────────────── */

/** Distribution sorted by count — for free-form variables. */
function toDistItems(data: SurveyRow[], variable: string): BarItem[] {
  const dist = computeDistribution(data, variable);
  const total = dist.reduce((a, b) => a + b.count, 0);
  return dist.map(d => ({ label: d.label, count: d.count, total }));
}

/** Predefined cats sorted by count — for unordered categorical. */
function toOrderedItems(
  data: SurveyRow[], variable: string, cats: string[], labelMap?: Record<string, string>
): BarItem[] {
  const dist = computeDistribution(data, variable);
  const total = dist.reduce((a, b) => a + b.count, 0);
  return cats
    .map(cat => ({
      label: labelMap?.[cat] ?? cat,
      fullLabel: cat,
      count: dist.find(d => d.label === cat)?.count ?? 0,
      total,
    }))
    .filter(it => it.count > 0)
    .sort((a, b) => b.count - a.count);
}

/** Predefined cats in defined order — for ordered variables like age. */
function toOrderedItemsFixed(
  data: SurveyRow[], variable: string, cats: string[], labelMap?: Record<string, string>
): BarItem[] {
  const dist = computeDistribution(data, variable);
  const total = dist.reduce((a, b) => a + b.count, 0);
  return cats
    .map(cat => ({
      label: labelMap?.[cat] ?? cat,
      fullLabel: cat,
      count: dist.find(d => d.label === cat)?.count ?? 0,
      total,
    }))
    .filter(it => it.count > 0);
}

/** Build pie slices dynamically from any variable — robust to unknown values. */
function buildDynamicPie(data: SurveyRow[], variable: string): PieSlice[] {
  const dist = computeDistribution(data, variable);
  return dist.map((d, i) => ({
    label: d.label,
    count: d.count,
    color: PIE_PALETTE[i % PIE_PALETTE.length],
  }));
}

/** Build pie slices from predefined slice defs (for housunit). */
function buildPieSlices(
  data: SurveyRow[],
  variable: string,
  sliceDefs: Array<{ value: string; label: string; color: string }>
): PieSlice[] {
  const dist = computeDistribution(data, variable);
  return sliceDefs
    .map(def => ({
      label: def.label,
      count: dist.find(d => d.label === def.value)?.count ?? 0,
      color: def.color,
    }))
    .filter(s => s.count > 0);
}

/** Count rows where the race column has an actual race value (not skip/not-selected). */
function computeRaceItems(data: SurveyRow[], vars: RaceVar[]): BarItem[] {
  const total = data.length;
  return vars
    .map(v => {
      let selected = 0;
      for (const row of data) {
        const val = row[v.key];
        // Exclude skip values AND the Qualtrics "Option not selected" placeholder
        if (val && !SKIP_SET.has(val) && val !== 'Option not selected') selected++;
      }
      return { label: v.shortLabel, count: selected, total };
    })
    .sort((a, b) => b.count - a.count)
    .filter(it => it.count > 0);
}

/** Cap integer values at threshold — for hh_size. */
function computeCappedCounts(
  data: SurveyRow[], variable: string, cats: string[], capAt: number
): BarItem[] {
  const counts: Record<string, number> = {};
  cats.forEach(c => (counts[c] = 0));
  let total = 0;
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_SET.has(v)) continue;
    const n = parseInt(v, 10);
    if (isNaN(n)) continue;
    total++;
    const key = n >= capAt ? `${capAt}+` : String(n);
    if (key in counts) counts[key]++;
  }
  return cats
    .map(cat => ({ label: cat, count: counts[cat] || 0, total }))
    .filter(it => it.count > 0);
}

const DemographicsPage: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const { setCurrentCluster } = useCurrentCluster();
  const [allData, setAllData] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { applyFilters, filters } = useFilters();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSurveyData()
      .then(d => { setAllData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredData = useMemo(() => applyFilters(allData), [allData, filters]);

  // ── Scroll spy ──────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const mainArea = document.querySelector('.main-area') as HTMLElement | null;
    if (!mainArea) return;
    const TRIGGER = TOP_MENU_H + 40;
    const onScroll = () => {
      if (isScrollingRef.current) return;
      const atBottom = mainArea.scrollHeight - mainArea.scrollTop - mainArea.clientHeight < 80;
      if (atBottom) { setCurrentCluster(DEMOGRAPHICS_NAV[DEMOGRAPHICS_NAV.length - 1].id); return; }
      let activeId = DEMOGRAPHICS_NAV[0].id;
      for (const nav of DEMOGRAPHICS_NAV) {
        const el = sectionRefs.current[nav.id];
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top - mainArea.getBoundingClientRect().top;
        if (elTop <= TRIGGER) activeId = nav.id;
      }
      setCurrentCluster(activeId);
    };
    mainArea.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => mainArea.removeEventListener('scroll', onScroll);
  }, [loading, setCurrentCluster]);

  // ── Scroll-to on param change ────────────────────────────────
  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    const mainArea = document.querySelector('.main-area') as HTMLElement | null;
    if (!el || !mainArea) return;
    const target =
      mainArea.scrollTop +
      el.getBoundingClientRect().top -
      mainArea.getBoundingClientRect().top -
      TOP_MENU_H - 12;
    isScrollingRef.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => { isScrollingRef.current = false; }, 900);
    setCurrentCluster(id);
    mainArea.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [setCurrentCluster]);

  useEffect(() => {
    if (loading || !section) return;
    const t = setTimeout(() => scrollToSection(section), 100);
    return () => clearTimeout(t);
  }, [section, loading, scrollToSection]);

  const setRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; },
    []
  );

  // ── Pre-compute all chart data ───────────────────────────────
  const chartData = useMemo(() => {
    // [1] Gender
    const gender: BarItem[] = toOrderedItems(filteredData, 'gender', GENDER_CATS);

    // [2] Age groups (preserve age order)
    const ageGroup: BarItem[] = toOrderedItemsFixed(filteredData, 'AgeGroup1', AGEGROUP_CATS);

    // [3] Race (binary multi-select)
    const race: BarItem[] = computeRaceItems(filteredData, RACE_VARIABLES);

    // [4] Ethnicity (pie — dynamic to handle any values)
    const hispanic: PieSlice[] = buildDynamicPie(filteredData, 'hispaniclatin');

    // [5] Place of birth (pie — dynamic)
    const placebirth: PieSlice[] = buildDynamicPie(filteredData, 'placebirth');

    // [6] Education (free distribution sorted by count)
    const education: BarItem[] = toDistItems(filteredData, 'education');

    // [7] Household size (capped at 7+)
    const hhSize: BarItem[] = computeCappedCounts(filteredData, 'hh_size', HH_SIZE_CATS, 7);

    // [8] Household income (imputed — free distribution)
    const income: BarItem[] = toDistItems(filteredData, 'IncomeImputation');

    // [9] Housing type (reuse HOUSUNIT_SLICES from Section 6)
    const housUnit: PieSlice[] = buildPieSlices(filteredData, 'housunit', HOUSUNIT_SLICES);

    // [10] Home ownership / tenure (reuse TENURE_CATS from Section 6)
    const tenure: BarItem[] = toOrderedItems(filteredData, 'tenure', TENURE_CATS, TENURE_SHORT);

    // [11] Survey institution
    const institution: BarItem[] = toOrderedItems(
      filteredData, 'SurveyInstitution', INSTITUTION_CATS, INSTITUTION_LABELS
    );

    // [12] State — HState2 contains FIPS state codes; map to state names
    const FIPS_TO_STATE: Record<string, string> = {
      '4':  'Arizona', '12': 'Florida', '13': 'Georgia', '48': 'Texas',
    };
    const stateDist = computeDistribution(filteredData, 'HState2');
    const stateTotal = stateDist.reduce((a, b) => a + b.count, 0);
    const state: BarItem[] = stateDist
      .filter(d => FIPS_TO_STATE[d.label]) // drop 'Variable not available...' entries
      .map(d => ({ label: FIPS_TO_STATE[d.label], count: d.count, total: stateTotal }))
      .sort((a, b) => b.count - a.count);

    return {
      gender, ageGroup, race, hispanic, placebirth, education,
      hhSize, income, housUnit, tenure, institution, state,
    };
  }, [filteredData]);

  /* ── Render ──────────────────────────────────────────────── */
  const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
    <div data-cluster-id={id} ref={setRef(id)} className="cluster-section">
      <div className="cluster-section-header">
        <h2 className="cluster-title">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <>
      <TopMenu />
      <div className="clusters-page">
        {loading && (
          <div className="clusters-loading">
            <div className="clusters-spinner" />
            <div>Loading survey data…</div>
          </div>
        )}
        {error && <div className="clusters-error"><strong>Error:</strong> {error}</div>}

        {!loading && !error && (
          <>
            {/* ── Subsection: Individual Attributes ─────────── */}
            <Section id="individual" title="Individual Attributes">

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Gender</h3>
                <HorizontalBarChart
                  items={chartData.gender}
                  title="Gender"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Age Group</h3>
                <HorizontalBarChart
                  items={chartData.ageGroup}
                  title="Age Group"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Race</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Respondents could select up to two race categories.
                </p>
                <HorizontalBarChart
                  items={chartData.race}
                  title="Race"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Ethnicity (Hispanic or Latino)</h3>
                <PieChart
                  slices={chartData.hispanic}
                  title="Ethnicity"
                  showTitle={false}
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Place of Birth</h3>
                <PieChart
                  slices={chartData.placebirth}
                  title="Place of Birth"
                  showTitle={false}
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Education Level</h3>
                <HorizontalBarChart
                  items={chartData.education}
                  title="Education Level"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

            </Section>

            {/* ── Subsection: Household Composition ─────────── */}
            <Section id="household" title="Household Composition">

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Household Size</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Number of people living in the household.
                </p>
                <HorizontalBarChart
                  items={chartData.hhSize}
                  title="Household Size"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

            </Section>

            {/* ── Subsection: Economic & Housing ────────────── */}
            <Section id="economic" title="Economic & Housing">

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Household Income</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Annual household income before taxes (imputed).
                </p>
                <HorizontalBarChart
                  items={chartData.income}
                  title="Household Income"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Housing Type</h3>
                <PieChart
                  slices={chartData.housUnit}
                  title="Housing Type"
                  showTitle={false}
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Home Ownership / Tenure</h3>
                <HorizontalBarChart
                  items={chartData.tenure}
                  title="Tenure"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

            </Section>

            {/* ── Subsection: Geographic ────────────────────── */}
            <Section id="geographic" title="Geographic">

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Survey Institution / Metro Area</h3>
                <HorizontalBarChart
                  items={chartData.institution}
                  title="Survey Institution"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              <div className="demo-subchart">
                <h3 className="demo-subchart-title">Home State</h3>
                <HorizontalBarChart
                  items={chartData.state}
                  title="Home State"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default DemographicsPage;
