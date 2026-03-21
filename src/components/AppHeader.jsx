/**
 * AppHeader
 *
 * Top bar with the app logo, version badge, and a status message strip.
 */

import useStore from '../store/useStore';
import styles from './AppHeader.module.css';

export function AppHeader() {
  const { statusMessage } = useStore();

  return (
    <header className={styles.header}>
      <div className={styles.logoGroup}>
        <div className={styles.logoDot} aria-hidden />
        <span className={styles.logoText}>DataPipe</span>
        <span className={styles.versionBadge}>Pipeline Studio</span>
      </div>

      <div className={styles.spacer} />

      {statusMessage && (
        <div className={`${styles.status} ${styles[`status_${statusMessage.type}`]}`}>
          <span className={styles.statusIcon} aria-hidden>
            {statusMessage.type === 'ok'      && '✓'}
            {statusMessage.type === 'error'   && '✗'}
            {statusMessage.type === 'loading' && '⟳'}
          </span>
          {statusMessage.text}
        </div>
      )}
    </header>
  );
}
