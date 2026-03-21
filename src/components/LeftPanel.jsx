/**
 * LeftPanel
 *
 * Contains:
 *   - File drop zone
 *   - "Add operation" buttons
 *   - Scrollable list of pipeline step cards
 *   - Config import / export at the bottom
 */

import { useRef } from 'react';
import { FileDropZone } from './FileDropZone';
import { OperationCard } from './OperationCard';
import { Button, PanelHeader, EmptyState } from './Primitives';
import { OPERATION_TYPES, COLOR_MAP } from '../constants/operations';
import { useFileLoader } from '../hooks/useFileLoader';
import { usePipelineRunner } from '../hooks/usePipelineRunner';
import useStore from '../store/useStore';
import styles from './LeftPanel.module.css';

export function LeftPanel() {
  const configInputRef = useRef(null);
  const { loadFile }   = useFileLoader();
  const { exportConfig, importConfig } = usePipelineRunner();

  const {
    source,
    operations,
    addOperation,
    clearOperations,
  } = useStore();

  const columns = source?.headers ?? [];

  const handleConfigImport = (e) => {
    const file = e.target.files[0];
    if (file) importConfig(file);
    e.target.value = '';
  };

  return (
    <aside className={styles.panel}>

      {/* ── File section ── */}
      <section className={styles.section}>
        <PanelHeader>Source File</PanelHeader>
        <div className={styles.sectionBody}>
          <FileDropZone
            onFile={loadFile}
            currentFilename={source?.filename ?? null}
          />
          {source && (
            <div className={styles.fileMeta}>
              <span>{source.rows.length.toLocaleString()} rows</span>
              <span className={styles.dot}>·</span>
              <span>{source.headers.length} columns</span>
            </div>
          )}
        </div>
      </section>

      {/* ── Add operation ── */}
      <section className={styles.section}>
        <PanelHeader>Add Operation</PanelHeader>
        <div className={`${styles.sectionBody} ${styles.opGrid}`}>
          {Object.entries(OPERATION_TYPES).map(([type, meta]) => {
            const color = COLOR_MAP[meta.color];
            return (
              <button
                key={type}
                className={styles.addOpBtn}
                style={{
                  '--op-bg':     color.bg,
                  '--op-border': color.border,
                  '--op-text':   color.text,
                }}
                onClick={() => addOperation(type, meta.defaultConfig)}
                title={meta.description}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Pipeline steps ── */}
      <section className={styles.pipelineSection}>
        <PanelHeader
          action={
            operations.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearOperations}>
                clear all
              </Button>
            )
          }
        >
          Pipeline Steps ({operations.length})
        </PanelHeader>

        <div className={styles.stepList}>
          {operations.length === 0 ? (
            <EmptyState
              icon="⟁"
              message={"Add operations above to build your pipeline.\nSteps execute top to bottom."}
            />
          ) : (
            operations.map(op => (
              <OperationCard
                key={op.id}
                operation={op}
                columns={columns}
              />
            ))
          )}
        </div>
      </section>

      {/* ── Config I/O ── */}
      <footer className={styles.footer}>
        <Button variant="default" size="sm" onClick={exportConfig} title="Download pipeline as JSON">
          ↓ Export config
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => configInputRef.current?.click()}
          title="Load a saved pipeline config"
        >
          ↑ Import config
        </Button>
        <input
          ref={configInputRef}
          type="file"
          accept=".json"
          className={styles.hiddenInput}
          onChange={handleConfigImport}
        />
      </footer>
    </aside>
  );
}
