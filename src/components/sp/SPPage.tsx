import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  loadSurveyData, SurveyRow,
  computeGenericCounts, computeDistribution,
} from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import TopMenu from '../TopMenu/TopMenu';
import GenericStackedBarChart, { GenericChartVariable } from '../charts/GenericStackedBarChart';
import HorizontalBarChart, { BarItem } from '../charts/HorizontalBarChart';
import {
  SP_NAV,
  SP1_CATS, SP1_SHORT, SP1_SCENARIOS,
  SP2_RANK_CATS, SP2_RANK_COLORS, SP2_RANK_SHORT,
  SP2_SCEN1_VARIABLES, SP2_SCEN2_VARIABLES,
  SP_RANK_CATS, SP_RANK_COLORS, SP_RANK_SHORT, SP_RANK_VARIABLES,
} from './spData';
import './SPPage.css';

const TOP_MENU_H = 65;

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
    // SP1: Private vs. Shared — per scenario
    const sp1Scenarios = SP1_SCENARIOS.map(v => ({
      label: v.shortLabel,
      items: toOrderedItems(filteredData, v.key, SP1_CATS, SP1_SHORT),
    }));

    // SP2: AV Purchase ranking — Scenario 1
    const sp2Scen1: GenericChartVariable[] = SP2_SCEN1_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, SP2_RANK_CATS);
      return { ...v, counts, total };
    });

    // SP2: AV Purchase ranking — Scenario 2
    const sp2Scen2: GenericChartVariable[] = SP2_SCEN2_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, SP2_RANK_CATS);
      return { ...v, counts, total };
    });

    // SP-Rank: 7-mode ranking
    const spRank: GenericChartVariable[] = SP_RANK_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, SP_RANK_CATS);
      return { ...v, counts, total };
    });

    return { sp1Scenarios, sp2Scen1, sp2Scen2, spRank };
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
            {/* SP1: Private vs. Shared */}
            <Section id="private-shared" title="Ridehailing SP: Private vs. Shared">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                Choice between private and shared ridehailing under varying cost, time, and passenger scenarios.
              </p>
              {chartData.sp1Scenarios.map(scen => (
                <div key={scen.label} className="sp-subchart">
                  <h3 className="sp-subchart-title">{scen.label}</h3>
                  <HorizontalBarChart
                    items={scen.items}
                    title={scen.label}
                    showTitle={false}
                    color="#507DBC"
                  />
                </div>
              ))}
            </Section>

            {/* SP2: AV Purchase SP */}
            <Section id="av-purchase" title="AV Purchase SP">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                Ranking of buying a regular vehicle, buying an AV, or using AV ridehailing under different price scenarios. (1 = most preferred, 3 = least preferred)
              </p>
              <div className="sp-subchart">
                <h3 className="sp-subchart-title">Scenario 1</h3>
                <GenericStackedBarChart
                  variables={chartData.sp2Scen1}
                  categories={SP2_RANK_CATS}
                  colors={SP2_RANK_COLORS}
                  categoryShortLabels={SP2_RANK_SHORT}
                  title="AV Purchase SP — Scenario 1"
                  showTitle={false}
                  showSummaryTable={false}
                />
              </div>
              <div className="sp-subchart">
                <h3 className="sp-subchart-title">Scenario 2</h3>
                <GenericStackedBarChart
                  variables={chartData.sp2Scen2}
                  categories={SP2_RANK_CATS}
                  colors={SP2_RANK_COLORS}
                  categoryShortLabels={SP2_RANK_SHORT}
                  title="AV Purchase SP — Scenario 2"
                  showTitle={false}
                  showSummaryTable={false}
                />
              </div>
            </Section>

            {/* SP-Rank: 7-Mode Ranking */}
            <Section id="mode-ranking" title="AV Mode Choice SP: 7-Mode Ranking">
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                Rank 7 transportation alternatives from most to least preferred. (1 = most preferred, 7 = least preferred)
              </p>
              <GenericStackedBarChart
                variables={chartData.spRank}
                categories={SP_RANK_CATS}
                colors={SP_RANK_COLORS}
                categoryShortLabels={SP_RANK_SHORT}
                title="AV Mode Choice SP: 7-Mode Ranking"
                showTitle={false}
                showSummaryTable={false}
              />
            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default SPPage;
