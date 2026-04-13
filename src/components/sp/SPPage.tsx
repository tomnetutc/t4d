import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeGenericCounts,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import GenericStackedBarChart, { GenericChartVariable } from '../charts/GenericStackedBarChart';
import {
  SP_NAV,
  SP1_CATS, SP1_COLORS, SP1_SHORT_LABELS, SP1_PURPOSES, SP1_PURPOSE_NORMALIZE, SP1_SCENARIOS,
  SP2_RANK_CATS, SP2_RANK_COLORS, SP2_RANK_SHORT, SP2_COMBINED_VARIABLES,
  SP_RANK_CATS, SP_RANK_COLORS, SP_RANK_SHORT,
  SP_RANK_VARIABLES, SP_RANK_AIRPORT_VARIABLES, SP_RANK_PURPOSES,
} from './spData';
import './SPPage.css';

const TOP_MENU_H = 65;
const SP1_SKIP = new Set(['Seen but not answered', 'Missing (other)']);

/* ── helpers ─────────────────────────────────────────────── */

/**
 * Aggregate SP1 choices across all 3 scenario positions.
 * Returns one GenericChartVariable per trip purpose (rows = purposes, stacks = private/shared).
 */
function computeSP1Stacked(data: SurveyRow[]): GenericChartVariable[] {
  const pvt: Record<string, number> = { 'Social/Leisure': 0, 'Shopping': 0, 'Work/School': 0 };
  const shr: Record<string, number> = { 'Social/Leisure': 0, 'Shopping': 0, 'Work/School': 0 };

  for (const row of data) {
    for (const i of [1, 2, 3]) {
      const motive     = row[`SP1_Scen${i}_Motive`] as string;
      const answer     = row[`SP1_Scen${i}_Answer`]  as string;
      const normalized = SP1_PURPOSE_NORMALIZE[motive];
      if (!normalized || !answer || SP1_SKIP.has(answer)) continue;
      if (answer === SP1_CATS[0]) pvt[normalized]++;
      else if (answer === SP1_CATS[1]) shr[normalized]++;
    }
  }

  return SP1_PURPOSES.map(purpose => ({
    key:        purpose,
    shortLabel: purpose,
    counts: {
      [SP1_CATS[0]]: pvt[purpose],
      [SP1_CATS[1]]: shr[purpose],
    },
    total: pvt[purpose] + shr[purpose],
  }));
}

const SPPage: React.FC = () => {
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
      if (atBottom) { setCurrentCluster(SP_NAV[SP_NAV.length - 1].id); return; }
      let activeId = SP_NAV[0].id;
      for (const nav of SP_NAV) {
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

  const setRef = useCallback((id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; }, []);

  // ── Pre-compute all chart data ───────────────────────────────
  const chartData = useMemo(() => {
    // SP1: choice by trip purpose across all 3 scenario positions (stacked private|shared)
    const sp1Stacked = computeSP1Stacked(filteredData);

    // SP2: AV Purchase ranking — combined across both scenarios A and B
    const sp2Combined: GenericChartVariable[] = SP2_COMBINED_VARIABLES.map(v => {
      const a = computeGenericCounts(filteredData, v.keys[0], SP2_RANK_CATS);
      const b = computeGenericCounts(filteredData, v.keys[1], SP2_RANK_CATS);
      const counts: Record<string, number> = {};
      SP2_RANK_CATS.forEach(c => { counts[c] = (a.counts[c] || 0) + (b.counts[c] || 0); });
      return { key: v.keys[0], shortLabel: v.shortLabel, counts, total: a.total + b.total };
    });

    // SP-Rank: 7-mode ranking by trip purpose
    // Airport respondents had 6 alternatives (Bike was not offered)
    const spRankByPurpose = SP_RANK_PURPOSES.map(p => {
      const subset = filteredData.filter(r =>
        ((r['SP_Rank_Purpose_str'] as string) || '').toLowerCase().includes(p.match)
      );
      const modeVars = p.key === 'airport' ? SP_RANK_AIRPORT_VARIABLES : SP_RANK_VARIABLES;
      const vars: GenericChartVariable[] = modeVars.map(v => {
        const { counts, total } = computeGenericCounts(subset, v.key, SP_RANK_CATS);
        return { ...v, counts, total };
      });
      return { ...p, vars, n: subset.length };
    });

    return { sp1Stacked, sp2Combined, spRankByPurpose };
  }, [filteredData]);

  /* ── Render ──────────────────────────────────────────────── */
  const Section = ({ id, title, surveyQuestion, children }: {
    id: string; title: string; surveyQuestion?: string; children: React.ReactNode;
  }) => (
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
            {/* SP1: Private vs. Shared */}
            <Section
              id="private-shared"
              title="Ridehailing SP: Private vs. Shared"
              surveyQuestion="Imagine that you call a ride through a smartphone app. For each of the trip purposes below, check whether you would choose the private (Option 1) or shared (Option 2) ridehailing options based on the trip features presented (trip cost, travel time, and the presence of additional passengers). Select only one option in each row. Note that the travel times for shared ridehailing include both your waiting time and the extra time picking up/dropping off other passengers."
            >
              <div className="sp-scenario-table" style={{ marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Trip Purpose</th>
                      <th>Option 1: Private ridehailing (e.g., Uber and Lyft)</th>
                      <th>Option 2: Shared ridehailing (e.g., uberPOOL and Lyft Share)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SP1_SCENARIOS.map(s => (
                      <tr key={s.purpose}>
                        <td><strong>{s.purpose}</strong></td>
                        <td>{s.privateDesc}</td>
                        <td>{s.sharedDesc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <GenericStackedBarChart
                variables={chartData.sp1Stacked}
                categories={SP1_CATS}
                colors={SP1_COLORS}
                categoryShortLabels={SP1_SHORT_LABELS}
                title="Ridehailing SP: Private vs. Shared"
                showTitle={false}
                showSummaryTable={false}
              />
            </Section>

            {/* SP2: AV Purchase SP */}
            <Section
              id="av-purchase"
              title="Buy Regular vs. AV vs. AV Ridehailing"
              surveyQuestion="Suppose AVs are now available for purchase, lease/rent, or to use via automated ridehailing services, and half of the vehicles on the streets are AVs. What would you do when faced with your next car purchase decision in each of the following scenarios? Please rank the alternatives based on your preference (1=most preferred; 3=least preferred). Please do not give the same rank to multiple alternatives."
            >
              <GenericStackedBarChart
                variables={chartData.sp2Combined}
                categories={SP2_RANK_CATS}
                colors={SP2_RANK_COLORS}
                categoryShortLabels={SP2_RANK_SHORT}
                title="Buy Regular vs. AV vs. AV Ridehailing"
                showTitle={false}
                showSummaryTable={false}
              />
            </Section>

            {/* SP-Rank: 7-Mode Ranking by trip purpose */}
            <Section
              id="mode-ranking"
              title="AV Mode Choice SP: Mode Ranking by Trip Purpose"
              surveyQuestion="You have the following options for your transportation. Rank the alternatives listed from most preferred (Rank 1) to least preferred (Rank 7). Please do not give the same rank to multiple alternatives."
            >

              {chartData.spRankByPurpose.map(({ key, label, vars, n }) => (
                <div key={key} className="sp-subchart">
                  <h3 className="sp-subchart-title">
                    {label}
                    <span style={{ fontSize: 12, fontWeight: 400, color: '#aaa', marginLeft: 8 }}>
                      (n = {n.toLocaleString()})
                    </span>
                  </h3>
                  <GenericStackedBarChart
                    variables={vars}
                    categories={SP_RANK_CATS}
                    colors={SP_RANK_COLORS}
                    categoryShortLabels={SP_RANK_SHORT}
                    title={label}
                    showTitle={false}
                    showSummaryTable={false}
                  />
                </div>
              ))}
            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default SPPage;
