/**
 * Excel file parsing via the SheetJS (xlsx) library.
 * Reads the first worksheet from an .xlsx or .xls file.
 */

import * as XLSX from 'xlsx';

/**
 * Parses an ArrayBuffer from an Excel file into headers + row objects.
 *
 * @param {ArrayBuffer} buffer - Raw file bytes
 * @returns {{ headers: string[], rows: Record<string, any>[] }}
 */
export function parseXLSX(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('No worksheets found in this Excel file.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  if (json.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = Object.keys(json[0]);
  return { headers, rows: json };
}

/**
 * Returns the sheet names from an Excel file.
 *
 * @param {ArrayBuffer} buffer
 * @returns {string[]}
 */
export function getSheetNames(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  return workbook.SheetNames;
}
