'use client';
import { useId, type ReactNode } from 'react';
import { stepResource, type StepResource } from '../lib/task-navigation';
import { StepResourceLinks } from './step-reference-panel';

/** Authored instructions keep their own progress and completion behavior. */
export function SplitFocusWorkspace({
  reference,
  children,
  hasReference = true,
  takeaway,
  resource,
  stepId,
}: {
  reference: ReactNode;
  children: ReactNode;
  hasReference?: boolean;
  takeaway?: string;
  dock?: boolean;
  resource?: StepResource;
  stepId?: string;
}) {
  const resources = resource ? stepResource(stepId ?? '', resource) : undefined;
  const open = true;
  const id = useId();

  const portaled = false;

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
      data-step-resources={resources ? JSON.stringify(resources) : undefined}
      data-has-reference={hasReference}
      data-steps-open={open}
      data-portaled={portaled}
    >
      {takeaway && (
        <p className="quiet-takeaway" style={{ gridColumn: '1 / -1' }}>
          {takeaway.split(/(?<=[.!?])\s+(?=[A-Z])/)[0]}
        </p>
      )}

      {hasReference && (
        <section
          className="split-focus-reference"
          aria-label="Picture and command"
        >
          <div className="split-focus-reference-body">{reference}</div>
        </section>
      )}
      {resources?.path?.length ? (
        <nav
          className="step-route-strip"
          aria-label="Instructional route for this step"
        >
          <small>FOLLOW THIS ROUTE</small>
          <ol>
            {resources.path.map((part, i) => (
              <li key={`${i}:${part}`}>
                <span>{i + 1}</span>
                {part}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}
      {actions}
      {resources && (
        <details className="step-reference-inline">
          <summary>Links &amp; purpose for this step</summary>
          <StepResourceLinks resource={resources} />
        </details>
      )}
    </div>
  );
}
