/**
 * DatabaseBrowser
 *
 * Lists all tables currently in the in-memory database store.
 * Clicking a table selects it for preview in the center panel.
 */

import useStore from '../store/useStore';
import { Button } from './Primitives';
import styles from './DatabaseBrowser.module.css';

export function DatabaseBrowser() {
  const { database, selectedDbTable, setSelectedDbTable, setActiveTab, dropTable } = useStore();
  const tables = Object.entries(database);

  if (tables.length === 0) {
    return (
      <div className={styles.empty}>
        No tables yet. Run a pipeline with the <strong>Database</strong> output target to write one.
      </div>
    );
  }

  const handleSelect = (name) => {
    setSelectedDbTable(name);
    setActiveTab('db');
  };

  const handleDrop = (e, name) => {
    e.stopPropagation();
    if (window.confirm(`Drop table "${name}"?`)) {
      dropTable(name);
      if (selectedDbTable === name) setSelectedDbTable(null);
    }
  };

  return (
    <div className={styles.list}>
      {tables.map(([name, table]) => (
        <div
          key={name}
          className={`${styles.tableRow} ${selectedDbTable === name ? styles.selected : ''}`}
          onClick={() => handleSelect(name)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleSelect(name)}
        >
          <div className={styles.tableIcon}>⬡</div>
          <div className={styles.tableInfo}>
            <div className={styles.tableName}>{name}</div>
            <div className={styles.tableMeta}>
              {table.rows.length.toLocaleString()} rows · {table.headers.length} cols
              <span className={styles.tableTime}>
                {new Date(table.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <button
            className={styles.dropBtn}
            onClick={(e) => handleDrop(e, name)}
            title="Drop table"
            aria-label={`Drop table ${name}`}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
