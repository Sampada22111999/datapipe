/**
 * Global application state via Zustand.
 *
 * Keeps source data, the pipeline config, execution results,
 * and the in-memory database all in one place.
 */

import { create } from 'zustand';
import { runPipeline } from '../utils/pipeline';

let _operationCounter = 1;

const useStore = create((set, get) => ({

  // ── Source data ────────────────────────────────────────────────────────────
  source: null, // { headers, rows, filename }

  setSource(source) {
    set({ source, result: null, runLog: [] });
  },

  clearSource() {
    set({ source: null, result: null, runLog: [] });
  },

  // ── Pipeline operations ────────────────────────────────────────────────────
  operations: [],

  addOperation(type, defaultConfig = {}) {
    const op = {
      id:      `op_${_operationCounter++}`,
      type,
      enabled: true,
      label:   '',
      ...defaultConfig,
    };
    set(state => ({ operations: [...state.operations, op] }));
  },

  updateOperation(id, patch) {
    set(state => ({
      operations: state.operations.map(op =>
        op.id === id ? { ...op, ...patch } : op
      ),
    }));
  },

  removeOperation(id) {
    set(state => ({
      operations: state.operations.filter(op => op.id !== id),
    }));
  },

  reorderOperations(operations) {
    set({ operations });
  },

  clearOperations() {
    set({ operations: [] });
  },

  importConfig(config) {
    if (!Array.isArray(config.operations)) {
      throw new Error('Invalid config: expected { operations: [...] }');
    }
    set({ operations: config.operations });
  },

  exportConfig() {
    const { operations } = get();
    return JSON.stringify({ operations }, null, 2);
  },

  // ── Execution ──────────────────────────────────────────────────────────────
  result: null,   // { headers, rows }
  runLog: [],     // LogEntry[]
  isRunning: false,

  runPipeline() {
    const { source, operations } = get();

    if (!source) throw new Error('No source file loaded.');

    set({ isRunning: true });

    // Use setTimeout to yield to the browser so the UI can update
    // before the (potentially heavy) computation starts
    setTimeout(() => {
      try {
        const { rows, headers, log } = runPipeline(
          source.rows,
          source.headers,
          operations
        );
        set({ result: { headers, rows }, runLog: log, isRunning: false });
      } catch (err) {
        set({ isRunning: false });
        throw err;
      }
    }, 0);
  },

  // ── In-memory database ─────────────────────────────────────────────────────
  // Record<tableName, { headers, rows, createdAt, rowCount }>
  database: {},

  writeToDatabase(tableName) {
    const { result } = get();
    if (!result) throw new Error('No pipeline result to write.');

    const record = {
      headers:   result.headers,
      rows:      result.rows,
      createdAt: new Date().toISOString(),
    };

    set(state => ({
      database: { ...state.database, [tableName]: record },
    }));

    return record;
  },

  dropTable(tableName) {
    set(state => {
      const next = { ...state.database };
      delete next[tableName];
      return { database: next };
    });
  },

  // ── UI state ───────────────────────────────────────────────────────────────
  activeTab:        'source',  // 'source' | 'result' | 'db'
  outputTarget:     'csv',     // 'csv'    | 'db'
  dbTargetName:     'output',
  selectedDbTable:  null,
  statusMessage:    null,      // { type: 'ok'|'error'|'loading', text }

  setActiveTab(tab)           { set({ activeTab: tab }); },
  setOutputTarget(target)     { set({ outputTarget: target }); },
  setDbTargetName(name)       { set({ dbTargetName: name }); },
  setSelectedDbTable(name)    { set({ selectedDbTable: name }); },
  setStatus(type, text)       { set({ statusMessage: { type, text } }); },
  clearStatus()               { set({ statusMessage: null }); },
}));

export default useStore;
