/**
 * CSV parsing and serialisation utilities.
 */

/**
 * Parses a raw CSV string into headers + row objects.
 * Handles quoted fields containing commas and newlines.
 *
 * @param {string} text - Raw CSV content
 * @returns {{ headers: string[], rows: Record<string, string>[] }}
 */
export function parseCSV(text) {
  const normalised = text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalised.split('\n');

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = splitCSVLine(lines[0]);

  const rows = lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = splitCSVLine(line);
      return Object.fromEntries(
        headers.map((header, i) => [header, values[i] ?? ''])
      );
    });

  return { headers, rows };
}

/**
 * Splits a single CSV line respecting quoted fields.
 *
 * @param {string} line
 * @returns {string[]}
 */
function splitCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // Handle escaped quote ""
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Serialises row objects back to a CSV string.
 *
 * @param {string[]} headers
 * @param {Record<string, any>[]} rows
 * @returns {string}
 */
export function serialiseCSV(headers, rows) {
  const escapeField = (value) => {
    const str = String(value ?? '');
    // Wrap in quotes if the value contains a comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = headers.map(escapeField).join(',');
  const dataRows = rows.map(row =>
    headers.map(h => escapeField(row[h])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Triggers a browser download of a CSV string.
 *
 * @param {string} content
 * @param {string} filename
 */
export function downloadCSV(content, filename = 'output.csv') {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
