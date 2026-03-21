/**
 * usePipelineRunner
 *
 * Orchestrates running the pipeline and routing the result
 * to either a CSV download or the in-memory database.
 */

import { useCallback } from 'react';
import useStore from '../store/useStore';
import { serialiseCSV, downloadCSV } from '../utils/csv';

export function usePipelineRunner() {
  const store = useStore();

  const run = useCallback(() => {
    if (!store.source) {
      store.setStatus('error', 'No source file loaded.');
      return;
    }

    store.setStatus('loading', 'Running pipeline…');

    // runPipeline is async via setTimeout internally
    try {
      store.runPipeline();

      // We need to check result after the async tick
      // Use a short delay to read the result after it's been set
      setTimeout(() => {
        const { result, outputTarget, dbTargetName } = useStore.getState();

        if (!result) return;

        if (outputTarget === 'db') {
          try {
            store.writeToDatabase(dbTargetName);
            store.setStatus('ok', `Wrote ${result.rows.length.toLocaleString()} rows to table "${dbTargetName}"`);
            store.setActiveTab('db');
            store.setSelectedDbTable(dbTargetName);
          } catch (err) {
            store.setStatus('error', err.message);
          }
        } else {
          store.setStatus('ok', `Pipeline complete — ${result.rows.length.toLocaleString()} rows ready`);
          store.setActiveTab('result');
        }
      }, 50);
    } catch (err) {
      store.setStatus('error', err.message);
    }
  }, [store]);

  const exportCSV = useCallback(() => {
    const { result, source } = useStore.getState();
    if (!result) return;

    const csv = serialiseCSV(result.headers, result.rows);
    const basename = source?.filename?.replace(/\.[^.]+$/, '') ?? 'output';
    downloadCSV(csv, `${basename}_processed.csv`);
  }, []);

  const exportConfig = useCallback(() => {
    const config = useStore.getState().exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'pipeline_config.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importConfig = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        useStore.getState().importConfig(config);
        useStore.getState().setStatus('ok', 'Pipeline configuration imported');
      } catch {
        useStore.getState().setStatus('error', 'Invalid config file — expected JSON with an "operations" array.');
      }
    };
    reader.readAsText(file);
  }, []);

  return { run, exportCSV, exportConfig, importConfig };
}
