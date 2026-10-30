'use client';
import { useState } from 'react';
import {
  Image,
  ListChecks,
  CircleCheck,
  LifeBuoy,
  Network,
  NotebookPen,
} from 'lucide-react';
import './lesson-tools.css';

const destinations = [
  { id: 'map', label: 'Lab map', Icon: Network, selector: '#lab-map' },
  {
    id: 'notebook',
    label: 'Notebook',
    Icon: NotebookPen,
    selector: '#private-notebook',
  },
  {
    id: 'picture',
    label: 'Picture',
    Icon: Image,
    selector: '.guided-visuals, .sonic-action-visual',
  },
  {
    id: 'instructions',
    label: 'Instructions',
    Icon: ListChecks,
    selector: '.visual-checklist',
  },
  {
    id: 'result',
    label: 'Check result',
    Icon: CircleCheck,
    selector: '.lesson-result, .terminal-output, .walkthrough-check',
  },
  {
    id: 'help',
    label: 'Help',
    Icon: LifeBuoy,
    selector: 'details.lesson-support',
  },
];

/** Navigate the current visible step without checking or completing anything. */
export function LessonTools() {
  const [notice, setNotice] = useState('');
  function jump(id: string, selector: string) {
    const root = document.querySelector(
      '.console-reader[data-lesson-id] .reader-workspace',
    );
    const panel = Array.from(
      root?.querySelectorAll<HTMLElement>(
        '.guided-step, .sonic-action-panel',
      ) ?? [],
    ).find((item) => item.getClientRects().length > 0);
    const candidates = Array.from(
      (id === 'map' || id === 'notebook'
        ? root
        : (panel ?? root)
      )?.querySelectorAll<HTMLElement>(selector) ?? [],
    );
    const target =
      id === 'help'
        ? (candidates.find((item) =>
            /My result is different/i.test(
              item.querySelector('summary')?.textContent ?? '',
            ),
          ) ?? candidates[0])
        : candidates[0];
    if (!target) {
      setNotice('Open a lab step first to use these shortcuts.');
      return;
    }
    for (
      let parent: HTMLElement | null = target;
      parent && parent !== root;
      parent = parent.parentElement
    ) {
      if (parent instanceof HTMLDetailsElement) parent.open = true;
    }
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
    target.scrollIntoView({
      block: 'start',
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
    setNotice(
      `Showing ${destinations.find((item) => item.id === id)?.label.toLowerCase()}${id === 'map' || id === 'notebook' ? ' for this lab' : ' for the current step'}.`,
    );
  }
  return (
    <div className="lesson-tools">
      <nav aria-label="Current step shortcuts">
        {destinations.map(({ id, label, Icon, selector }) => (
          <button type="button" key={id} onClick={() => jump(id, selector)}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <p className="lesson-tools-notice" role="status">
        {notice}
      </p>
    </div>
  );
}
