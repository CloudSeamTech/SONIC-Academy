'use client';
import { useState } from 'react';
export function LabStepNav({
  titles,
  current,
  completed = [],
  onChoose,
}: {
  titles: string[];
  current: number;
  completed?: number[];
  onChoose: (index: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <nav className="lab-step-nav" aria-label="Lab steps">
      <details
        open={expanded}
        onToggle={(event) => setExpanded(event.currentTarget.open)}
      >
        <summary>
          Jump to a step · {current + 1} of {titles.length}
        </summary>
        <ol>
          {titles.map((title, index) => (
            <li key={index}>
              <button
                type="button"
                aria-current={current === index ? 'step' : undefined}
                onClick={() => {
                  onChoose(index);
                  if (window.innerWidth < 1200) setExpanded(false);
                }}
              >
                <span>{completed.includes(index) ? '✓' : index + 1}</span>
                <span>{title}</span>
                {completed.includes(index) && (
                  <small className="sr-only">Completed</small>
                )}
              </button>
            </li>
          ))}
        </ol>
      </details>
    </nav>
  );
}
