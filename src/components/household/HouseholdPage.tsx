import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeGenericCounts, computeDistribution, computeSelectionRate,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import HorizontalBarChart, { BarItem } from '../charts/HorizontalBarChart';
import GenericStackedBarChart, { GenericChartVariable } from '../charts/GenericStackedBarChart';
import PieChart, { PieSlice } from '../charts/PieChart';
import {
  HOUSEHOLD_NAV,
  DRIVER_SLICES,
  HH_VEH_CATS, HH_NDRIVERS_CATS,
  VEHICLE_FUEL_CATS, VEHICLE_FUEL_SHORT,
  VEHICLE_MILES_CATS, VEHICLE_MILES_SHORT,
  MODEL_YEAR_BINS, MAKE_NORM, TOP_MAKES_COUNT,
  ADAS_CATS, ADAS_COLORS, ADAS_VARIABLES,
  HOUSUNIT_SLICES,
  TENURE_CATS, TENURE_SHORT,
  HOME_YRMOVED_BINS,
  HOMELOC_CATS, HOMELOC_SHORT, HOMELOC_COLORS, HOMELOC_VARIABLES,
} from './householdData';
import './HouseholdPage.css';

const TOP_MENU_H = 65;
const SKIP_SET = new Set(['Seen but not answered', 'Appropriate skip', 'Missing (other)']);

/* ── helpers ─────────────────────────────────────────────── */
function toOrderedItems(
  data: SurveyRow[], variable: string, cats: string[], labelMap?: Record<string, string>
): BarItem[] {
  const dist = computeDistribution(data, variable);
  const total = dist.reduce((a, b) => a + b.count, 0);
  return cats
    .map(cat => {
      const found = dist.find(d => d.label === cat);
      return {
        label: labelMap?.[cat] ?? cat,
        fullLabel: cat,
        count: found?.count ?? 0,
        total,
      };
    })
    .filter(it => it.count > 0)
    .sort((a, b) => b.count - a.count);
}

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

/** Bin a numeric variable into labeled buckets and return BarItems. */
function binNumeric(
  data: SurveyRow[],
  variable: string,
  bins: Array<{ label: string; min: number; max: number }>
): BarItem[] {
  const counts = new Array(bins.length).fill(0);
  let total = 0;
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_SET.has(v)) continue;
    const n = parseFloat(v);
    if (isNaN(n)) continue;
    total++;
    for (let i = 0; i < bins.length; i++) {
      if (n >= bins[i].min && n < bins[i].max) { counts[i]++; break; }
    }
  }
  return bins
    .map((bin, i) => ({ label: bin.label, count: counts[i], total }))
    .filter(it => it.count > 0);
}

/** Cap integer values at a threshold, returning BarItems for labeled categories. */
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

/** Normalize a raw vehicle make string. */
function normalizeMake(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'Other';
  const titled = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  // Re-uppercase all-caps brands after title-casing
  const upperCheck = trimmed.toUpperCase();
  if (upperCheck === 'BMW' || upperCheck === 'GMC' || upperCheck === 'KIA' || upperCheck === 'VW') {
    return MAKE_NORM[titled] ?? upperCheck;
  }
  return MAKE_NORM[titled] ?? titled;
}

/** Compute top-N vehicle makes from free-text field. */
function computeTopMakes(data: SurveyRow[], topN: number): BarItem[] {
  const counts: Record<string, number> = {};
  let total = 0;
  for (const row of data) {
    const v = row['veh1_make'];
    if (!v || SKIP_SET.has(v)) continue;
    total++;
    const make = normalizeMake(v);
    counts[make] = (counts[make] || 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, topN);
  return sorted.map(([label, count]) => ({ label, count, total }));
}

const HouseholdPage: React.FC = () => {
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
      if (atBottom) { setCurrentCluster(HOUSEHOLD_NAV[HOUSEHOLD_NAV.length - 1].id); return; }
      let activeId = HOUSEHOLD_NAV[0].id;
      for (const nav of HOUSEHOLD_NAV) {
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
    // [1] Driver's license
    const driver: PieSlice[] = buildPieSlices(filteredData, 'driver', DRIVER_SLICES);

    // [2] Household vehicles (0–5+)
    const hhVeh: BarItem[] = computeCappedCounts(filteredData, 'hh_veh', HH_VEH_CATS, 5);

    // [3] Household drivers (0–5+)
    const hhDrivers: BarItem[] = computeCappedCounts(filteredData, 'hh_ndrivers', HH_NDRIVERS_CATS, 5);

    // [4a] Fuel type
    const vehFuel: BarItem[] = toOrderedItems(filteredData, 'veh1_fuel', VEHICLE_FUEL_CATS, VEHICLE_FUEL_SHORT);

    // [4b] Annual miles
    const vehMiles: BarItem[] = toOrderedItems(filteredData, 'veh1_miles', VEHICLE_MILES_CATS, VEHICLE_MILES_SHORT);

    // [4c] Model year (binned)
    const vehModYr: BarItem[] = binNumeric(filteredData, 'veh1_modyr', MODEL_YEAR_BINS);

    // [4d] Top vehicle makes (normalized, top N)
    const vehMakes: BarItem[] = computeTopMakes(filteredData, TOP_MAKES_COUNT);

    // [5] ADAS features — shown as stacked (Has feature / Does not have)
    const adasVars: GenericChartVariable[] = ADAS_VARIABLES.map(v => {
      const { selected, total } = computeSelectionRate(filteredData, v.key, v.selectedValue!);
      return {
        key: v.key,
        shortLabel: v.shortLabel,
        counts: { 'Has feature': selected, 'Does not have': total - selected },
        total,
      };
    });

    // [6] Housing type
    const housUnit: PieSlice[] = buildPieSlices(filteredData, 'housunit', HOUSUNIT_SLICES);

    // [7] Tenure
    const tenure: BarItem[] = toOrderedItems(filteredData, 'tenure', TENURE_CATS, TENURE_SHORT);

    // [8a] Year moved (binned)
    const yrMoved: BarItem[] = binNumeric(filteredData, 'home_yrmoved', HOME_YRMOVED_BINS);

    // [8b] Chose home location (Yes/No)
    const homeChosen: BarItem[] = (() => {
      const dist = computeDistribution(filteredData, 'home_chosen');
      const total = dist.reduce((a, b) => a + b.count, 0);
      return ['Yes', 'No']
        .map(label => ({
          label,
          count: dist.find(d => d.label === label)?.count ?? 0,
          total,
        }))
        .filter(it => it.count > 0);
    })();

    // [9] Home location preferences (4-pt scale)
    const homeLocPrefs: GenericChartVariable[] = HOMELOC_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, HOMELOC_CATS);
      return { ...v, counts, total };
    });

    return {
      driver, hhVeh, hhDrivers,
      vehFuel, vehMiles, vehModYr, vehMakes,
      adasVars,
      housUnit, tenure, yrMoved, homeChosen,
      homeLocPrefs,
    };
  }, [filteredData]);

  /* ── Render ──────────────────────────────────────────────── */
  const Section = ({ id, title, surveyQuestion, children }: { id: string; title: string; surveyQuestion?: string; children: React.ReactNode }) => (
    <div data-cluster-id={id} ref={setRef(id)} className="cluster-section">
      <div className="cluster-section-header">
        <h2 className="cluster-title">{title}</h2>
        {surveyQuestion && <p className="cluster-survey-question">{surveyQuestion}</p>}
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
            {/* ── Subsection: Licensing & Vehicle Ownership ──── */}
            <Section id="licensing-ownership" title="Licensing & Vehicle Ownership">

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Driver's License</h3>
                <p className="cluster-survey-question">Do you have a driver's license?</p>
                <PieChart
                  slices={chartData.driver}
                  title="Driver's License"
                  showTitle={false}
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Household Vehicles Available</h3>
                <p className="cluster-survey-question">How many motorized vehicles (including four-wheelers and two-wheelers) are available in your household?</p>
                <HorizontalBarChart
                  items={chartData.hhVeh}
                  title="Household Vehicles"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Licensed Drivers in Household</h3>
                <p className="cluster-survey-question">How many people in your household have a driver's license (including you)?</p>
                <HorizontalBarChart
                  items={chartData.hhDrivers}
                  title="Household Drivers"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

            </Section>

            {/* ── Subsection: Vehicle Fleet Details ────────── */}
            <Section id="vehicle-fleet" title="Vehicle Fleet Details">

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Vehicle 1 — Fuel Type</h3>
                <p className="cluster-survey-question">Please provide details of all motorized vehicles available to your household. Report the vehicle you use most often as Vehicle 1.</p>
                <HorizontalBarChart
                  items={chartData.vehFuel}
                  title="Vehicle 1 Fuel Type"
                  showTitle={false}
                  color="#2ba88c"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Vehicle 1 — Annual Miles Driven</h3>
                <p className="cluster-survey-question">Annual miles driven by all drivers (estimate) for Vehicle 1.</p>
                <HorizontalBarChart
                  items={chartData.vehMiles}
                  title="Vehicle 1 Annual Miles"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Vehicle 1 — Model Year</h3>
                <p className="cluster-survey-question">Model year of Vehicle 1.</p>
                <HorizontalBarChart
                  items={chartData.vehModYr}
                  title="Vehicle 1 Model Year"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Vehicle 1 — Top Makes</h3>
                <p className="cluster-survey-question">Vehicle make of Vehicle 1.</p>
                <HorizontalBarChart
                  items={chartData.vehMakes}
                  title="Top Vehicle Makes"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">ADAS Features in Vehicle 1</h3>
                <p className="cluster-survey-question">Which of the following driving assistance features does Vehicle 1 have? Please check all that apply.</p>
                <GenericStackedBarChart
                  variables={chartData.adasVars}
                  categories={ADAS_CATS}
                  colors={ADAS_COLORS}
                  categoryShortLabels={ADAS_CATS}
                  title="ADAS Features"
                  showTitle={false}
                  showSummaryTable={true}
                />
              </div>

            </Section>

            {/* ── Subsection: Housing & Tenure ──────────────── */}
            <Section id="housing-tenure" title="Housing & Tenure">

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Housing Type</h3>
                <p className="cluster-survey-question">What best describes the home you currently live in?</p>
                <PieChart
                  slices={chartData.housUnit}
                  title="Housing Type"
                  showTitle={false}
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Home Ownership / Tenure</h3>
                <p className="cluster-survey-question">Do you rent or own your home?</p>
                <HorizontalBarChart
                  items={chartData.tenure}
                  title="Tenure"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Year Moved to Current Address</h3>
                <p className="cluster-survey-question">What year did you move to your current address (e.g., 2010)?</p>
                <HorizontalBarChart
                  items={chartData.yrMoved}
                  title="Year Moved"
                  showTitle={false}
                  color="#507DBC"
                />
              </div>

              <div className="hh-subchart">
                <h3 className="hh-subchart-title">Chose Current Home Location</h3>
                <p className="cluster-survey-question">Did you choose your current home location?</p>
                <HorizontalBarChart
                  items={chartData.homeChosen}
                  title="Chose Home Location"
                  showTitle={false}
                  color="#2ba88c"
                />
              </div>

            </Section>

            {/* ── Subsection: Home Location Preferences ─────── */}
            <Section id="home-location" title="Home Location Preferences" surveyQuestion="When choosing your home and neighborhood, how important were the following features to you?">
              <GenericStackedBarChart
                variables={chartData.homeLocPrefs}
                categories={HOMELOC_CATS}
                colors={HOMELOC_COLORS}
                categoryShortLabels={HOMELOC_SHORT}
                title="Home Location Preferences"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default HouseholdPage;
