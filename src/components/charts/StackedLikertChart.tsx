import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { LikertCounts, computeMeanStd, SurveyRow, buildCsvRows, downloadCsv } from '../../utils/dataLoader';
import DownloadButton from '../DownloadButton/DownloadButton';
import styles from './StackedLikertChart.module.css';

export interface ChartVariable {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
  counts: LikertCounts;
}

interface Props {
  variables: ChartVariable[];
  title: string;
  data: SurveyRow[];
  showTitle?: boolean;
}

const CATEGORIES = ['Strongly disagree', 'Somewhat disagree', 'Neutral', 'Somewhat agree', 'Strongly agree'];
const COLORS = ['#e25b61', '#f0b3ba', '#ead97c', '#93c4b9', '#2ba88c'];

/** Wrap SVG text into multiple tspans within maxWidth pixels */
function wrapText(
  textEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  fullText: string,
  maxWidth: number,
  lineHeight: number
) {
  const words = fullText.split(/\s+/);
  textEl.text('');
  let line: string[] = [];
  let lineCount = 0;

  // Start first tspan
  let tspan = textEl.append('tspan')
    .attr('x', 0)
    .attr('dy', 0);

  for (const word of words) {
    line.push(word);
    tspan.text(line.join(' '));
    const node = tspan.node() as SVGTSpanElement | null;
    if (node && node.getComputedTextLength() > maxWidth && line.length > 1) {
      line.pop();
      tspan.text(line.join(' '));
      line = [word];
      lineCount++;
      tspan = textEl.append('tspan')
        .attr('x', 0)
        .attr('dy', lineHeight)
        .text(word);
    }
  }
  return lineCount; // number of extra lines added (0 = single line)
}

const StackedLikertChart: React.FC<Props> = ({ variables, title, data, showTitle = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [showTable, setShowTable] = useState(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => setWidth(el.clientWidth));
    obs.observe(el);
    setWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || width === 0 || variables.length === 0) return;

    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body')
        .append('div')
        .attr('class', styles.tooltip)
        .node() as HTMLDivElement;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const marginTop = 56;
    const marginRight = 20;
    const marginBottom = 40;
    const lineH = 14;
    const baseBarH = 38;

    // Measure the actual rendered width of the longest label to avoid wasted whitespace.
    const tempSvg = d3.select(document.body).append('svg')
      .attr('style', 'position:absolute;visibility:hidden;pointer-events:none')
      .attr('width', 0).attr('height', 0);
    const tempG = tempSvg.append('g');

    const rawLabelWidths = variables.map(v => {
      const t = tempG.append('text').attr('font-size', 12).text(v.fullQuestion ?? v.shortLabel);
      const w = (t.node() as SVGTextElement | null)?.getComputedTextLength() ?? 0;
      t.remove();
      return w;
    });
    const maxLabelW = Math.max(...rawLabelWidths);
    // Clamp: min 120px so short labels aren't cramped; max 350px so long labels wrap.
    const textWidth = Math.min(Math.max(maxLabelW + 24, 120), 350);
    const chartWidth = width - textWidth - marginRight;

    // Pre-measure line count for each label at the computed textWidth.
    const labelLineCount: number[] = variables.map(v => {
      const t = tempG.append('text').attr('font-size', 12);
      const extra = wrapText(t, v.fullQuestion ?? v.shortLabel, textWidth * 0.9, lineH);
      t.remove();
      return extra + 1;
    });
    tempSvg.remove();

    // Bar heights based on line count (min baseBarH, grow with wrapping)
    const barHeights = labelLineCount.map(lines => Math.max(baseBarH, lines * lineH + 12));
    const totalInnerH = barHeights.reduce((a, b) => a + b, 0) + (variables.length - 1) * 6; // 6px gap
    const totalH = totalInnerH + marginTop + marginBottom;

    svg
      .attr('width', '100%')
      .attr('height', totalH)
      .attr('viewBox', `0 0 ${width} ${totalH}`)
      .attr('preserveAspectRatio', 'xMinYMid meet');

    const g = svg.append('g').attr('transform', `translate(${textWidth},${marginTop})`);

    // Build manual y positions for variable-height bars
    const yPositions: number[] = [];
    let cumY = 0;
    barHeights.forEach((bh, i) => {
      yPositions.push(cumY);
      cumY += bh + (i < barHeights.length - 1 ? 6 : 0);
    });

    const x = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
    const color = d3.scaleOrdinal<string>().domain(CATEGORIES).range(COLORS);

    // ── Legend ──────────────────────────────────────────────────
    const legend = svg.append('g').attr('transform', `translate(${textWidth + chartWidth / 2}, 22)`);
    const boxW = 12, boxH2 = 12, gap = 6, spacing = 16;
    const itemWidths = CATEGORIES.map(c => boxW + gap + c.length * 6.2);
    const totalLegW = d3.sum(itemWidths) + spacing * (CATEGORIES.length - 1);
    let lx = -totalLegW / 2;
    CATEGORIES.forEach((cat, i) => {
      const item = legend.append('g').attr('transform', `translate(${lx},0)`);
      item.append('rect').attr('width', boxW).attr('height', boxH2).attr('y', -10).attr('fill', color(cat));
      item.append('text').attr('x', boxW + gap).attr('y', 1).attr('font-size', 11).attr('fill', '#333').text(cat);
      lx += itemWidths[i] + spacing;
    });

    // ── Y-axis labels (full question text, wrapped) ──────────────
    const yAxisG = svg.append('g').attr('transform', `translate(${textWidth},${marginTop})`);

    variables.forEach((v, i) => {
      const barH = barHeights[i];
      const yPos = yPositions[i];
      // Vertical center of the bar
      const midY = yPos + barH / 2;
      // We'll position text so it vertically centers within the bar
      const numLines = labelLineCount[i];
      const blockH = numLines * lineH;
      const startDy = midY - blockH / 2 + lineH - 4;

      const textEl = yAxisG.append('text')
        .attr('transform', `translate(-8, ${startDy})`)
        .attr('text-anchor', 'end')
        .attr('font-size', 12)
        .attr('fill', '#333');

      wrapText(textEl, v.fullQuestion ?? v.shortLabel, textWidth * 0.90, lineH);
    });

    // ── X axis ──────────────────────────────────────────────────
    g.append('g')
      .attr('transform', `translate(0,${totalInnerH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', '#ddd'))
      .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#888'));

    // ── Gridlines ────────────────────────────────────────────────
    g.append('g')
      .call(d3.axisBottom(x).ticks(5).tickSize(-totalInnerH).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', '#eee').attr('stroke-dasharray', '3,2'));

    // ── Bars ────────────────────────────────────────────────────
    variables.forEach((v, idx) => {
      const { stronglyDisagree: sd, somewhatDisagree: d2, neutral: n, somewhatAgree: a, stronglyAgree: sa, total } = v.counts;
      if (total === 0) return;
      const counts = [sd, d2, n, a, sa];
      const pcts = counts.map(c => (c / total) * 100);
      const by = yPositions[idx];
      const bh = barHeights[idx];
      let cum = 0;

      CATEGORIES.forEach((cat, ci) => {
        const pct = pcts[ci];
        const bx = x(cum);
        const bw = x(pct);

        g.append('rect')
          .attr('data-category', cat)
          .attr('y', by)
          .attr('x', bx)
          .attr('height', bh)
          .attr('width', 0)
          .attr('fill', color(cat))
          .attr('stroke', '#fff')
          .attr('stroke-width', 0.5)
          .on('mouseenter', function(event: MouseEvent) {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current)
                .html(
                  `<div style="font-weight:600;margin-bottom:3px">${cat}</div>` +
                  `${pct.toFixed(1)}%` +
                  `<div style="font-size:11px;color:#888;margin-top:2px">n = ${counts[ci].toLocaleString()}</div>`
                )
                .style('opacity', '0.97')
                .style('left', (event.pageX + 12) + 'px')
                .style('top', (event.pageY - 36) + 'px');
            }
          })
          .on('mousemove', function(event: MouseEvent) {
            if (tooltipRef.current) {
              d3.select(tooltipRef.current)
                .style('left', (event.pageX + 12) + 'px')
                .style('top', (event.pageY - 36) + 'px');
            }
          })
          .on('mouseleave', function() {
            if (tooltipRef.current) d3.select(tooltipRef.current).style('opacity', '0');
          })
          .transition().duration(800).delay(ci * 50)
          .attr('width', bw);

        if (pct >= 5) {
          g.append('text')
            .attr('y', by + bh / 2)
            .attr('x', bx + bw / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', 11)
            .attr('fill', '#333')
            .style('opacity', 0)
            .style('pointer-events', 'none')
            .text(`${pct.toFixed(1)}%`)
            .transition().duration(400).delay(800 + ci * 50)
            .style('opacity', 1);
        }
        cum += pct;
      });
    });

    return () => {
      if (tooltipRef.current) {
        d3.select(tooltipRef.current).remove();
        tooltipRef.current = null;
      }
    };
  }, [variables, width]);

  const handleDownload = () => {
    const rows = variables.map(v => ({ shortLabel: v.shortLabel, counts: v.counts }));
    downloadCsv(buildCsvRows(rows), `${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  };

  return (
    <div className={styles.chartContainer} ref={containerRef}>
      <div className={styles.titleRow}>
        {showTitle && <h2 className={styles.chartTitle}>{title}</h2>}
        <DownloadButton onClick={handleDownload} />
      </div>

      <svg ref={svgRef} />

      <div className={styles.respondentCount}>
        Number of respondents: {variables[0]?.counts.total.toLocaleString() ?? 0}
      </div>

      <button className={styles.statsToggle} onClick={() => setShowTable(t => !t)}>
        {showTable ? 'Hide' : 'Show'} Summary Statistics {showTable ? '▲' : '▼'}
      </button>

      {showTable && (
        <div className={styles.summaryTableWrap}>
          <table className={styles.summaryTable}>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Mean</th>
                <th>Std Dev</th>
                <th>N</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((v, i) => {
                const s = computeMeanStd(data, v.key);
                return (
                  <tr key={v.key} style={{ background: i % 2 === 0 ? 'white' : '#f5f5f5' }}>
                    <td>{v.fullQuestion ?? v.shortLabel}</td>
                    <td>{s.n > 0 ? s.mean.toFixed(2) : '—'}</td>
                    <td>{s.n > 0 ? s.std.toFixed(2) : '—'}</td>
                    <td>{s.n > 0 ? s.n.toLocaleString() : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StackedLikertChart;
