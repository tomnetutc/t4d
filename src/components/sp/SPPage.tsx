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
  SP2_RANK_CATS, SP2_RANK_COLORS, SP2_RANK_SHORT,
  SP2_SCENARIOS, SP2_OPTION_LABELS, SP2ScenarioKey,
  SP_RANK_CATS, SP_RANK_COLORS, SP_RANK_SHORT,
  SP_RANK_VARIABLES, SP_RANK_AIRPORT_VARIABLES, SP_RANK_PURPOSES,
  SP_RANK_DROPDOWN_OPTIONS, SP_RANK_ATTR_MODES, RankPurposeKey,
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

interface AttrRow {
  label:   string;
  waitMin: number | null;
  ivttMin: number | null;
  costUSD: number | null;
}

function computeRankAttributes(subset: SurveyRow[], includesBike: boolean): AttrRow[] {
  const modes = includesBike ? SP_RANK_ATTR_MODES : SP_RANK_ATTR_MODES.filter(m => !m.isBike);
  return modes.map(m => {
    let waitMin: number | null = null;
    let ivttMin: number | null = null;
    let costUSD: number | null = null;
    for (const row of subset) {
      if (waitMin === null) {
        const v = row[m.wtCol];
        if (v !== undefined && v !== null && v !== '') waitMin = Number(v);
      }
      if (ivttMin === null) {
        const v = row[m.ivttCol];
        if (v !== undefined && v !== null && v !== '') ivttMin = Number(v);
      }
      if (costUSD === null) {
        const v = row[m.costCol];
        if (v !== undefined && v !== null && v !== '') costUSD = Number(v);
      }
      if (waitMin !== null && ivttMin !== null && costUSD !== null) break;
    }
    return { label: m.label, waitMin, ivttMin, costUSD };
  });
}

function fmtWait(v: number | null): string {
  if (v === null) return '—';
  if (v === 0) return 'No wait';
  return `${v} min`;
}

function fmtCost(v: number | null): string {
  if (v === null) return '—';
  return `$${v.toFixed(2)}`;
}

function fmtIvtt(v: number | null): string {
  if (v === null) return '—';
  return `${v} min`;
}

function fmtFC(v: number | null): string {
  if (v === null) return '—';
  if (v === 0) return '$0/month';
  return `$${Math.round(v)}/month`;
}

function fmtVC(v: number | null): string {
  if (v === null) return '—';
  return `$${v.toFixed(2)}/mile`;
}

type SP2Scen = typeof SP2_SCENARIOS[number];
type SP2AttrRow = { label: string; fc: number | null; vc: number | null; wait: number | null };

function buildScenarioHint(attrRows: SP2AttrRow[]): string {
  const av = attrRows.find(r => r.label === SP2_OPTION_LABELS.av);
  const rh = attrRows.find(r => r.label === SP2_OPTION_LABELS.rh);
  if (!av || !rh) return '';
  const parts: string[] = [];
  if (av.fc !== null) parts.push(`AV: ${fmtFC(av.fc)}`);
  if (av.vc !== null) parts.push(`+ ${fmtVC(av.vc)} per mile`);
  if (rh.vc !== null) parts.push(`· Ridehailing: ${fmtVC(rh.vc)} per mile`);
  if (rh.wait !== null && rh.wait > 0) parts.push(`(${rh.wait} min avg wait)`);
  return parts.join(' ');
}

function computeSP2Attributes(
  data: SurveyRow[],
  scen: SP2Scen,
): Array<{ label: string; fc: number | null; vc: number | null; wait: number | null }> {
  const opts = [
    { label: SP2_OPTION_LABELS.reg, cols: scen.attrCols.reg },
    { label: SP2_OPTION_LABELS.av,  cols: scen.attrCols.av  },
    { label: SP2_OPTION_LABELS.rh,  cols: scen.attrCols.rh  },
  ] as const;
  return opts.map(({ label, cols }) => {
    let fc: number | null = null;
    let vc: number | null = null;
    let wait: number | null = null;
    for (const row of data) {
      if (fc === null) {
        const v = row[cols.fc];
        if (v !== undefined && v !== null && v !== '' && v !== 'Missing (other)') fc = Number(v);
      }
      if (vc === null) {
        const v = row[cols.vc];
        if (v !== undefined && v !== null && v !== '' && v !== 'Missing (other)') vc = Number(v);
      }
      if (wait === null) {
        const v = row[cols.wait];
        if (v !== undefined && v !== null && v !== '' && v !== 'Missing (other)') wait = Number(v);
      }
      if (fc !== null && vc !== null && wait !== null) break;
    }
    return { label, fc, vc, wait };
  });
}

const SPPage: React.FC = () => {
  const { section } = useParams<{ section: string }>();
  const { setCurrentCluster } = useCurrentCluster();
  const [allData, setAllData] = useState<SurveyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { applyFilters, filters } = useFilters();
  const [selectedPurposeKey, setSelectedPurposeKey] = useState<RankPurposeKey>('dining');
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<SP2ScenarioKey>('A');

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
    const sp1Stacked = computeSP1Stacked(filteredData);

    // SP-Rank: kept for scroll-spy reference — not rendered as 4 charts anymore
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

    return { sp1Stacked, spRankByPurpose };
  }, [filteredData]);

  // ── Selected-purpose data for the interactive mode-ranking section ──
  const selectedPurposeData = useMemo(() => {
    const opt = SP_RANK_DROPDOWN_OPTIONS.find(o => o.key === selectedPurposeKey)!;
    const subset = filteredData.filter(r =>
      ((r['SP_Rank_Purpose_str'] as string) || '').toLowerCase().includes(opt.csvMatch)
    );
    const isAirport = opt.key === 'airport';
    const modeVars  = isAirport ? SP_RANK_AIRPORT_VARIABLES : SP_RANK_VARIABLES;
    const cats      = isAirport
      ? SP_RANK_CATS.slice(0, 6)
      : SP_RANK_CATS;
    const vars: GenericChartVariable[] = modeVars.map(v => {
      const { counts, total } = computeGenericCounts(subset, v.key, cats);
      return { ...v, counts, total };
    });
    const attrRows = computeRankAttributes(subset, !isAirport);
    return { opt, subset, vars, cats, attrRows, n: subset.length };
  }, [filteredData, selectedPurposeKey]);

  // ── Selected-scenario data for AV Adoption Modality ─────────
  const selectedScenarioData = useMemo(() => {
    const scen = SP2_SCENARIOS.find(s => s.key === selectedScenarioKey)!;
    const optKeys: Array<'reg' | 'av' | 'rh'> = ['reg', 'av', 'rh'];
    const vars: GenericChartVariable[] = optKeys.map(k => {
      const { counts, total } = computeGenericCounts(filteredData, scen.rankCols[k], SP2_RANK_CATS);
      return { key: k, shortLabel: SP2_OPTION_LABELS[k], counts, total };
    });
    const attrRows = computeSP2Attributes(filteredData, scen);
    const n = vars[0].total;
    return { scen, vars, attrRows, n };
  }, [filteredData, selectedScenarioKey]);

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
              title="Private vs Shared Ridehailing"
            >
              <p className="cluster-survey-question sp-rank-question">
                Imagine that you call a ride through a smartphone app. For each of{' '}
                <strong>the trip purposes</strong> below, check whether you would choose
                the <strong>private</strong> (Option 1) or <strong>shared</strong>{' '}
                (Option 2) ridehailing options based on the trip features presented
                (trip cost, travel time, and the presence of additional passengers).{' '}
                <em>Select only one option <strong>in each row</strong>.{' '}
                Note that the travel times for shared ridehailing include both your
                waiting time and the extra time picking up/dropping off other
                passengers.</em>
              </p>
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

            {/* SP2: AV Adoption Modality */}
            <Section id="av-purchase" title="AV Adoption Modality">
              {/* Scenario tabs */}
              <div className="sp-tab-group">
                <span className="sp-tab-group-label">Scenario:</span>
                <div className="sp-tab-pills">
                  {SP2_SCENARIOS.map(s => (
                    <button
                      key={s.key}
                      className={`sp-tab${selectedScenarioKey === s.key ? ' sp-tab--active' : ''}`}
                      onClick={() => setSelectedScenarioKey(s.key)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="sp-tab-hint">{buildScenarioHint(selectedScenarioData.attrRows)}</p>

              {/* Question text */}
              <p className="cluster-survey-question sp-rank-question">
                Suppose AVs are now available for purchase, lease/rent, or to use via automated
                ridehailing services, and{' '}
                <strong>half of the vehicles on the streets are AVs</strong>.{' '}
                What would you do when{' '}
                <strong>faced with your next car purchase decision</strong>{' '}
                in each of the following scenarios? Please rank the alternatives{' '}
                <strong>based on your preference (1=most preferred; 3=least preferred)</strong>.{' '}
                <em>Please do not give the same rank to multiple alternatives.</em>
              </p>

              {/* Attribute table */}
              <div className="sp-scenario-table" style={{ marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Option</th>
                      <th>Monthly fixed cost</th>
                      <th>Per-mile variable cost</th>
                      <th>Average wait time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScenarioData.attrRows.map(row => (
                      <tr key={row.label}>
                        <td><strong>{row.label}</strong></td>
                        <td>{fmtFC(row.fc)}</td>
                        <td>{fmtVC(row.vc)}</td>
                        <td>{fmtWait(row.wait)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Chart */}
              <GenericStackedBarChart
                variables={selectedScenarioData.vars}
                categories={SP2_RANK_CATS}
                colors={SP2_RANK_COLORS}
                categoryShortLabels={SP2_RANK_SHORT}
                title={`AV Adoption Modality — ${selectedScenarioData.scen.label}`}
                showTitle={false}
                showSummaryTable={false}
                respondentCount={selectedScenarioData.n}
              />
            </Section>

            {/* SP-Rank: Mode Ranking by Trip Purpose */}
            <Section
              id="mode-ranking"
              title="Mode Ranking by Trip Purpose"
            >
              {/* Trip Purpose tabs */}
              <div className="sp-tab-group">
                <span className="sp-tab-group-label">Trip Purpose:</span>
                <div className="sp-tab-pills">
                  {SP_RANK_DROPDOWN_OPTIONS.map(o => (
                    <button
                      key={o.key}
                      className={`sp-tab${selectedPurposeKey === o.key ? ' sp-tab--active' : ''}`}
                      onClick={() => setSelectedPurposeKey(o.key)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic question text */}
              <p className="cluster-survey-question sp-rank-question">
                {selectedPurposeData.opt.scenarioText}{' '}
                You have the following{' '}
                {selectedPurposeData.opt.numAlts === 6 ? 'six' : 'seven'}{' '}
                options for your transportation. Rank the alternatives listed from most preferred
                (Rank 1) to least preferred (Rank {selectedPurposeData.opt.numAlts}).{' '}
                <em>Please do not give the same rank to multiple alternatives.</em>
              </p>

              {/* Attribute table */}
              <div className="sp-scenario-table" style={{ marginBottom: 20 }}>
                <table>
                  <thead>
                    <tr>
                      <th>Alternative</th>
                      <th>Wait time</th>
                      <th>In-vehicle travel time</th>
                      <th>Cost for entire trip</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPurposeData.attrRows.map(row => (
                      <tr key={row.label}>
                        <td><strong>{row.label}</strong></td>
                        <td>{fmtWait(row.waitMin)}</td>
                        <td>{fmtIvtt(row.ivttMin)}</td>
                        <td>{fmtCost(row.costUSD)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Single dynamic chart */}
              <GenericStackedBarChart
                variables={selectedPurposeData.vars}
                categories={selectedPurposeData.cats}
                colors={SP_RANK_COLORS.slice(0, selectedPurposeData.cats.length)}
                categoryShortLabels={SP_RANK_SHORT.slice(0, selectedPurposeData.cats.length)}
                title={`Mode Ranking — ${selectedPurposeData.opt.label} (n = ${selectedPurposeData.n.toLocaleString()})`}
                showTitle={false}
                showSummaryTable={false}
                respondentCount={selectedPurposeData.n}
              />
            </Section>
          </>
        )}
      </div>
    </>
  );
};

export default SPPage;
