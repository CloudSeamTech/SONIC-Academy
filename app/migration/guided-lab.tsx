/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element, react/react-compiler -- Load saved local notes after hydration; no lab operations execute here. */
'use client';
import { LabStepNav } from '../lab-step-nav';

import { useEffect, useRef, useState } from 'react';
import type { GuidedLab as Guide } from '@/lib/guided-lab';
import { BeginnerActions } from '../beginner-actions';
import { productionPracticeFor } from '@/lib/lab-production-practice';
import { explainStep } from '@/lib/step-coaching';
import { checkTeachingFor } from '@/lib/reference-check-teaching';
import { LabOverview } from '../lab-overview';
import { LessonWelcome } from '../lesson-welcome';
import { welcomeFor } from '@/lib/lesson-welcome';
import { InstructionScreenshots } from '../instruction-screenshots';
import './guided-lab.css';

export function GuidedLab({
  guide,
  lessonId,
  purpose,
  screenshotLessonId = lessonId,
  stepOffset = 0,
}: {
  guide: Guide;
  lessonId: string;
  purpose?: string;
  screenshotLessonId?: string;
  stepOffset?: number;
}) {
  const [index, setIndex] = useState(0);
  const [checked, setChecked] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const storageKey = `sonic-guided-workstation2019-v1:${lessonId}${stepOffset ? `:part-${stepOffset}` : ''}`;
  // Synchronize saved lab notes after hydration; this does not execute a lab step.
  useEffect(() => {
    setCopied(false);
    setNotice('');
    const loadChecks = (event?: StorageEvent) => {
      if (event?.key && event.key !== storageKey) return;
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
        const values: number[] = Array.isArray(saved)
          ? saved.filter(
              (value): value is number =>
                Number.isInteger(value) &&
                value >= 0 &&
                value < guide.steps.length,
            )
          : [];
        setChecked(values);
        const firstUnchecked = guide.steps.findIndex(
          (_, i) => !values.includes(i),
        );
        setIndex(firstUnchecked < 0 ? 0 : firstUnchecked);
      } catch {
        setChecked([]);
        setIndex(0);
        setNotice('Step checks are kept for this visit only.');
      }
    };
    loadChecks();
    window.addEventListener('storage', loadChecks);
    return () => window.removeEventListener('storage', loadChecks);
  }, [storageKey, guide.steps.length]);

  const welcome = welcomeFor(lessonId, stepOffset === 21);
  const step = guide.steps[index];
  const clarity = checkTeachingFor(screenshotLessonId, index + stepOffset + 1);
  const currentTitle = clarity?.title ?? step.title;
  const currentAction = clarity?.action ?? step.action;
  const coaching = explainStep({
    lessonId,
    title: currentTitle,
    action: currentAction,
    command: step.command,
    expected: step.expect,
  });
  function select(next: number) {
    setIndex(next);
    setCopied(false);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }
  function toggle() {
    const next = checked.includes(index)
      ? checked.filter((value) => value !== index)
      : [...checked, index];
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event('sonic-academy-progress'));
    } catch {
      setNotice('Step checks are kept for this visit only.');
    }
  }
  return (
    <section className="guided-lab" aria-label="Guided lab walkthrough">
      <LabStepNav
        titles={guide.steps.map((item) => item.title)}
        current={index}
        completed={checked}
        onChoose={select}
      />
      <header className="guided-heading">
        <div>
          <span className="eyebrow">GUIDED LAB / ONE STEP AT A TIME</span>
          <h2>Let’s work through it together</h2>
        </div>
        <span>
          {checked.length} of {guide.steps.length} steps checked
        </span>
      </header>
      <LabOverview
        summary={purpose ?? welcome?.welcome}
        steps={guide.steps.map((item) => item.title)}
        outcome={guide.pass}
      />
      <progress
        value={checked.length}
        max={guide.steps.length}
        aria-label="Lab step completion"
      />
      <LessonWelcome content={welcome} showIntro={false} />
      <section className="lesson-preflight">
        <h3>Before you start</h3>
        <p>{guide.before}</p>
        <p><strong>Best practice:</strong> {productionPracticeFor(lessonId)}</p>
        <p><strong>If you need to undo this lab:</strong> {guide.rollback}</p>
      </section>
      {purpose && !welcome && (
        <section className="guided-purpose">
          <b>WHAT WE ARE BUILDING · WHY IT MATTERS</b>
          <p>{purpose}</p>
        </section>
      )}

      <dl className="guided-context">
        <div>
          <dt>WHERE TO WORK</dt>
          <dd>{guide.where}</dd>
        </div>
      </dl>
      <label className="guided-step-picker">
        Choose a step
        <select
          value={index}
          onChange={(event) => select(Number(event.target.value))}
        >
          {guide.steps.map((item, n) => (
            <option key={n} value={n}>
              Step {n + 1}:{' '}
              {checkTeachingFor(lessonId, n + 1)?.title ?? item.title}
            </option>
          ))}
        </select>
      </label>
      <div className="guided-workspace">
        <article
          ref={panel}
          tabIndex={-1}
          className="guided-step"
          aria-label={`Step ${index + 1}`}
        >
          <div className="guided-step-number">
            STEP {index + 1} OF {guide.steps.length}
          </div>
          <h3>{currentTitle}</h3>
          <div className="guided-step-content">
            <p className="coaching-why">
              <strong>Why this matters:</strong> {coaching.reason}
            </p>
            <div className="guided-action">
              <b>Follow these actions in order</b>
              <BeginnerActions text={currentAction} />
            </div>
            <p className="coaching-effect">
              <strong>What this does:</strong> {coaching.impact}
            </p>
            {step.command && (
              <section className="guided-command">
                <header>
                  <span>COMMAND · USE THE WORKSPACE LISTED ABOVE</span>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(step.command);
                        setCopied(true);
                      } catch {
                        setNotice('Select the command and copy it manually.');
                      }
                    }}
                  >
                    {copied ? 'Copied ✓' : 'Copy command block'}
                  </button>
                </header>
                <pre>
                  <code>{step.command}</code>
                </pre>
                <p>
                  Copying does not run a command. Paste it into the app named in
                  this step. Read the whole block first; some lines belong
                  together.
                </p>
                {coaching.commandNotes.length > 0 && (
                  <section className="coaching-command">
                    <h4>What the command means</h4>
                    <ul>
                      {coaching.commandNotes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </section>
                )}
              </section>
            )}
            <section className="guided-expected">
              <b>What you should see</b>
              <p>{step.expect}</p>
            </section>
            <aside className="teaching-callout">
              <h4>If your result is different</h4>
              <p>{step.trouble}</p>
            </aside>
            <p className="step-evidence">
              <strong>Keep this evidence:</strong> {step.evidence}
            </p>
            <section
              className="guided-visuals"
              aria-label="Pictures and screen references for this step"
            >
              <h4 className="guided-visuals-heading">See it on screen</h4>
              <InstructionScreenshots
                stepId={`${screenshotLessonId}:guided:${index + stepOffset + 1}`}
              />
            </section>
            <label className="guided-check">
              <input
                type="checkbox"
                checked={checked.includes(index)}
                onChange={toggle}
              />{' '}
              I checked this result on my practice system
            </label>
            <nav
              className="guided-pagination"
              aria-label="Walkthrough pagination"
            >
              <button disabled={index === 0} onClick={() => select(index - 1)}>
                ← Previous step
              </button>
              <button
                disabled={index === guide.steps.length - 1}
                onClick={() => select(index + 1)}
              >
                Next step →
              </button>
            </nav>
          </div>
        </article>
      </div>
      <output aria-live="polite">{notice}</output>
    </section>
  );
}
