import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { downloadCsv } from '../../utils/dataLoader';
import DownloadButton from '../DownloadButton/DownloadButton';
import styles from './PieChart.module.css';

export interface PieSlice {
  label: string;
  count: number;
  color: string;
}

interface Props {
  slices: PieSlice[];
  title: string;
  showTitle?: boolean;
  note?: string;
}

const PIE_SIZE = 220;

const PieChart: React.FC<Props> = ({ slices, title, showTitle = true, note }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const total = slices.reduce((a, b) => a + b.count, 0);

  useEffect(() => {
    if (!svgRef.current || slices.length === 0) return;

    if (!tooltipRef.current) {
      tooltipRef.current = d3.select('body').append('div')
        .attr('class', styles.tooltip).node() as HTMLDivElement;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const r = PIE_SIZE / 2 - 12;
    const inner = r * 0.50;

    svg.attr('width', PIE_SIZE).attr('height', PIE_SIZE);
    const g = svg.append('g').attr('transform', `translate(${PIE_SIZE / 2},${PIE_SIZE / 2})`);

    const pie = d3.pie<PieSlice>().value(d => d.count).sort(null);
    const arc = d3.arc<d3.PieArcDatum<PieSlice>>().innerRadius(inner).outerRadius(r);

    g.selectAll('path')
      .data(pie(slices))
      .enter().append('path')
      .attr('d', d => arc(d) as string)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('opacity', 0)
      .on('mouseenter', function(event: MouseEvent, d) {
        const pct = total > 0 ? ((d.data.count / total) * 100).toFixed(1) : '0';
        if (tooltipRef.current)
          d3.select(tooltipRef.current)
            .html(`<strong>${d.data.label}</strong><br/>${pct}%<div style="font-size:11px;color:#888;margin-top:2px">n = ${d.data.count.toLocaleString()}</div>`)
            .style('opacity', '0.97')
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 40) + 'px');
      })
      .on('mousemove', function(event: MouseEvent) {
        if (tooltipRef.current)
          d3.select(tooltipRef.current)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 40) + 'px');
      })
      .on('mouseleave', function() {
        if (tooltipRef.current) d3.select(tooltipRef.current).style('opacity', '0');
      })
      .transition().duration(600).delay((_, i) => i * 100)
      .style('opacity', 1);

    // Center label
    g.append('text').attr('text-anchor', 'middle').attr('dy', '-0.3em')
      .attr('font-size', 12).attr('fill', '#888').text('n =');
    g.append('text').attr('text-anchor', 'middle').attr('dy', '1.1em')
      .attr('font-size', 15).attr('font-weight', '600').attr('fill', '#333')
      .text(total.toLocaleString());

    return () => {
      if (tooltipRef.current) { d3.select(tooltipRef.current).remove(); tooltipRef.current = null; }
    };
  }, [slices, total]);

  const handleDownload = () => {
    const header = 'Label,Count,Total,Percentage';
    const rows = slices.map(s =>
      `"${s.label}",${s.count},${total},${total > 0 ? ((s.count / total) * 100).toFixed(1) : '0'}%`
    );
    downloadCsv([header, ...rows].join('\n'), `${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.titleRow}>
        {showTitle && <h3 className={styles.chartTitle}>{title}</h3>}
        <DownloadButton onClick={handleDownload} />
      </div>
      <div className={styles.body}>
        <svg ref={svgRef} />
        <div className={styles.legend}>
          {slices.map(s => {
            const pct = total > 0 ? ((s.count / total) * 100).toFixed(1) : '0';
            return (
              <div key={s.label} className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: s.color }} />
                <span className={styles.legendLabel}>{s.label}</span>
                <span className={styles.legendPct}>{pct}%</span>
                <span className={styles.legendN}>(n={s.count.toLocaleString()})</span>
              </div>
            );
          })}
        </div>
      </div>
      {total > 0 && (
        <div className={styles.respondentCount}>Number of respondents: {total.toLocaleString()}</div>
      )}
      {note && <div className={styles.note}>{note}</div>}
    </div>
  );
};

export default PieChart;
