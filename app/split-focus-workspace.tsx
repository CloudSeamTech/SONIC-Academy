import type { ReactNode } from 'react';

/** Presentational slots keep the authored instructions and progress controls intact. */
export function SplitFocusWorkspace({
  reference,
  children,
}: {
  reference: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="split-focus-grid">
      <section
        className="split-focus-reference"
        aria-label="Picture, command and expected result"
      >
        <header className="lab-window-chrome">
          <span className="lab-window-lights" aria-hidden="true">
            <span className="window-light window-light-red" />
            <span className="window-light window-light-yellow" />
            <span className="window-light window-light-green" />
          </span>
          <span className="lab-window-title">Lab workspace</span>
        </header>
        <div className="split-focus-reference-body">{reference}</div>
      </section>
      <section
        className="split-focus-actions"
        aria-label="Step instructions and navigation"
      >
        <p className="split-focus-eyebrow">Your next action</p>
        {children}
      </section>
    </div>
  );
}
