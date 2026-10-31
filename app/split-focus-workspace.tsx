'use client';
import { useEffect, useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useStudioDock } from './studio-dock-context';

/** Authored instructions keep their own progress and completion behavior. */
export function SplitFocusWorkspace({
  reference,
  children,
  hasReference = true,
  takeaway,
  dock = true,
}: {
  reference: ReactNode;
  children: ReactNode;
  hasReference?: boolean;
  takeaway?: string;
  dock?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const id = useId();
  const { host, register } = useStudioDock();
  const portaled = Boolean(host && dock);
  useEffect(() => {
    if (!portaled) return;
    register(id, true);
    return () => register(id, false);
  }, [portaled, id, register]);
  const actions = (
    <section
      id={id}
      className="split-focus-actions"
      aria-label="Step instructions and navigation"
      hidden={!open}
    >
      <p className="split-focus-eyebrow">Steps</p>
      {children}
    </section>
  );
  return (
    <div
      className="split-focus-grid"
      data-has-reference={hasReference}
      data-steps-open={open}
      data-portaled={portaled}
    >
      {takeaway && (
        <p className="quiet-takeaway" style={{ gridColumn: '1 / -1' }}>
          {takeaway.split(/(?<=[.!?])\s+(?=[A-Z])/)[0]}
        </p>
      )}
      <header className="quiet-step-controls">
        <span>YOUR LAB · ONE STEP AT A TIME</span>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {open ? 'Hide checklist' : 'Show checklist'}
        </button>
      </header>
      {hasReference && (
        <section
          className="split-focus-reference"
          aria-label="Picture and command"
        >
          <div className="split-focus-reference-body">{reference}</div>
        </section>
      )}
      {host && portaled ? createPortal(actions, host) : actions}
    </div>
  );
}
