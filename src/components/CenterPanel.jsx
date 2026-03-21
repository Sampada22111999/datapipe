/**
 * CenterPanel
 *
 * Tabbed data viewer with three tabs:
 *   - Source Data   — the raw loaded file
 *   - Pipeline Output — result after running all operations
 *   - Database      — browsing a selected in-memory DB table
 */

import { DataTable } from './DataTable';
import { EmptyState } from './Primitives';
import useStore from '../store/useStore';
import styles from './CenterPanel.module.css';

const TABS = [
  { key: 'source', label: 'Source Data' },
  { key: 'result', label: 'Pipeline Output' },
  { key: 'db',     label: 'Database' },
];

export function CenterPanel() {
  const {
    activeTab,
    setActiveTab,
    source,
    result,
    database,
    selectedDbTable,
  } = useStore();

  const dbTable = selectedDbTable ? database[selectedDbTable] : null;

  return (
    <main className={styles.panel}>

      {/* Tab bar */}
      <nav className={styles.tabs} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            className={`${styles.tab} ${activeTab === tab.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            {tab.key === 'db' && Object.keys(database).length > 0 && (
              <span className={styles.tabBadge}>
                {Object.keys(database).length}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className={styles.content}>

        {activeTab === 'source' && (
          source
            ? <DataTable
                headers={source.headers}
                rows={source.rows}
                title={`Source: ${source.filename}`}
                accentColor="blue"
              />
            : <EmptyState
                icon="◫"
                message={"Load a CSV or XLSX file to preview your data here.\nDrag and drop onto the left panel."}
              />
        )}

        {activeTab === 'result' && (
          result
            ? <DataTable
                headers={result.headers}
                rows={result.rows}
                title={`Pipeline output — ${result.rows.length.toLocaleString()} rows`}
                accentColor="green"
              />
            : <EmptyState
                icon="▷"
                message={"Run the pipeline to see the processed output here.\nConfigure your steps in the left panel."}
              />
        )}

        {activeTab === 'db' && (
          dbTable
            ? <DataTable
                headers={dbTable.headers}
                rows={dbTable.rows}
                title={`${selectedDbTable} — written ${new Date(dbTable.createdAt).toLocaleTimeString()}`}
                accentColor="cyan"
              />
            : <EmptyState
                icon="⬡"
                message={
                  Object.keys(database).length === 0
                    ? "No tables yet. Run a pipeline with the Database output target to create one."
                    : "Select a table from the right panel to preview it here."
                }
              />
        )}

      </div>
    </main>
  );
}
