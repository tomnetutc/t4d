import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { loadSurveyData, computeLikertCounts, SurveyRow } from '../../utils/dataLoader';
import { useFilters } from '../../context/FilterContext';
import { useCurrentCluster } from '../../context/CurrentClusterContext';
import { CLUSTERS } from './clustersData';
import StackedLikertChart, { ChartVariable } from '../charts/StackedLikertChart';
import TopMenu from '../TopMenu/TopMenu';
import './ClusterPage.css';

const TOP_MENU_H = 65;

const ClusterPage: React.FC = () => {
  const { cluster } = useParams<{ cluster: string }>();
  const { setCurrentCluster } = useCurrentCluster();
  const [allData, setAllData] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { applyFilters, filters } = useFilters();

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // True while a sidebar-click scroll is in flight — suppresses scroll-spy updates
  const isScrollingRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadSurveyData()
      .then(d => { setAllData(d); setLoading(false); })
      .catch(e => { setError(String(e)); setLoading(false); });
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filteredData = useMemo(() => applyFilters(allData), [allData, filters]);

  // ── Scroll spy: passive scroll listener on .main-area ──────────────────────
  // Updates sidebar highlight via context — no navigate(), no re-renders
  useEffect(() => {
    if (loading) return;
    const mainArea = document.querySelector('.main-area') as HTMLElement | null;
    if (!mainArea) return;

    // Trigger line: 80px below the top of the scrollable area (just below TopMenu)
    const TRIGGER_OFFSET = TOP_MENU_H + 40;

    const onScroll = () => {
      if (isScrollingRef.current) return;

      // If scrolled to the very bottom, always highlight the last cluster
      const atBottom = mainArea.scrollHeight - mainArea.scrollTop - mainArea.clientHeight < 80;
      if (atBottom) {
        setCurrentCluster(CLUSTERS[CLUSTERS.length - 1].id);
        return;
      }

      // Walk clusters top-to-bottom; the last one whose top ≤ trigger line is active
      let activeId = CLUSTERS[0].id;
      for (const c of CLUSTERS) {
        const el = sectionRefs.current[c.id];
        if (!el) continue;
        const elTop = el.getBoundingClientRect().top - mainArea.getBoundingClientRect().top;
        if (elTop <= TRIGGER_OFFSET) activeId = c.id;
      }
      setCurrentCluster(activeId);
    };

    mainArea.addEventListener('scroll', onScroll, { passive: true });
    // Run once immediately to set the initial active state
    onScroll();
    return () => mainArea.removeEventListener('scroll', onScroll);
  }, [loading, setCurrentCluster]);

  // ── Programmatic scroll: when URL cluster param changes (sidebar click) ────
  const scrollToSection = useCallback((id: string) => {
    const el = sectionRefs.current[id];
    const mainArea = document.querySelector('.main-area') as HTMLElement | null;
    if (!el || !mainArea) return;

    const elTop = el.getBoundingClientRect().top - mainArea.getBoundingClientRect().top;
    const target = mainArea.scrollTop + elTop - TOP_MENU_H - 12;

    // Suppress scroll-spy while animating
    isScrollingRef.current = true;
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, 900);

    setCurrentCluster(id); // highlight immediately on click
    mainArea.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [setCurrentCluster]);

  useEffect(() => {
    if (loading || !cluster) return;
    const t = setTimeout(() => scrollToSection(cluster), 100);
    return () => clearTimeout(t);
  }, [cluster, loading, scrollToSection]);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const clusterChartData = useMemo(() =>
    CLUSTERS.map(c => ({
      ...c,
      chartVars: c.variables.map(v => ({
        key: v.key,
        shortLabel: v.shortLabel,
        fullQuestion: v.fullQuestion,
        counts: computeLikertCounts(filteredData, v.key),
      })) as ChartVariable[],
    })),
    [filteredData]
  );

  const setRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => { sectionRefs.current[id] = el; },
    []
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

        {error && (
          <div className="clusters-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && clusterChartData.map(c => (
          <div
            key={c.id}
            data-cluster-id={c.id}
            ref={setRef(c.id)}
            className="cluster-section"
          >
            <div className="cluster-section-header">
              <h2 className="cluster-title">{c.name}</h2>
            </div>
            <StackedLikertChart
              variables={c.chartVars}
              title={c.name}
              data={filteredData}
              showTitle={false}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ClusterPage;
