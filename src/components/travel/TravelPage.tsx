import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeGenericCounts, computeDistribution,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import HorizontalBarChart, { BarItem } from '../charts/HorizontalBarChart';
import GenericStackedBarChart, { GenericChartVariable } from '../charts/GenericStackedBarChart';
import HorizontalGroupedBarChart, { GroupedBarGroup } from '../charts/HorizontalGroupedBarChart';
import PieChart, { PieSlice } from '../charts/PieChart';
import {
  TRAVEL_NAV,
  EMPLOYMENT_CATS, EMPLOYMENT_SHORT,
  COMFREQ_CATS, COMFREQ_SHORT, COMFREQ_COLORS, COM_FREQ_VARIABLES,
  DISTANCE_BINS, TIME_BINS,
  COM_MODE_CATS, COM_MODE_SHORT,
  MODEFREQ_CATS, MODEFREQ_SHORT, MODEFREQ_COLORS,
  COM_FRQ_VARIABLES, NCOM_FRQ_VARIABLES,
  CONDITIONS_CATS, CONDITIONS_SHORT, CONDITIONS_COLORS, CONDITIONS_VARIABLES,
  MILES_CATS, MILES_SHORT,
  DELIVERY_CATS, DELIVERY_SHORT, DELIVERY_COLORS, DELIVERY_VARIABLES,
  LD_LEISURE_VARS, LD_BIZ_VARS, LD_SERIES,
} from './travelData';
import './TravelPage.css';

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

function buildPieSlices(
  data: SurveyRow[],
  variable: string,
  sliceDefs: Array<{ value: string; label: string; color: string }>
): PieSlice[] {
  const dist = computeDistribution(data, variable);
  return sliceDefs.map(def => ({
    label: def.label,
    count: dist.find(d => d.label === def.value)?.count ?? 0,
    color: def.color,
  })).filter(s => s.count > 0);
}

function computeNumericMean(data: SurveyRow[], variable: string, cap = 50): { mean: number; n: number } {
  const vals: number[] = [];
  for (const row of data) {
    const v = row[variable];
    if (!v || SKIP_SET.has(v)) continue;
    const n = parseFloat(v);
    if (!isNaN(n)) vals.push(Math.min(n, cap));
  }
  if (!vals.length) return { mean: 0, n: 0 };
  return { mean: vals.reduce((a, b) => a + b, 0) / vals.length, n: vals.length };
}

const TravelPage: React.FC = () => {
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
      if (atBottom) { setCurrentCluster(TRAVEL_NAV[TRAVEL_NAV.length - 1].id); return; }
      let activeId = TRAVEL_NAV[0].id;
      for (const nav of TRAVEL_NAV) {
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
    const target = mainArea.scrollTop + el.getBoundingClientRect().top - mainArea.getBoundingClientRect().top - TOP_MENU_H - 12;
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
    // [1] Employment
    const employment: BarItem[] = toOrderedItems(filteredData, 'employment', EMPLOYMENT_CATS, EMPLOYMENT_SHORT);

    // [2] Commute frequency (days 0-7)
    const comFreq: GenericChartVariable[] = COM_FREQ_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, COMFREQ_CATS);
      return { ...v, counts, total };
    });

    // [3] Commute distance & time (binned)
    const comDistance: BarItem[] = binNumeric(filteredData, 'com_distance', DISTANCE_BINS);
    const comTime: BarItem[]     = binNumeric(filteredData, 'com_time', TIME_BINS);

    // [4] Primary commute mode
    const comMode: BarItem[] = toOrderedItems(filteredData, 'com_mode', COM_MODE_CATS, COM_MODE_SHORT);

    // [5] Mode frequency — commute trips
    const comModeFreq: GenericChartVariable[] = COM_FRQ_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, MODEFREQ_CATS);
      return { ...v, counts, total };
    });

    // [6] Mode frequency — non-commute trips
    const ncomModeFreq: GenericChartVariable[] = NCOM_FRQ_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, MODEFREQ_CATS);
      return { ...v, counts, total };
    });

    // [7] Conditions limiting travel
    const conditions: GenericChartVariable[] = CONDITIONS_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, CONDITIONS_CATS);
      return { ...v, counts, total };
    });

    // [8] Average miles driven
    const milesDriven: BarItem[] = toOrderedItems(filteredData, 'avgmlsdriven', MILES_CATS, MILES_SHORT);

    // [9] Adults with driving limitations (pie)
    const adultsNoDrive: PieSlice[] = buildPieSlices(filteredData, 'hh_adultnodrive', [
      { value: 'Yes', label: 'Yes — adults with limitations', color: '#e25b61' },
      { value: 'No',  label: 'No',                            color: '#2ba88c' },
    ]);

    // [10] Delivery frequency
    const deliveryFreq: GenericChartVariable[] = DELIVERY_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, DELIVERY_CATS);
      return { ...v, counts, total };
    });

    // [11] Long-distance trips — grouped bar (mean trips per mode × purpose)
    const ldGroups: GroupedBarGroup[] = LD_LEISURE_VARS.map((lv, i) => {
      const bv = LD_BIZ_VARS[i];
      const leisure = computeNumericMean(filteredData, lv.key);
      const biz     = computeNumericMean(filteredData, bv.key);
      return {
        groupLabel: lv.shortLabel,
        values: [leisure.mean, biz.mean],
        ns:     [leisure.n,    biz.n],
      };
    });

    // [12] Airport visits (pie)
    const airportVisit: PieSlice[] = buildPieSlices(filteredData, 'airportvisit', [
      { value: 'Yes', label: 'Yes', color: '#3580b8' },
      { value: 'No',  label: 'No',  color: '#c5c5c5' },
    ]);

    return {
      employment, comFreq, comDistance, comTime, comMode,
      comModeFreq, ncomModeFreq, conditions, milesDriven,
      adultsNoDrive, deliveryFreq, ldGroups, airportVisit,
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
            {/* ── Subsection: Commute Patterns ──────────────────── */}
            <Section id="commute-patterns" title="Commute Patterns">

              {/* [1] Employment / Student Status */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Employment / Student Status</h3>
                <HorizontalBarChart
                  items={chartData.employment}
                  title="Employment / Student Status"
                  showTitle={false}
                  color="#2d7fa8"
                />
              </div>

              {/* [2] Commute Frequency */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Commute Frequency (days per week)</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Days per week traveling to work, to school, and telecommuting.
                </p>
                <GenericStackedBarChart
                  variables={chartData.comFreq}
                  categories={COMFREQ_CATS}
                  colors={COMFREQ_COLORS}
                  categoryShortLabels={COMFREQ_SHORT}
                  title="Commute Frequency"
                  showTitle={false}
                  showSummaryTable={false}
                />
              </div>

              {/* [3] Commute Distance */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Commute Distance (miles)</h3>
                <HorizontalBarChart
                  items={chartData.comDistance}
                  title="Commute Distance"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              {/* [3] Commute Time */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">One-Way Commute Time (minutes)</h3>
                <HorizontalBarChart
                  items={chartData.comTime}
                  title="One-Way Commute Time"
                  showTitle={false}
                  color="#5b9fbf"
                />
              </div>

              {/* [4] Primary Commute Mode */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Primary Commute Mode</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Means of transportation used most often for commute.
                </p>
                <HorizontalBarChart
                  items={chartData.comMode}
                  title="Primary Commute Mode"
                  showTitle={false}
                  color="#2ba88c"
                />
              </div>

            </Section>

            {/* ── Subsection: Commute Mode Frequency ───────────── */}
            <Section id="commute-mode-frequency" title="Mode Use for Commute Trips">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                Frequency of use for each transportation mode for trips to work/school.
              </p>
              <GenericStackedBarChart
                variables={chartData.comModeFreq}
                categories={MODEFREQ_CATS}
                colors={MODEFREQ_COLORS}
                categoryShortLabels={MODEFREQ_SHORT}
                title="Mode Use for Commute Trips"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* ── Subsection: Non-Commute Mode Frequency ───────── */}
            <Section id="noncommute-mode-frequency" title="Mode Use for Non-Commute Trips">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                Frequency of use for each transportation mode for errands, shopping, social, and recreational trips.
              </p>
              <GenericStackedBarChart
                variables={chartData.ncomModeFreq}
                categories={MODEFREQ_CATS}
                colors={MODEFREQ_COLORS}
                categoryShortLabels={MODEFREQ_SHORT}
                title="Mode Use for Non-Commute Trips"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* ── Subsection: Conditions & Miles Driven ────────── */}
            <Section id="conditions-miles" title="Conditions & Miles Driven">

              {/* [7] Conditions Limiting Travel */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Conditions Limiting Travel</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Do you have conditions that prevent or limit driving, transit use, biking, or walking?
                </p>
                <GenericStackedBarChart
                  variables={chartData.conditions}
                  categories={CONDITIONS_CATS}
                  colors={CONDITIONS_COLORS}
                  categoryShortLabels={CONDITIONS_SHORT}
                  title="Conditions Limiting Travel"
                  showTitle={false}
                  showSummaryTable={true}
                />
              </div>

              {/* [8] Average Miles Driven */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Average Miles Driven per Week</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Average miles driven in a typical week, excluding on-the-clock driving.
                </p>
                <HorizontalBarChart
                  items={chartData.milesDriven}
                  title="Average Miles Driven per Week"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>

              {/* [9] Adults with Driving Limitations */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Adults in Household with Driving Limitations</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Does anyone in your household have a condition that partially or fully limits their ability to drive?
                </p>
                <PieChart
                  slices={chartData.adultsNoDrive}
                  title="Adults with Driving Limitations"
                  showTitle={false}
                />
              </div>

            </Section>

            {/* ── Subsection: Deliveries to Home ───────────────── */}
            <Section id="deliveries" title="Deliveries to Home">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                In the past 30 days, how many times were the following items delivered to your home?
              </p>
              <GenericStackedBarChart
                variables={chartData.deliveryFreq}
                categories={DELIVERY_CATS}
                colors={DELIVERY_COLORS}
                categoryShortLabels={DELIVERY_SHORT}
                title="Delivery Frequency"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* ── Subsection: Long-Distance Travel ─────────────── */}
            <Section id="long-distance" title="Long-Distance Travel">

              {/* [11] Long-Distance Trips (grouped bar — means) */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Long-Distance Trip Frequency by Mode & Purpose</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Average number of long-distance trips (75+ miles one-way) since the beginning of the year, by mode and purpose.
                </p>
                <HorizontalGroupedBarChart
                  groups={chartData.ldGroups}
                  series={LD_SERIES}
                  title="Long-Distance Trips"
                  showTitle={false}
                  valueUnit="avg. trips"
                  showSummaryTable={true}
                />
              </div>

              {/* [12] Airport Visits */}
              <div className="travel-subchart">
                <h3 className="travel-subchart-title">Airport Visits</h3>
                <p style={{ fontSize: 13, color: '#888', margin: '0 0 10px' }}>
                  Have you visited the local airport to travel or to pick up/drop off someone?
                </p>
                <PieChart
                  slices={chartData.airportVisit}
                  title="Airport Visits"
                  showTitle={false}
                />
              </div>

            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default TravelPage;
