/**
 * OperationCard
 *
 * Collapsible card representing one pipeline step.
 * Shows the op type badge, label, enable toggle, and an
 * expand/collapse chevron. The editor fields are rendered
 * by OperationEditor when expanded.
 */

import { useState } from 'react';
import { OPERATION_TYPES, COLOR_MAP } from '../constants/operations';
import { OperationEditor } from './OperationEditor';
import useStore from '../store/useStore';
import styles from './OperationCard.module.css';

export function OperationCard({ operation, columns }) {
  const [expanded, setExpanded] = useState(false);
  const { updateOperation, removeOperation } = useStore();

  const meta  = OPERATION_TYPES[operation.type];
  const color = COLOR_MAP[meta?.color ?? 'blue'];

  const toggleEnabled = (e) => {
    e.stopPropagation();
    updateOperation(operation.id, { enabled: !operation.enabled });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    removeOperation(operation.id);
  };

  const handleChange = (patch) => {
    updateOperation(operation.id, patch);
  };

  return (
    <div
      className={`${styles.card} ${!operation.enabled ? styles.disabled : ''}`}
      style={{
        '--op-bg':     color.bg,
        '--op-border': color.border,
        '--op-text':   color.text,
      }}
    >
      {/* Card header row */}
      <div
        className={styles.header}
        onClick={() => setExpanded(v => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        {/* Enable toggle */}
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={operation.enabled}
          onChange={toggleEnabled}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Enable ${meta?.label}`}
        />

        {/* Type badge */}
        <span className={styles.typeBadge}>
          {meta?.label ?? operation.type}
        </span>

        {/* User label or placeholder */}
        <span className={styles.opLabel} title={operation.label}>
          {operation.label || <span className={styles.noLabel}>untitled</span>}
        </span>

        {/* Controls */}
        <div className={styles.controls}>
          <span className={styles.chevron} aria-hidden>
            {expanded ? '▲' : '▼'}
          </span>
          <button
            className={styles.deleteBtn}
            onClick={handleDelete}
            aria-label="Remove operation"
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded editor */}
      {expanded && (
        <div className={styles.body}>
          <OperationEditor
            operation={operation}
            columns={columns}
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
}
