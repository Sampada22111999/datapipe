/**
 * PipelineSummary
 *
 * Shows a quick stats comparison between source and result data.
 */

import styles from './PipelineSummary.module.css';

export function PipelineSummary({ source, result, operationsRun }) {
  if (!result) return null;

  const rowDelta = result.rows.length - source.rows.length;
  const colDelta = result.headers.length - source.headers.length;

  const stats = [
    { label: 'Source rows',   value: source.rows.length.toLocaleString(),    accent: false },
    { label: 'Output rows',   value: result.rows.length.toLocaleString(),    accent: true  },
    { label: 'Row Δ',         value: (rowDelta >= 0 ? '+' : '') + rowDelta.toLocaleString(), delta: rowDelta },
    { label: 'Output cols',   value: result.headers.length,                  accent: false },
    { label: 'Column Δ',      value: (colDelta >= 0 ? '+' : '') + colDelta,  delta: colDelta },
    { label: 'Steps run',     value: operationsRun,                          accent: false },
  ];

  return (
    <div className={styles.grid}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.stat}>
          <div className={styles.statLabel}>{stat.label}</div>
          <div
            className={`${styles.statValue} ${
              stat.delta !== undefined
                ? stat.delta < 0 ? styles.negative : stat.delta > 0 ? styles.positive : ''
                : stat.accent ? styles.accent : ''
            }`}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
