/**
 * DataTable
 *
 * Renders a virtualised-like paginated table for large datasets.
 * Shows 50 rows at a time with page controls.
 */

import { useState, useEffect } from 'react';
import styles from './DataTable.module.css';

const PAGE_SIZE = 50;

export function DataTable({ headers, rows, title, accentColor = 'blue' }) {
  const [page, setPage] = useState(0);

  // Reset to first page when data changes
  useEffect(() => {
    setPage(0);
  }, [rows, headers]);

  const totalPages = Math.ceil(rows.length / PAGE_SIZE);
  const pageRows   = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className={styles.wrapper}>
      {/* Table meta bar */}
      <div className={styles.metaBar}>
        <span className={styles.title}>{title}</span>
        <span className={`${styles.stats} ${styles[`accent_${accentColor}`]}`}>
          {rows.length.toLocaleString()} rows · {headers.length} columns
        </span>
      </div>

      {/* Scrollable table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={`${styles.th} ${styles.rowNum}`}>#</th>
              {headers.map(header => (
                <th
                  key={header}
                  className={`${styles.th} ${styles[`headerAccent_${accentColor}`]}`}
                  title={header}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td className={`${styles.td} ${styles.rowNum}`}>
                  {page * PAGE_SIZE + i + 1}
                </td>
                {headers.map(header => (
                  <td key={header} className={styles.td} title={String(row[header] ?? '')}>
                    {String(row[header] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(0)}
            disabled={page === 0}
          >
            «
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← prev
          </button>
          <span className={styles.pageInfo}>
            page {page + 1} / {totalPages}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            next →
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(totalPages - 1)}
            disabled={page >= totalPages - 1}
          >
            »
          </button>
        </div>
      )}
    </div>
  );
}
