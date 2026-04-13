import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeLikertCounts, computeGenericCounts, computeDistribution, computeSelectionRate,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import StackedLikertChart, { ChartVariable } from '../charts/StackedLikertChart';
import GenericStackedBarChart, { GenericChartVariable } from '../charts/GenericStackedBarChart';
import HorizontalBarChart, { BarItem } from '../charts/HorizontalBarChart';
import {
  FAMILIARITY_CATEGORIES, FAMILIARITY_COLORS, FAMILIARITY_SHORT, FAMILIARITY_VARIABLES,
  RH_ATTITUDE_VARIABLES,
  CHANGE_CATEGORIES, CHANGE_COLORS, CHANGE_VARIABLES,
  RH_SERVICETYPE_CATS, RH_TRIPTIME_CATS, RH_TRIPPURP_CATS, RH_MONTHEXPEND_CATS,
  RH_COMPANION_VARIABLES, RH_ALTERNMODE_CATS,
  RH_WAITTIME_BINS, RH_DURATION_BINS, RH_TRIPCOST_BINS,
  RH_ADDTIME_CATS, RH_ADDTIME_SHORT,
  BES_SERVICETYPE_CATS, BES_TRIPTIME_CATS, BES_TRIPLENGTH_CATS,
  BES_PURPOSE_CATS, BES_PURPOSE_LABELS, BES_REASONS, BES_ALTERNMODE_CATS,
  MOBILITY_NAV,
} from './mobilityData';
import './MobilityPage.css';

const TOP_MENU_H = 65;

/* ── helpers ────────────────────────────────────────────── */
function toCatItems(dist: { label: string; count: number }[], total: number): BarItem[] {
  return dist.map(d => ({ label: d.label, count: d.count, total }));
}
function toOrderedItems(data: SurveyRow[], variable: string, cats: string[], labelMap?: Record<string, string>): BarItem[] {
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
const SKIP_SET = new Set(['Seen but not answered', 'Appropriate skip', 'Missing (other)', 'Option not selected']);

function binNumeric(
  data: SurveyRow[], variable: string,
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
  return bins.map((bin, i) => ({ label: bin.label, count: counts[i], total })).filter(it => it.count > 0);
}

function toBinaryItems(data: SurveyRow[], vars: { key: string; shortLabel: string; selectedValue?: string }[]): BarItem[] {
  const rates = vars.map(v => computeSelectionRate(data, v.key, v.selectedValue!));
  const total = rates[0]?.total ?? 0;
  return vars.map((v, i) => ({ label: v.shortLabel, count: rates[i].selected, total: rates[i].total }))
    .sort((a, b) => b.count - a.count);
}

const MobilityPage: React.FC = () => {
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

  // ── Scroll spy ───────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const mainArea = document.querySelector('.main-area') as HTMLElement | null;
    if (!mainArea) return;
    const TRIGGER = TOP_MENU_H + 40;
    const onScroll = () => {
      if (isScrollingRef.current) return;
      const atBottom = mainArea.scrollHeight - mainArea.scrollTop - mainArea.clientHeight < 80;
      if (atBottom) { setCurrentCluster(MOBILITY_NAV[MOBILITY_NAV.length - 1].id); return; }
      let activeId = MOBILITY_NAV[0].id;
      for (const nav of MOBILITY_NAV) {
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

  // ── Scroll-to on param change ────────────────────────────
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

  const setRef = useCallback((id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; }, []);

  // ── Pre-compute all chart data ───────────────────────────
  const chartData = useMemo(() => {
    const n = filteredData.length;

    // 1. Familiarity
    const familiarity: GenericChartVariable[] = FAMILIARITY_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, FAMILIARITY_CATEGORIES);
      return { ...v, counts, total };
    });

    // 2. RH Attitudes (standard Likert)
    const rhAttitudes: ChartVariable[] = RH_ATTITUDE_VARIABLES.map(v => ({
      ...v, counts: computeLikertCounts(filteredData, v.key),
    }));

    // 3. RH Usage Context
    const rhServiceDist = computeDistribution(filteredData, 'rh_servicetype');
    const rhServiceTotal = rhServiceDist.reduce((a, b) => a + b.count, 0);
    const rhService: BarItem[] = toOrderedItems(filteredData, 'rh_servicetype', RH_SERVICETYPE_CATS);
    const rhTime: BarItem[] = toOrderedItems(filteredData, 'rh_triptime', RH_TRIPTIME_CATS);
    const rhWaitTime: BarItem[] = binNumeric(filteredData, 'rh_tripwait', RH_WAITTIME_BINS);
    const rhDuration: BarItem[] = binNumeric(filteredData, 'rh_tripduration', RH_DURATION_BINS);
    const rhTripCost: BarItem[] = binNumeric(filteredData, 'rh_tripcost_value', RH_TRIPCOST_BINS);
    const rhPurp: BarItem[] = toOrderedItems(filteredData, 'rh_trippurp', RH_TRIPPURP_CATS);
    const rhCompanion: BarItem[] = toBinaryItems(filteredData, RH_COMPANION_VARIABLES);
    const rhAltern: BarItem[] = toOrderedItems(filteredData, 'rh_alternmode', RH_ALTERNMODE_CATS);

    // 3b. Shared ridehailing additional time tolerance
    const rhAddTime: BarItem[] = toOrderedItems(filteredData, 'rh_addtimeshare', RH_ADDTIME_CATS, RH_ADDTIME_SHORT)
      .sort((a, b) => {
        const order = ['1–5 min','6–10 min','11–15 min','16+ min','Would not use shared'];
        return order.indexOf(a.label) - order.indexOf(b.label);
      });

    // 4. Monthly Spending
    const spendDist = computeDistribution(filteredData, 'rh_monthexpend');
    const spendTotal = spendDist.reduce((a, b) => a + b.count, 0);
    const rhSpend: BarItem[] = RH_MONTHEXPEND_CATS
      .map(cat => ({ label: cat.trim(), count: spendDist.find(d => d.label === cat)?.count ?? 0, total: spendTotal }))
      .filter(it => it.count > 0);

    // 5. Impact on modes
    const rhImpact: GenericChartVariable[] = CHANGE_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, CHANGE_CATEGORIES);
      return { ...v, counts, total };
    });

    // 6. Bike/Scooter trip details
    const besService: BarItem[] = toOrderedItems(filteredData, 'bes_servicetype', BES_SERVICETYPE_CATS);
    const besTime: BarItem[] = toOrderedItems(filteredData, 'bes_triptime', BES_TRIPTIME_CATS);
    const besLength: BarItem[] = toOrderedItems(filteredData, 'bes_triplength', BES_TRIPLENGTH_CATS);
    const besPurpose: BarItem[] = toOrderedItems(filteredData, 'bes_purpose', BES_PURPOSE_CATS, BES_PURPOSE_LABELS);

    // 7. BES Reasons (binary)
    const besReasons: BarItem[] = toBinaryItems(filteredData, BES_REASONS);

    // 8. BES Alternative mode
    const besAltern: BarItem[] = toOrderedItems(filteredData, 'bes_alternmode', BES_ALTERNMODE_CATS);

    return { familiarity, rhAttitudes, rhService, rhTime, rhWaitTime, rhDuration, rhTripCost, rhPurp, rhCompanion, rhAltern, rhAddTime, rhSpend, rhImpact, besService, besTime, besLength, besPurpose, besReasons, besAltern, n };
  }, [filteredData]);

  /* ── Render ─────────────────────────────────────────────── */
  const Section = ({ id, title, surveyQuestion, children }: { id: string; title: string; surveyQuestion?: string; children: React.ReactNode }) => (
    <div data-cluster-id={id} ref={setRef(id)} className="cluster-section">
      <div className="cluster-section-header">
        <h2 className="cluster-title">{title}</h2>
        {surveyQuestion && <p className="cluster-survey-question">{surveyQuestion}</p>}
      </div>
      {children}
    </div>
  );

  const SubChart = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mob-subchart">
      <h3 className="mob-subchart-title">{title}</h3>
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
            {/* Familiarity & Adoption */}
            <Section id="familiarity" title="Familiarity & Adoption" surveyQuestion="How often do you generally use the following transportation services?">
              <GenericStackedBarChart
                variables={chartData.familiarity}
                categories={FAMILIARITY_CATEGORIES}
                colors={FAMILIARITY_COLORS}
                categoryShortLabels={FAMILIARITY_SHORT}
                title="Service Familiarity & Usage"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* Ridehailing: Attitudes */}
            <Section id="ridehailing-attitudes" title="Attitudes Toward Ridehailing" surveyQuestion="Please rate your level of agreement with each of the following statements about ridehailing services (e.g., Uber/Lyft).">
              <StackedLikertChart
                variables={chartData.rhAttitudes}
                title="Attitudes Toward Ridehailing"
                data={filteredData}
                showTitle={false}
              />
            </Section>

            {/* Ridehailing: Usage Context */}
            <Section id="ridehailing-usage" title="Usage Context (Trip Details)" surveyQuestion="Considering the last trip you recall using ridehailing services, please answer the following questions.">
              <div className="mob-grid">
                <SubChart title="Service Type">
                  <HorizontalBarChart items={chartData.rhService} title="Service Type" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="Time of Trip">
                  <HorizontalBarChart items={chartData.rhTime} title="Time of Trip" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="Wait Time">
                  <HorizontalBarChart items={chartData.rhWaitTime} title="Wait Time" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="In-Vehicle Travel Time">
                  <HorizontalBarChart items={chartData.rhDuration} title="In-Vehicle Travel Time" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="Trip Cost">
                  <HorizontalBarChart items={chartData.rhTripCost} title="Trip Cost" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="Trip Purpose">
                  <HorizontalBarChart items={chartData.rhPurp} title="Trip Purpose" showTitle={false} color="#507DBC" />
                </SubChart>
                <SubChart title="Travel Companions">
                  <HorizontalBarChart items={chartData.rhCompanion} title="Travel Companions" showTitle={false} color="#507DBC"
                    note="% of ridehailing users who traveled in each way (respondents could select multiple)" />
                </SubChart>
                <SubChart title="Alternative Mode (Without Ridehailing)">
                  <HorizontalBarChart items={chartData.rhAltern} title="Alternative Mode" showTitle={false} color="#507DBC" />
                </SubChart>
              </div>
            </Section>

            {/* Ridehailing: Monthly Expenditures */}
            <Section id="ridehailing-spending" title="Monthly Expenditures" surveyQuestion="In the last month, about how much did you spend on ridehailing (such as Uber/Lyft) services?">
              <HorizontalBarChart
                items={chartData.rhSpend}
                title="Monthly Ridehailing Expenditure"
                showTitle={false}
                color="#e25b61"
              />
            </Section>

            {/* Ridehailing: Shared Ridehailing Preference */}
            <Section id="ridehailing-shared" title="Shared Ridehailing Preference" surveyQuestion="Assume that shared ridehailing (e.g., uberPOOL or Lyft Share) was available for this trip, allowing for cheaper fares but longer travel times to reach your destination. What is the maximum additional travel time you would have accepted if you had received a 50% discount?">
              <HorizontalBarChart
                items={chartData.rhAddTime}
                title="Additional Time Tolerance for Shared Ridehailing"
                showTitle={false}
                color="#507DBC"
              />
            </Section>

            {/* Ridehailing: Impact on Other Modes */}
            <Section id="ridehailing-impact" title="Impact on Other Modes" surveyQuestion="After beginning to use ridehailing services, how has your use of each of the following means of transportation changed?">
              <GenericStackedBarChart
                variables={chartData.rhImpact}
                categories={CHANGE_CATEGORIES}
                colors={CHANGE_COLORS}
                title="Impact on Other Modes"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* Bike/Scooter: Last Trip Details */}
            <Section id="bikescooter-trips" title="Last Trip Details" surveyQuestion="Considering the last trip you made using bikesharing or e-scooter sharing, please answer the following questions.">
              <div className="mob-grid">
                <SubChart title="Service Type">
                  <HorizontalBarChart items={chartData.besService} title="Service Type" showTitle={false} color="#2ba88c" />
                </SubChart>
                <SubChart title="Time of Trip">
                  <HorizontalBarChart items={chartData.besTime} title="Time of Trip" showTitle={false} color="#2ba88c" />
                </SubChart>
                <SubChart title="Trip Length">
                  <HorizontalBarChart items={chartData.besLength} title="Trip Length" showTitle={false} color="#2ba88c" />
                </SubChart>
                <SubChart title="Trip Purpose">
                  <HorizontalBarChart items={chartData.besPurpose} title="Trip Purpose" showTitle={false} color="#2ba88c" />
                </SubChart>
              </div>
            </Section>

            {/* Bike/Scooter: Reasons for Using Service */}
            <Section id="bikescooter-reasons" title="Reasons for Using Service" surveyQuestion="Why did you use this service for the trip?">
              <HorizontalBarChart
                items={chartData.besReasons}
                title="Reasons for Using Bike/Scooter Sharing"
                showTitle={false}
                color="#2ba88c"
              />
            </Section>

            {/* Bike/Scooter: Alternative Mode */}
            <Section id="bikescooter-alternative" title="Alternative Mode" surveyQuestion="How would you have made this trip if the shared bikes or e-scooters were not available?">
              <HorizontalBarChart
                items={chartData.besAltern}
                title="Alternative Mode"
                showTitle={false}
                color="#2ba88c"
              />
            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default MobilityPage;
