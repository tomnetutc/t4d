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
  AV_NAV,
  AV_FAMILIARITY_CATS, AV_FAMILIARITY_SHORT,
  AV_TIMEPURCHASE_CATS, AV_WILLPAY_CATS,
  AV_ATT_VARIABLES, AV_POLICY_VARIABLES, AV_RH_VARIABLES,
  AV_CHANGE_OWN_CATS,
  AV_MODECHANGE_CATS, AV_MODECHANGE_COLORS, AV_MODECHANGE_SHORT, AV_MODECHANGE_VARIABLES,
  AV_COMMUTE_CATS, AV_COMMUTE_SHORT,
  AV_MULTI_VARIABLES,
  AV_LIFESTYLE_CATS, AV_LIFESTYLE_COLORS, AV_LIFESTYLE_SHORT, AV_LIFESTYLE_VARIABLES,
} from './avData';
import './AVPage.css';

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

function toBinaryItems(
  data: SurveyRow[], vars: { key: string; shortLabel: string; selectedValue?: string }[]
): BarItem[] {
  return vars
    .map(v => {
      const { selected, total } = computeSelectionRate(data, v.key, v.selectedValue!);
      return { label: v.shortLabel, count: selected, total };
    })
    .sort((a, b) => b.count - a.count);
}

const AVPage: React.FC = () => {
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
      if (atBottom) { setCurrentCluster(AV_NAV[AV_NAV.length - 1].id); return; }
      let activeId = AV_NAV[0].id;
      for (const nav of AV_NAV) {
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
    // E1: Familiarity
    const familiarity: BarItem[] = toOrderedItems(filteredData, 'av_familiarity', AV_FAMILIARITY_CATS, AV_FAMILIARITY_SHORT);

    // E5: Purchase Intentions
    const timePurchase: BarItem[] = toOrderedItems(filteredData, 'av_timepurchase', AV_TIMEPURCHASE_CATS);

    // E6: Willingness to Pay
    const willPay: BarItem[] = toOrderedItems(filteredData, 'av_willpay', AV_WILLPAY_CATS);

    // E2: General AV Attitudes (standard Likert)
    const avAtt: ChartVariable[] = AV_ATT_VARIABLES.map(v => ({
      ...v, counts: computeLikertCounts(filteredData, v.key),
    }));

    // E10: Safety & Policy Attitudes (standard Likert)
    const avPolicy: ChartVariable[] = AV_POLICY_VARIABLES.map(v => ({
      ...v, counts: computeLikertCounts(filteredData, v.key),
    }));

    // E7: AV Ridehailing Attitudes (standard Likert)
    const avRh: ChartVariable[] = AV_RH_VARIABLES.map(v => ({
      ...v, counts: computeLikertCounts(filteredData, v.key),
    }));

    // E8: Vehicle Ownership Change
    const ownChange: BarItem[] = toOrderedItems(filteredData, 'av_change_hhcarown', AV_CHANGE_OWN_CATS);

    // E9: Mode Choice Impact (3-pt change scale)
    const modeChange: GenericChartVariable[] = AV_MODECHANGE_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, AV_MODECHANGE_CATS);
      return { ...v, counts, total };
    });

    // E3: Commute Time
    const commute: BarItem[] = toOrderedItems(filteredData, 'av_addcomtime', AV_COMMUTE_CATS, AV_COMMUTE_SHORT);

    // E12: Multitasking (binary multi-select)
    const multiTask: BarItem[] = toBinaryItems(filteredData, AV_MULTI_VARIABLES);

    // E4: Lifestyle Changes (likelihood scale)
    const lifestyle: GenericChartVariable[] = AV_LIFESTYLE_VARIABLES.map(v => {
      const { counts, total } = computeGenericCounts(filteredData, v.key, AV_LIFESTYLE_CATS);
      return { ...v, counts, total };
    });

    const n = filteredData.length;
    return { familiarity, timePurchase, willPay, avAtt, avPolicy, avRh, ownChange, modeChange, commute, multiTask, lifestyle, n };
  }, [filteredData]);

  /* ── Render ──────────────────────────────────────────────── */
  const Section = ({ id, title, meta, children }: { id: string; title: string; meta?: string; children: React.ReactNode }) => (
    <div data-cluster-id={id} ref={setRef(id)} className="cluster-section">
      <div className="cluster-section-header">
        <h2 className="cluster-title">{title}</h2>
        {meta && <p className="cluster-meta">{meta}</p>}
      </div>
      {children}
    </div>
  );

  const metaText = `n = ${chartData.n.toLocaleString()} respondents`;

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
            {/* E1: Familiarity */}
            <Section id="familiarity" title="AV Familiarity" meta={metaText}>
              <HorizontalBarChart
                items={chartData.familiarity}
                title="AV Familiarity"
                showTitle={false}
                color="#5b9fbf"
              />
            </Section>

            {/* E5 + E6: Purchase & WTP */}
            <Section id="purchase-wtp" title="AV Purchase & Willingness to Pay" meta={metaText}>
              <div className="av-subchart">
                <h3 className="av-subchart-title">AV Purchase Intentions</h3>
                <HorizontalBarChart
                  items={chartData.timePurchase}
                  title="AV Purchase Intentions"
                  showTitle={false}
                  color="#3580b8"
                />
              </div>
              <div className="av-subchart">
                <h3 className="av-subchart-title">Willingness to Pay</h3>
                <HorizontalBarChart
                  items={chartData.willPay}
                  title="Willingness to Pay"
                  showTitle={false}
                  color="#2d7fa8"
                />
              </div>
            </Section>

            {/* E2: General AV Attitudes */}
            <Section id="attitudes" title="General Attitudes Toward AVs" meta={metaText}>
              <StackedLikertChart
                variables={chartData.avAtt}
                title="General Attitudes Toward AVs"
                data={filteredData}
                showTitle={false}
              />
            </Section>

            {/* E10: Safety & Policy */}
            <Section id="safety-policy" title="AV Policy" meta={metaText}>
              <StackedLikertChart
                variables={chartData.avPolicy}
                title="AV Policy"
                data={filteredData}
                showTitle={false}
              />
            </Section>

            {/* E7: AV Ridehailing Attitudes */}
            <Section id="ridehailing-attitudes" title="AV Ridehailing Attitudes" meta={metaText}>
              <StackedLikertChart
                variables={chartData.avRh}
                title="AV Ridehailing Attitudes"
                data={filteredData}
                showTitle={false}
              />
            </Section>

            {/* E8: Vehicle Ownership */}
            <Section id="vehicle-ownership" title="Change in Vehicle Ownership" meta={metaText}>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                How might your household's car ownership change when AVs become available?
              </p>
              <HorizontalBarChart
                items={chartData.ownChange}
                title="Change in Vehicle Ownership"
                showTitle={false}
                color="#e25b61"
              />
            </Section>

            {/* E9: Mode Choice Impact */}
            <Section id="mode-choice" title="AV Impact on Mode Choice" meta={metaText}>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                If you had access to an AV, how would your use of each mode change?
              </p>
              <GenericStackedBarChart
                variables={chartData.modeChange}
                categories={AV_MODECHANGE_CATS}
                colors={AV_MODECHANGE_COLORS}
                categoryShortLabels={AV_MODECHANGE_SHORT}
                title="AV Impact on Mode Choice"
                showTitle={false}
                showSummaryTable={true}
              />
            </Section>

            {/* E3: Commute */}
            <Section id="commute" title="AV & Commute" meta={metaText}>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                How much longer would you be willing to commute if you had access to an AV?
              </p>
              <HorizontalBarChart
                items={chartData.commute}
                title="AV & Commute"
                showTitle={false}
                color="#ead97c"
              />
            </Section>

            {/* E12: Multitasking */}
            <Section id="travel-experiences" title="Expected Travel Experiences" meta={metaText}>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                What activities would you do during a trip in an AV? (respondents selected up to three)
              </p>
              <HorizontalBarChart
                items={chartData.multiTask}
                title="Expected Travel Experiences"
                showTitle={false}
                color="#2ba88c"
              />
            </Section>

            {/* E4: Lifestyle Changes */}
            <Section id="lifestyle-changes" title="Anticipated Changes in Lifestyles" meta={metaText}>
              <p style={{ fontSize: 13, color: '#888', margin: '0 0 12px' }}>
                How likely are you to make each of the following changes if you had access to an AV?
              </p>
              <GenericStackedBarChart
                variables={chartData.lifestyle}
                categories={AV_LIFESTYLE_CATS}
                colors={AV_LIFESTYLE_COLORS}
                categoryShortLabels={AV_LIFESTYLE_SHORT}
                title="Anticipated Changes in Lifestyles"
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

export default AVPage;
