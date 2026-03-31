import React, { useEffect, useState } from 'react';
import { downloadCsv } from '../../utils/dataLoader';
import DownloadButton from '../DownloadButton/DownloadButton';
import styles from './HorizontalGroupedBarChart.module.css';

export interface GroupedBarGroup {
  groupLabel: string;
  values: number[];   // one value per series
  ns: number[];       // respondent count per series
}

export interface GroupedBarSeries {
  label: string;
  color: string;
}

interface Props {
  groups: GroupedBarGroup[];
  series: GroupedBarSeries[];
  title: string;
  showTitle?: boolean;
  valueUnit?: string;
  note?: string;
  showSummaryTable?: boolean;
}

const HorizontalGroupedBarChart: React.FC<Props> = ({
  groups, series, title,
  showTitle = true,
  valueUnit = 'avg.',
  note,
  showSummaryTable = false,
}) => {
  const [animated, setAnimated] = useState(false);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, [groups]);

  const maxVal = Math.max(
    ...groups.flatMap(g => g.values),
    0.001  // prevent division by zero
  );

  const handleDownload = () => {
    const seriesHeaders = series.flatMap(s => [`${s.label} ${valueUnit}`, `${s.label} n`]).join(',');
    const header = `Group,${seriesHeaders}`;
    const rows = groups.map(g => {
      const vals = series.map((_, si) => `${g.values[si].toFixed(2)},${g.ns[si]}`).join(',');
      return `"${g.groupLabel}",${vals}`;
    });
    downloadCsv([header, ...rows].join('\n'), `${title.replace(/[^a-z0-9]/gi, '_')}.csv`);
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.titleRow}>
        {showTitle && <h3 className={styles.chartTitle}>{title}</h3>}
        <DownloadButton onClick={handleDownload} />
      </div>

      <div className={styles.legend}>
        {series.map(s => (
          <div key={s.label} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: s.color }} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.chartBody}>
        {groups.map(group => (
          <div key={group.groupLabel} className={styles.group}>
            <div className={styles.groupHeader}>{group.groupLabel}</div>
            {series.map((s, si) => {
              const val = group.values[si];
              const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
              return (
                <div key={s.label} className={styles.barRow}>
                  <span className={styles.seriesLabel}>{s.label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.bar}
                      style={{
                        width: animated ? `${pct}%` : '0%',
                        background: s.color,
                      }}
                    />
                  </div>
                  <span className={styles.barValue}>
                    {val.toFixed(2)} {valueUnit}
                    <span style={{ fontSize: 10, color: '#aaa', marginLeft: 4 }}>
                      n={group.ns[si].toLocaleString()}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        ))}
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
                    <th>Mode</th>
                    {series.map(s => (
                      <React.Fragment key={s.label}>
                        <th>{s.label} ({valueUnit})</th>
                        <th>{s.label} (n)</th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g, i) => (
                    <tr key={g.groupLabel} style={{ background: i % 2 === 0 ? 'white' : '#f5f5f5' }}>
                      <td>{g.groupLabel}</td>
                      {series.map((_, si) => (
                        <React.Fragment key={si}>
                          <td style={{ textAlign: 'center' }}>{g.values[si].toFixed(2)}</td>
                          <td style={{ textAlign: 'center' }}>{g.ns[si].toLocaleString()}</td>
                        </React.Fragment>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {note && <div className={styles.note}>{note}</div>}
    </div>
  );
};

export default HorizontalGroupedBarChart;
