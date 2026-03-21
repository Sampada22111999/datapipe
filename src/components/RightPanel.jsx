/**
 * RightPanel
 *
 * Contains:
 *   - Output target selection (CSV vs Database)
 *   - DB table name input (when target is DB)
 *   - Run pipeline button
 *   - Export CSV button (after run)
 *   - Execution log
 *   - Pipeline summary stats
 *   - Database browser
 */

import { Button, PanelHeader, Field, Input, Select } from './Primitives';
import { ExecutionLog } from './ExecutionLog';
import { PipelineSummary } from './PipelineSummary';
import { DatabaseBrowser } from './DatabaseBrowser';
import { usePipelineRunner } from '../hooks/usePipelineRunner';
import useStore from '../store/useStore';
import styles from './RightPanel.module.css';

export function RightPanel() {
  const {
    source,
    result,
    runLog,
    operations,
    isRunning,
    outputTarget,
    setOutputTarget,
    dbTargetName,
    setDbTargetName,
  } = useStore();

  const { run, exportCSV } = usePipelineRunner();

  const enabledOpsCount = operations.filter(op => op.enabled).length;
  const canRun = !!source && enabledOpsCount > 0 && !isRunning;

  return (
    <aside className={styles.panel}>

      {/* ── Output configuration ── */}
      <section className={styles.section}>
        <PanelHeader>Output</PanelHeader>
        <div className={styles.sectionBody}>

          <Field label="Target">
            <div className={styles.targetToggle}>
              {[
                { value: 'csv', label: '↓ CSV File' },
                { value: 'db',  label: '⬡ Database' },
              ].map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.targetBtn} ${outputTarget === opt.value ? styles.targetActive : ''}`}
                  onClick={() => setOutputTarget(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Field>

          {outputTarget === 'db' && (
            <Field label="Table name">
              <Input
                value={dbTargetName}
                onChange={e => setDbTargetName(e.target.value)}
                placeholder="table_name"
              />
            </Field>
          )}

          <button
            className={`${styles.runBtn} ${canRun ? styles.runBtnReady : ''}`}
            onClick={run}
            disabled={!canRun}
            aria-busy={isRunning}
          >
            {isRunning
              ? '⟳  Running…'
              : `▶  Run Pipeline ${enabledOpsCount > 0 ? `(${enabledOpsCount} step${enabledOpsCount !== 1 ? 's' : ''})` : ''}`
            }
          </button>

          {result && outputTarget === 'csv' && (
            <Button variant="primary" size="md" onClick={exportCSV} style={{ width: '100%' }}>
              ↓ Download CSV
            </Button>
          )}
        </div>
      </section>

      {/* ── Summary stats ── */}
      {result && source && (
        <section className={styles.section}>
          <PanelHeader>Summary</PanelHeader>
          <PipelineSummary
            source={source}
            result={result}
            operationsRun={runLog.length}
          />
        </section>
      )}

      {/* ── Execution log ── */}
      <section className={styles.logSection}>
        <PanelHeader>Execution Log</PanelHeader>
        <div className={styles.logScroll}>
          <ExecutionLog log={runLog} />
        </div>
      </section>

      {/* ── Database browser ── */}
      <section className={styles.dbSection}>
        <PanelHeader>Database Tables</PanelHeader>
        <div className={styles.dbScroll}>
          <DatabaseBrowser />
        </div>
      </section>

    </aside>
  );
}
