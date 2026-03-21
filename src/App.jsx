/**
 * App
 *
 * Root layout: header + three-column workspace.
 * Keeps layout concerns separate from feature logic —
 * each panel owns its own state wiring via the store.
 */

import { AppHeader }   from './components/AppHeader';
import { LeftPanel }   from './components/LeftPanel';
import { CenterPanel } from './components/CenterPanel';
import { RightPanel }  from './components/RightPanel';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <div className={styles.workspace}>
        <div className={styles.leftCol}>
          <LeftPanel />
        </div>
        <div className={styles.centerCol}>
          <CenterPanel />
        </div>
        <div className={styles.rightCol}>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
