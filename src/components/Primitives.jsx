/**
 * Shared primitive UI components.
 * These are small, unstyled-by-default building blocks.
 */

import { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Primitives.module.css';

// ─── Button ───────────────────────────────────────────────────────────────────

export const Button = forwardRef(function Button(
  { variant = 'default', size = 'md', className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={clsx(styles.btn, styles[`btn_${variant}`], styles[`btn_${size}`], className)}
      {...props}
    >
      {children}
    </button>
  );
});

// ─── Input ────────────────────────────────────────────────────────────────────

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={clsx(styles.input, className)}
      {...props}
    />
  );
});

// ─── Select ───────────────────────────────────────────────────────────────────

export const Select = forwardRef(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={clsx(styles.select, className)}
      {...props}
    >
      {children}
    </select>
  );
});

// ─── Label ────────────────────────────────────────────────────────────────────

export function FieldLabel({ children }) {
  return <div className={styles.fieldLabel}>{children}</div>;
}

// ─── Field (label + input wrapper) ───────────────────────────────────────────

export function Field({ label, children }) {
  return (
    <div className={styles.field}>
      {label && <FieldLabel>{label}</FieldLabel>}
      {children}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export function Badge({ color = 'blue', children }) {
  return (
    <span className={clsx(styles.badge, styles[`badge_${color}`])}>
      {children}
    </span>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────

export function Divider() {
  return <div className={styles.divider} />;
}

// ─── PanelHeader ──────────────────────────────────────────────────────────────

export function PanelHeader({ children, action }) {
  return (
    <div className={styles.panelHeader}>
      <span className={styles.panelHeaderTitle}>{children}</span>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, message }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyStateIcon}>{icon}</div>
      <div className={styles.emptyStateMessage}>{message}</div>
    </div>
  );
}
