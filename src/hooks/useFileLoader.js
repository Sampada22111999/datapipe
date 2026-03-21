/**
 * useFileLoader
 *
 * Handles reading a dropped or selected file (CSV or XLSX),
 * parsing it, and pushing the result into the global store.
 */

import { useCallback } from 'react';
import { parseCSV } from '../utils/csv';
import { parseXLSX } from '../utils/xlsx';
import useStore from '../store/useStore';

const ACCEPTED_TYPES = new Set([
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

export function useFileLoader() {
  const { setSource, setStatus, setActiveTab } = useStore();

  const loadFile = useCallback(async (file) => {
    if (!file) return;

    const isCSV  = file.name.endsWith('.csv');
    const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      setStatus('error', `Unsupported file type: ${file.name}. Please use .csv or .xlsx`);
      return;
    }

    setStatus('loading', `Reading ${file.name}…`);

    try {
      let parsed;

      if (isCSV) {
        const text = await file.text();
        parsed = parseCSV(text);
      } else {
        const buffer = await file.arrayBuffer();
        parsed = parseXLSX(new Uint8Array(buffer));
      }

      if (parsed.headers.length === 0) {
        throw new Error('File appears to be empty or has no columns.');
      }

      setSource({ ...parsed, filename: file.name });
      setActiveTab('source');
      setStatus('ok', `Loaded ${parsed.rows.length.toLocaleString()} rows × ${parsed.headers.length} columns from "${file.name}"`);
    } catch (err) {
      setStatus('error', err.message);
    }
  }, [setSource, setStatus, setActiveTab]);

  return { loadFile };
}
