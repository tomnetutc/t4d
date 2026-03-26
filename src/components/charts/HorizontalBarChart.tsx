import React, { useEffect, useRef, useLayoutEffect } from 'react';
import * as d3 from 'd3';
import { downloadCsv } from '../../utils/dataLoader';
import DownloadButton from '../DownloadButton/DownloadButton';
import styles from './HorizontalBarChart.module.css';

export interface BarItem {
  label: string;
  fullLabel?: string;
  count: number;
  total: number;
}

interface Props {
  items: BarItem[];
  title: string;
  showTitle?: boolean;
  color?: string;
  includeDownload?: boolean;
  note?: string;
}

const DEFAULT_COLOR = '#2d7fa8';

const HorizontalBarChart: React.FC<Props> = ({
  items, title, showTitle = true, color = DEFAULT_COLOR,
  includeDownload = true, note,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const draw = () => {
      if (!svgRef.current || !containerRef.current || items.length === 0) return;

      if (!tooltipRef.current) {
        tooltipRef.current = d3.select('body').append('div')
          .attr('class', styles.tooltip).node() as HTMLDivElement;
      }

      const containerWidth = containerRef.current.clientWidth;

      // Measure actual longest label to avoid wasted whitespace.
      const tempSvg = d3.select(document.body).append('svg')
        .attr('style', 'position:absolute;visibility:hidden;pointer-events:none')
        .attr('width', 0).attr('height', 0);
      const rawWidths = items.map(item => {
        const t = tempSvg.append('text').attr('font-size', 12.5).text(item.label);
        const w = (t.node() as SVGTextElement | null)?.getComputedTextLength() ?? 0;
        t.remove();
        return w;
      });
      tempSvg.remove();
      const maxLabelW = Math.max(...rawWidths);
      const labelWidth = Math.min(Math.max(maxLabelW + 20, 80), 260);

      const pctWidth = 52;
      const barAreaWidth = containerWidth - labelWidth - pctWidth - 12;
      const rowH = 34, rowGap = 6;
      const totalH = items.length * (rowH + rowGap) + 24;

      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();
      svg.attr('width', '100%').attr('height', totalH)
        .attr('viewBox', `0 0 ${containerWidth} ${totalH}`)
        .attr('preserveAspectRatio', 'xMinYMid meet');

      const maxPct = d3.max(items, d => d.total > 0 ? (d.count / d.total) * 100 : 0) || 100;
      const x = d3.scaleLinear().domain([0, maxPct]).range([0, barAreaWidth]);

      const g = svg.append('g').attr('transform', `translate(${labelWidth + 8}, 12)`);

      // Gridlines
      g.append('g')
        .call(d3.axisBottom(x).ticks(4).tickSize(totalH - 24).tickFormat(() => ''))
        .call(ax => ax.select('.domain').remove())
        .call(ax => ax.selectAll('line').attr('stroke', '#f0f0f0'));

      items.forEach((item, i) => {
        const pct = item.total > 0 ? (item.count / item.total) * 100 : 0;
        const y = i * (rowH + rowGap);

        // Label (left)
        const labelEl = svg.append('text')
          .attr('x', labelWidth - 8).attr('y', y + rowH / 2 + 4)
          .attr('text-anchor', 'end').attr('font-size', 12.5).attr('fill', '#444');
        // Truncate if too long
        labelEl.text(item.label);
        const labelNode = labelEl.node() as SVGTextElement | null;
        if (labelNode && labelNode.getComputedTextLength() > labelWidth - 10) {
          let txt = item.label;
          while (txt.length > 4 && labelNode.getComputedTextLength() > labelWidth - 10) {
            txt = txt.slice(0, -1);
            labelEl.text(txt + '…');
          }
          if (item.fullLabel || item.label !== txt) labelEl.append('title').text(item.fullLabel || item.label);
        }

        // Background track
        g.append('rect')
          .attr('x', 0).attr('y', y).attr('width', barAreaWidth).attr('height', rowH)
          .attr('fill', '#f5f5f5').attr('rx', 3);

        // Bar
        g.append('rect')
          .attr('x', 0).attr('y', y).attr('width', 0).attr('height', rowH)
          .attr('fill', color).attr('rx', 3)
          .on('mouseenter', function(event: MouseEvent) {
            if (tooltipRef.current)
              d3.select(tooltipRef.current)
                .html(`<strong>${item.fullLabel || item.label}</strong><br/>${pct.toFixed(1)}%<div style="font-size:11px;color:#888;margin-top:2px">n = ${item.count.toLocaleString()} / ${item.total.toLocaleString()}</div>`)
                .style('opacity', '0.97').style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 40) + 'px');
          })
          .on('mousemove', function(event: MouseEvent) {
            if (tooltipRef.current)
              d3.select(tooltipRef.current).style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 40) + 'px');
          })
          .on('mouseleave', function() { if (tooltipRef.current) d3.select(tooltipRef.current).style('opacity', '0'); })
          .transition().duration(700).delay(i * 40).attr('width', x(pct));

        // Percentage label (right of bar)
        g.append('text')
          .attr('x', barAreaWidth + 6).attr('y', y + rowH / 2 + 4)
          .attr('font-size', 12).attr('fill', '#555')
          .style('opacity', 0)
          .text(`${pct.toFixed(1)}%`)
          .transition().duration(400).delay(700 + i * 40).style('opacity', 1);
      });
    };

    draw();
    const obs = new ResizeObserver(draw);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => {
      obs.disconnect();
      if (tooltipRef.current) { d3.select(tooltipRef.current).remove(); tooltipRef.current = null; }
    };
  }, [items, color]);

  const handleDownload = () => {
    const header = 'Label,Count,Total,Percentage';
    const rows = items.map(it =>
      `"${it.fullLabel || it.label}",${it.count},${it.total},${it.total > 0 ? ((it.count / it.total) * 100).toFixed(1) : '0'}`
    );
    downloadCsv([header, ...rows].join('\n'), `${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  };

  const respondents = items[0]?.total ?? 0;

  return (
    <div className={styles.chartContainer} ref={containerRef}>
      <div className={styles.titleRow}>
        {showTitle && <h3 className={styles.chartTitle}>{title}</h3>}
        {includeDownload && <DownloadButton onClick={handleDownload} />}
      </div>
      <svg ref={svgRef} />
      {respondents > 0 && (
        <div className={styles.respondentCount}>
          Number of respondents: {respondents.toLocaleString()}
        </div>
      )}
      {note && <div className={styles.note}>{note}</div>}
    </div>
  );
};

export default HorizontalBarChart;
