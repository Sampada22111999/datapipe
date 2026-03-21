/**
 * ExecutionLog
 *
 * Shows a log entry for each operation that ran in the last pipeline
 * execution. Displays the op type, human label, detail message,
 * row delta, and duration.
 */

import { OPERATION_TYPES, COLOR_MAP } from '../constants/operations';
import styles from './ExecutionLog.module.css';

export function ExecutionLog({ log }) {
  if (!log || log.length === 0) {
    return (
      <div className={styles.empty}>No runs yet.</div>
    );
  }

  return (
    <div className={styles.list}>
      {log.map((entry, i) => {
        const meta  = OPERATION_TYPES[entry.operationType];
        const color = COLOR_MAP[meta?.color ?? 'blue'];
        const delta = entry.rowsAfter - entry.rowsBefore;

        return (
          <div
            key={i}
            className={`${styles.entry} ${entry.error ? styles.entryError : ''}`}
          >
            <div className={styles.entryHeader}>
              <span
                className={styles.typeBadge}
                style={{
                  '--op-bg':     color.bg,
                  '--op-border': color.border,
                  '--op-text':   color.text,
                }}
              >
                {meta?.label ?? entry.operationType}
              </span>

              {entry.label && entry.label !== entry.operationType && (
                <span className={styles.entryLabel}>{entry.label}</span>
              )}

              <span className={styles.entryDuration}>{entry.durationMs}ms</span>
            </div>

            <div className={styles.entryDetail}>{entry.detail}</div>

            {!entry.error && (
              <div className={styles.entryRows}>
                <span>{entry.rowsBefore.toLocaleString()} → {entry.rowsAfter.toLocaleString()} rows</span>
                {delta !== 0 && (
                  <span className={delta < 0 ? styles.deltaNeg : styles.deltaPos}>
                    {delta > 0 ? '+' : ''}{delta.toLocaleString()}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
