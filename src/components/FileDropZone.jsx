/**
 * FileDropZone
 *
 * Drag-and-drop / click-to-browse file input for CSV and Excel files.
 */

import { useCallback, useState, useRef } from 'react';
import styles from './FileDropZone.module.css';

export function FileDropZone({ onFile, currentFilename }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only trigger leave when we exit the zone entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) onFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [onFile]);

  return (
    <div
      className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${currentFilename ? styles.hasFile : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      aria-label="Upload CSV or Excel file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className={styles.hiddenInput}
        onChange={handleInputChange}
      />

      <div className={styles.icon}>
        {currentFilename ? '◈' : '⊕'}
      </div>

      {currentFilename ? (
        <>
          <div className={styles.filename}>{currentFilename}</div>
          <div className={styles.hint}>Drop a new file to replace</div>
        </>
      ) : (
        <>
          <div className={styles.label}>Drop CSV or XLSX here</div>
          <div className={styles.hint}>or click to browse · .csv · .xlsx · .xls</div>
        </>
      )}
    </div>
  );
}
