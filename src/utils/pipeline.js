/**
 * Pipeline execution engine.
 *
 * Takes a set of row objects + headers and applies a sequence of
 * operation configs, returning the transformed data and an execution log.
 */

/**
 * @typedef {Object} Operation
 * @property {string}  id       - Unique ID
 * @property {string}  type     - Operation type key
 * @property {boolean} enabled  - Whether this step is active
 * @property {string}  [label]  - Human-readable label
 * @property {string}  [column]
 * @property {string}  [operator]
 * @property {string}  [value]
 * @property {string}  [from]
 * @property {string}  [to]
 * @property {string}  [newColumn]
 * @property {string}  [expression]
 * @property {string}  [direction]
 * @property {string}  [transform]
 * @property {number}  [count]
 */

/**
 * @typedef {Object} LogEntry
 * @property {string}  operationType
 * @property {string}  label
 * @property {string}  detail
 * @property {boolean} [error]
 * @property {number}  rowsBefore
 * @property {number}  rowsAfter
 * @property {number}  durationMs
 */

/**
 * Runs all enabled operations against the source data in order.
 *
 * @param {Record<string,any>[]} sourceRows
 * @param {string[]}             sourceHeaders
 * @param {Operation[]}          operations
 * @returns {{ rows: Record<string,any>[], headers: string[], log: LogEntry[] }}
 */
export function runPipeline(sourceRows, sourceHeaders, operations) {
  let rows    = sourceRows.map(r => ({ ...r }));
  let headers = [...sourceHeaders];
  const log   = [];

  for (const op of operations) {
    if (!op.enabled) continue;

    const rowsBefore = rows.length;
    const t0 = performance.now();
    let detail = '';
    let isError = false;

    try {
      const result = applyOperation(rows, headers, op);
      rows    = result.rows;
      headers = result.headers;
      detail  = result.detail;
    } catch (err) {
      detail  = `Error: ${err.message}`;
      isError = true;
    }

    log.push({
      operationType: op.type,
      label:         op.label || op.type,
      detail,
      error:         isError,
      rowsBefore,
      rowsAfter:     rows.length,
      durationMs:    Math.round(performance.now() - t0),
    });
  }

  return { rows, headers, log };
}

// ─── Individual operation handlers ───────────────────────────────────────────

function applyOperation(rows, headers, op) {
  switch (op.type) {
    case 'filter':      return applyFilter(rows, headers, op);
    case 'rename':      return applyRename(rows, headers, op);
    case 'drop_column': return applyDropColumn(rows, headers, op);
    case 'add_column':  return applyAddColumn(rows, headers, op);
    case 'sort':        return applySort(rows, headers, op);
    case 'deduplicate': return applyDeduplicate(rows, headers, op);
    case 'transform':   return applyTransform(rows, headers, op);
    case 'limit':       return applyLimit(rows, headers, op);
    default:
      throw new Error(`Unknown operation type: "${op.type}"`);
  }
}

function applyFilter(rows, headers, op) {
  const { column, operator, value = '' } = op;
  const before = rows.length;

  const filtered = rows.filter(row => {
    const cellValue = String(row[column] ?? '');
    const cmp = value;

    switch (operator) {
      case 'equals':       return cellValue === cmp;
      case 'not_equals':   return cellValue !== cmp;
      case 'contains':     return cellValue.toLowerCase().includes(cmp.toLowerCase());
      case 'not_contains': return !cellValue.toLowerCase().includes(cmp.toLowerCase());
      case 'starts_with':  return cellValue.toLowerCase().startsWith(cmp.toLowerCase());
      case 'ends_with':    return cellValue.toLowerCase().endsWith(cmp.toLowerCase());
      case 'greater_than': return parseFloat(cellValue) > parseFloat(cmp);
      case 'less_than':    return parseFloat(cellValue) < parseFloat(cmp);
      case 'not_empty':    return cellValue.trim() !== '';
      case 'is_empty':     return cellValue.trim() === '';
      default:             return true;
    }
  });

  const removed = before - filtered.length;
  return {
    rows: filtered,
    headers,
    detail: `"${column}" ${operator} "${value}" — removed ${removed} row${removed !== 1 ? 's' : ''}`,
  };
}

function applyRename(rows, headers, op) {
  const { from, to } = op;

  if (!from) throw new Error('No source column specified.');
  if (!to)   throw new Error('No target name specified.');
  if (!headers.includes(from)) throw new Error(`Column "${from}" not found.`);

  const newHeaders = headers.map(h => h === from ? to : h);
  const newRows    = rows.map(row => {
    const next = { ...row };
    next[to] = next[from];
    delete next[from];
    return next;
  });

  return { rows: newRows, headers: newHeaders, detail: `"${from}" → "${to}"` };
}

function applyDropColumn(rows, headers, op) {
  const { column } = op;

  if (!headers.includes(column)) {
    throw new Error(`Column "${column}" not found.`);
  }

  const newHeaders = headers.filter(h => h !== column);
  const newRows    = rows.map(row => {
    const next = { ...row };
    delete next[column];
    return next;
  });

  return { rows: newRows, headers: newHeaders, detail: `Dropped column "${column}"` };
}

function applyAddColumn(rows, headers, op) {
  const { newColumn, expression } = op;

  if (!newColumn)   throw new Error('No column name specified.');
  if (!expression)  throw new Error('No expression specified.');

  // Compile expression once; the function receives (row, rowIndex)
  // eslint-disable-next-line no-new-func
  const fn = new Function('row', 'rowIndex', `"use strict"; return (${expression});`);

  const newRows = rows.map((row, i) => {
    let computed;
    try {
      computed = fn(row, i);
    } catch {
      computed = null;
    }
    return { ...row, [newColumn]: computed };
  });

  const newHeaders = headers.includes(newColumn) ? headers : [...headers, newColumn];
  return { rows: newRows, headers: newHeaders, detail: `Added "${newColumn}" via expression` };
}

function applySort(rows, headers, op) {
  const { column, direction = 'asc' } = op;

  const sorted = [...rows].sort((a, b) => {
    const av = a[column] ?? '';
    const bv = b[column] ?? '';
    const na = parseFloat(av);
    const nb = parseFloat(bv);
    const isNumeric = !isNaN(na) && !isNaN(nb);
    const comparison = isNumeric ? na - nb : String(av).localeCompare(String(bv));
    return direction === 'desc' ? -comparison : comparison;
  });

  return { rows: sorted, headers, detail: `Sorted by "${column}" ${direction}` };
}

function applyDeduplicate(rows, headers, op) {
  const { column } = op;
  const byAll = column === '__all__';
  const seen  = new Set();
  const before = rows.length;

  const unique = rows.filter(row => {
    const key = byAll ? JSON.stringify(row) : String(row[column] ?? '');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const removed = before - unique.length;
  const scope   = byAll ? 'all columns' : `"${column}"`;
  return {
    rows: unique,
    headers,
    detail: `Deduplicated by ${scope} — removed ${removed} duplicate${removed !== 1 ? 's' : ''}`,
  };
}

function applyTransform(rows, headers, op) {
  const { column, transform } = op;

  const newRows = rows.map(row => {
    const val = row[column] ?? '';
    let result = val;

    switch (transform) {
      case 'uppercase': result = String(val).toUpperCase(); break;
      case 'lowercase': result = String(val).toLowerCase(); break;
      case 'trim':      result = String(val).trim();        break;
      case 'to_number': result = parseFloat(val) || 0;     break;
      case 'to_string': result = String(val);               break;
      case 'round':     result = Math.round(parseFloat(val) * 100) / 100; break;
      case 'abs':       result = Math.abs(parseFloat(val)); break;
    }

    return { ...row, [column]: result };
  });

  return { rows: newRows, headers, detail: `Applied "${transform}" to "${column}"` };
}

function applyLimit(rows, headers, op) {
  const count = parseInt(op.count, 10);
  if (isNaN(count) || count < 0) throw new Error('Invalid row count.');
  const sliced  = rows.slice(0, count);
  const removed = rows.length - sliced.length;
  return { rows: sliced, headers, detail: `Limited to ${count} rows (trimmed ${removed})` };
}
