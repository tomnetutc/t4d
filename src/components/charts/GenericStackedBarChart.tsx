import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import * as d3 from 'd3';
import { SurveyRow, downloadCsv } from '../../utils/dataLoader';
import DownloadButton from '../DownloadButton/DownloadButton';
import styles from './GenericStackedBarChart.module.css';

export interface GenericChartVariable {
  key: string;
  shortLabel: string;
  fullQuestion?: string;
  counts: Record<string, number>;
  total: number;
}

interface Props {
  variables: GenericChartVariable[];
  categories: string[];
  colors: string[];
  categoryShortLabels?: string[];
  title: string;
  showTitle?: boolean;
  data?: SurveyRow[];
  showSummaryTable?: boolean;
}

function wrapText(
  textEl: d3.Selection<SVGTextElement, unknown, null, undefined>,
  fullText: string,
  maxWidth: number,
  lineH: number
) {
  const words = fullText.split(/\s+/);
  textEl.text('');
  let line: string[] = [];
  let lineCount = 0;
  let tspan = textEl.append('tspan').attr('x', 0).attr('dy', 0);
  for (const word of words) {
    line.push(word);
    tspan.text(line.join(' '));
    const node = tspan.node() as SVGTSpanElement | null;
    if (node && node.getComputedTextLength() > maxWidth && line.length > 1) {
      line.pop();
      tspan.text(line.join(' '));
      line = [word];
      lineCount++;
      tspan = textEl.append('tspan').attr('x', 0).attr('dy', lineH).text(word);
    }
  }
  return lineCount;
}

const GenericStackedBarChart: React.FC<Props> = ({
  variables, categories, colors, categoryShortLabels,
  title, showTitle = true, showSummaryTable = false,
}) => {
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
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', styles.tooltip).node() as HTMLDivElement;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const marginTop = 56, marginRight = 20, marginBottom = 40;
    const lineH = 14, baseBarH = 38;

    // Measure actual longest label width to avoid wasted whitespace.
    const tempSvg = d3.select(document.body).append('svg')
      .attr('style', 'position:absolute;visibility:hidden;pointer-events:none').attr('width', 0).attr('height', 0);
    const tempG = tempSvg.append('g');

    const rawLabelWidths = variables.map(v => {
      const t = tempG.append('text').attr('font-size', 12).text(v.fullQuestion ?? v.shortLabel);
      const w = (t.node() as SVGTextElement | null)?.getComputedTextLength() ?? 0;
      t.remove();
      return w;
    });
    const maxLabelW = Math.max(...rawLabelWidths);
    const textWidth = Math.min(Math.max(maxLabelW + 24, 120), 350);
    const chartWidth = width - textWidth - marginRight;

    // Pre-measure line counts at the computed textWidth.
    const labelLineCount = variables.map(v => {
      const t = tempG.append('text').attr('font-size', 12);
      const extra = wrapText(t, v.fullQuestion ?? v.shortLabel, textWidth * 0.9, lineH);
      t.remove();
      return extra + 1;
    });
    tempSvg.remove();

    const barHeights = labelLineCount.map(n => Math.max(baseBarH, n * lineH + 12));
    const totalInnerH = barHeights.reduce((a, b) => a + b, 0) + (variables.length - 1) * 6;
    const totalH = totalInnerH + marginTop + marginBottom;

    svg.attr('width', '100%').attr('height', totalH)
      .attr('viewBox', `0 0 ${width} ${totalH}`)
      .attr('preserveAspectRatio', 'xMinYMid meet');

    const g = svg.append('g').attr('transform', `translate(${textWidth},${marginTop})`);

    // Y positions
    const yPositions: number[] = [];
    let cumY = 0;
    barHeights.forEach((bh, i) => {
      yPositions.push(cumY);
      cumY += bh + (i < barHeights.length - 1 ? 6 : 0);
    });

    const x = d3.scaleLinear().domain([0, 100]).range([0, chartWidth]);
    const color = d3.scaleOrdinal<string>().domain(categories).range(colors);

    // Legend
    const legend = svg.append('g').attr('transform', `translate(${textWidth + chartWidth / 2}, 22)`);
    const legLabels = categoryShortLabels || categories;
    const boxW = 12, gap = 6, spacing = 14;
    const itemWidths = legLabels.map(c => boxW + gap + c.length * 6.0);
    const totalLegW = d3.sum(itemWidths) + spacing * (legLabels.length - 1);
    let lx = -totalLegW / 2;
    categories.forEach((cat, i) => {
      const item = legend.append('g').attr('transform', `translate(${lx},0)`);
      item.append('rect').attr('width', boxW).attr('height', 12).attr('y', -10).attr('fill', color(cat));
      item.append('text').attr('x', boxW + gap).attr('y', 1).attr('font-size', 11).attr('fill', '#333').text(legLabels[i] || cat);
      lx += itemWidths[i] + spacing;
    });

    // Y-axis labels
    const yAxisG = svg.append('g').attr('transform', `translate(${textWidth},${marginTop})`);
    variables.forEach((v, i) => {
      const bh = barHeights[i], yPos = yPositions[i], numLines = labelLineCount[i];
      const blockH = numLines * lineH;
      const startDy = yPos + bh / 2 - blockH / 2 + lineH - 4;
      const textEl = yAxisG.append('text')
        .attr('transform', `translate(-8, ${startDy})`)
        .attr('text-anchor', 'end').attr('font-size', 12).attr('fill', '#333');
      wrapText(textEl, v.fullQuestion ?? v.shortLabel, textWidth * 0.90, lineH);
    });

    // X axis
    g.append('g').attr('transform', `translate(0,${totalInnerH})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => `${d}%`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text').attr('font-size', 11).attr('fill', '#888'));
    g.append('g')
      .call(d3.axisBottom(x).ticks(5).tickSize(-totalInnerH).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('line').attr('stroke', '#eee').attr('stroke-dasharray', '3,2'));

    // Bars
    variables.forEach((v, idx) => {
      const by = yPositions[idx], bh = barHeights[idx];
      const total = v.total;
      if (total === 0) return;
      let cum = 0;
      categories.forEach((cat, ci) => {
        const count = v.counts[cat] || 0;
        const pct = (count / total) * 100;
        const bx = x(cum), bw = x(pct);
        g.append('rect')
          .attr('y', by).attr('x', bx).attr('height', bh).attr('width', 0)
          .attr('fill', color(cat)).attr('stroke', '#fff').attr('stroke-width', 0.5)
          .on('mouseenter', function(event: MouseEvent) {
            if (tooltipRef.current)
              d3.select(tooltipRef.current)
                .html(`<div style="font-weight:600;margin-bottom:3px">${categoryShortLabels?.[ci] ?? cat}</div>${pct.toFixed(1)}%<div style="font-size:11px;color:#888;margin-top:2px">n = ${count.toLocaleString()}</div>`)
                .style('opacity', '0.97').style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 36) + 'px');
          })
          .on('mousemove', function(event: MouseEvent) {
            if (tooltipRef.current)
              d3.select(tooltipRef.current).style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 36) + 'px');
          })
          .on('mouseleave', function() { if (tooltipRef.current) d3.select(tooltipRef.current).style('opacity', '0'); })
          .transition().duration(800).delay(ci * 50).attr('width', bw);
        if (pct >= 5)
          g.append('text')
            .attr('y', by + bh / 2).attr('x', bx + bw / 2)
            .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle')
            .attr('font-size', 11).attr('fill', '#333').style('opacity', 0).style('pointer-events', 'none')
            .text(`${pct.toFixed(1)}%`)
            .transition().duration(400).delay(800 + ci * 50).style('opacity', 1);
        cum += pct;
      });
    });

    return () => {
      if (tooltipRef.current) { d3.select(tooltipRef.current).remove(); tooltipRef.current = null; }
    };
  }, [variables, categories, colors, categoryShortLabels, width]);

  const handleDownload = () => {
    const labels = categoryShortLabels || categories;
    const catHeaders = labels.flatMap(l => [l, `${l} %`]).join(',');
    const header = `Question,${catHeaders},Total`;
    const rows = variables.map(v => {
      const vals = categories.flatMap(c => {
        const count = v.counts[c] || 0;
        const pct = v.total > 0 ? `${(count / v.total * 100).toFixed(1)}%` : '0%';
        return [count, pct];
      }).join(',');
      return `"${v.shortLabel}",${vals},${v.total}`;
    });
    downloadCsv([header, ...rows].join('\n'), `${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  };

  return (
    <div className={styles.chartContainer} ref={containerRef}>
      <div className={styles.titleRow}>
        {showTitle && <h2 className={styles.chartTitle}>{title}</h2>}
        <DownloadButton onClick={handleDownload} />
      </div>
      <svg ref={svgRef} />
      <div className={styles.respondentCount}>
        Number of respondents: {variables[0]?.total.toLocaleString() ?? 0}
      </div>
      {showSummaryTable && (
        <>
          <button className={styles.statsToggle} onClick={() => setShowTable(t => !t)}>
            {showTable ? 'Hide' : 'Show'} Summary Statistics {showTable ? '▲' : '▼'}
          </button>
          {showTable && (
            <div className={styles.summaryTableWrap}>
              <table className={styles.summaryTable}>
                <thead>
                  <tr>
                    <th>Variable</th>
                    {(categoryShortLabels || categories).map(c => <th key={c}>{c}</th>)}
                    <th>N</th>
                  </tr>
                </thead>
                <tbody>
                  {variables.map((v, i) => (
                    <tr key={v.key} style={{ background: i % 2 === 0 ? 'white' : '#f5f5f5' }}>
                      <td>{v.shortLabel}</td>
                      {categories.map(c => (
                        <td key={c} style={{ textAlign: 'center' }}>
                          {v.total > 0 ? `${((v.counts[c] || 0) / v.total * 100).toFixed(1)}%` : '—'}
                        </td>
                      ))}
                      <td style={{ textAlign: 'center' }}>{v.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GenericStackedBarChart;
