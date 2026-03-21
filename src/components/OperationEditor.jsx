/**
 * OperationEditor
 *
 * Renders the configuration fields for a given operation type.
 * Each op type gets its own sub-component to keep things clean
 * and easy to extend.
 */

import { Field, Input, Select } from './Primitives';
import { FILTER_OPERATORS, TRANSFORM_TYPES } from '../constants/operations';
import styles from './OperationEditor.module.css';

export function OperationEditor({ operation, columns, onChange }) {
  const update = (key, value) => onChange({ [key]: value });

  const columnOptions = (
    <>
      <option value="">— select column —</option>
      {columns.map(c => <option key={c} value={c}>{c}</option>)}
    </>
  );

  return (
    <div className={styles.editor}>
      {/* Label field — present for all op types */}
      <Field label="Step label">
        <Input
          value={operation.label || ''}
          onChange={e => update('label', e.target.value)}
          placeholder="Describe what this step does…"
        />
      </Field>

      <div className={styles.divider} />

      {/* Type-specific fields */}
      {operation.type === 'filter'      && <FilterFields      op={operation} update={update} columnOptions={columnOptions} />}
      {operation.type === 'rename'      && <RenameFields      op={operation} update={update} columnOptions={columnOptions} />}
      {operation.type === 'drop_column' && <DropColumnFields  op={operation} update={update} columnOptions={columnOptions} />}
      {operation.type === 'add_column'  && <AddColumnFields   op={operation} update={update} />}
      {operation.type === 'sort'        && <SortFields        op={operation} update={update} columnOptions={columnOptions} />}
      {operation.type === 'deduplicate' && <DeduplicateFields op={operation} update={update} columns={columns} />}
      {operation.type === 'transform'   && <TransformFields   op={operation} update={update} columnOptions={columnOptions} />}
      {operation.type === 'limit'       && <LimitFields       op={operation} update={update} />}
    </div>
  );
}

// ─── Filter ──────────────────────────────────────────────────────────────────

function FilterFields({ op, update, columnOptions }) {
  const noValueNeeded = op.operator === 'not_empty' || op.operator === 'is_empty';

  return (
    <>
      <Field label="Column">
        <Select value={op.column || ''} onChange={e => update('column', e.target.value)}>
          {columnOptions}
        </Select>
      </Field>

      <Field label="Condition">
        <Select value={op.operator || 'contains'} onChange={e => update('operator', e.target.value)}>
          {FILTER_OPERATORS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </Field>

      {!noValueNeeded && (
        <Field label="Value">
          <Input
            value={op.value || ''}
            onChange={e => update('value', e.target.value)}
            placeholder="Compare value…"
          />
        </Field>
      )}
    </>
  );
}

// ─── Rename ───────────────────────────────────────────────────────────────────

function RenameFields({ op, update, columnOptions }) {
  return (
    <>
      <Field label="Column to rename">
        <Select value={op.from || ''} onChange={e => update('from', e.target.value)}>
          {columnOptions}
        </Select>
      </Field>

      <Field label="New name">
        <Input
          value={op.to || ''}
          onChange={e => update('to', e.target.value)}
          placeholder="new_column_name"
        />
      </Field>
    </>
  );
}

// ─── Drop Column ──────────────────────────────────────────────────────────────

function DropColumnFields({ op, update, columnOptions }) {
  return (
    <Field label="Column to drop">
      <Select value={op.column || ''} onChange={e => update('column', e.target.value)}>
        {columnOptions}
      </Select>
    </Field>
  );
}

// ─── Add Column ───────────────────────────────────────────────────────────────

function AddColumnFields({ op, update }) {
  return (
    <>
      <Field label="New column name">
        <Input
          value={op.newColumn || ''}
          onChange={e => update('newColumn', e.target.value)}
          placeholder="computed_column"
        />
      </Field>

      <Field label="Expression (JavaScript)">
        <Input
          value={op.expression || ''}
          onChange={e => update('expression', e.target.value)}
          placeholder="e.g. Number(row.price) * 1.2"
          className="mono"
        />
        <div className={styles.hint}>
          Use <code>row.columnName</code> to reference values.
          Returns the expression result for each row.
        </div>
      </Field>
    </>
  );
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

function SortFields({ op, update, columnOptions }) {
  return (
    <>
      <Field label="Sort by column">
        <Select value={op.column || ''} onChange={e => update('column', e.target.value)}>
          {columnOptions}
        </Select>
      </Field>

      <Field label="Direction">
        <Select value={op.direction || 'asc'} onChange={e => update('direction', e.target.value)}>
          <option value="asc">Ascending (A → Z, 0 → 9)</option>
          <option value="desc">Descending (Z → A, 9 → 0)</option>
        </Select>
      </Field>
    </>
  );
}

// ─── Deduplicate ──────────────────────────────────────────────────────────────

function DeduplicateFields({ op, update, columns }) {
  return (
    <Field label="Deduplicate by">
      <Select value={op.column || '__all__'} onChange={e => update('column', e.target.value)}>
        <option value="__all__">All columns (exact row match)</option>
        {columns.map(c => <option key={c} value={c}>{c}</option>)}
      </Select>
    </Field>
  );
}

// ─── Transform ────────────────────────────────────────────────────────────────

function TransformFields({ op, update, columnOptions }) {
  return (
    <>
      <Field label="Column">
        <Select value={op.column || ''} onChange={e => update('column', e.target.value)}>
          {columnOptions}
        </Select>
      </Field>

      <Field label="Transformation">
        <Select value={op.transform || 'trim'} onChange={e => update('transform', e.target.value)}>
          {TRANSFORM_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </Field>
    </>
  );
}

// ─── Limit ────────────────────────────────────────────────────────────────────

function LimitFields({ op, update }) {
  return (
    <Field label="Maximum rows to keep">
      <Input
        type="number"
        min={0}
        value={op.count ?? ''}
        onChange={e => update('count', e.target.value)}
        placeholder="e.g. 1000"
      />
    </Field>
  );
}
