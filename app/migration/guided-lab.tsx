/* Native images preserve the full-resolution instructional asset and work without a remote image optimizer. */
/* oxlint-disable next/no-img-element, react/react-compiler -- Load saved local notes after hydration; no lab operations execute here. */
'use client';
import { SplitFocusWorkspace } from '../split-focus-workspace';
import { taskLinks } from '../../lib/task-navigation';
import { WorkspaceStart } from '../workspace-start';
import { FocusStepControl } from '../focus-step-control';
import { LabStepNav } from '../lab-step-nav';

import { useEffect, useRef, useState } from 'react';
import type { GuidedLab as Guide } from '@/lib/guided-lab';
import { VisualChecklist } from '../visual-checklist';
import { TerminalExample } from '../terminal-example';
import { learnerActions } from '../../lib/learner-directions';
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
  const [focused, setFocused] = useState(true);
  const [checked, setChecked] = useState<number[]>([]);
  const [notice, setNotice] = useState('');
  const panel = useRef<HTMLElement>(null);
  const storageKey = `sonic-guided-workstation2019-v1:${lessonId}${stepOffset ? `:part-${stepOffset}` : ''}`;
  // Synchronize saved lab notes after hydration; this does not execute a lab step.
  useEffect(() => {
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
  }, [storageKey, guide.steps]);

  const welcome = welcomeFor(lessonId, stepOffset === 21);
  function select(next: number) {
    setIndex(next);
    requestAnimationFrame(() => {
      panel.current?.focus({ preventScroll: true });
      panel.current?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    });
  }
  function toggle(stepIndex: number) {
    const next = checked.includes(stepIndex)
      ? checked.filter((value) => value !== stepIndex)
      : [...checked, stepIndex];
    setChecked(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      window.dispatchEvent(new Event('sonic-academy-progress'));
    } catch {
      setNotice('Step checks are kept for this visit only.');
    }
  }
  return (
    <section
      className="guided-lab lesson-compact"
      data-step-focus={focused}
      aria-label="Guided lab walkthrough"
    >
      <FocusStepControl
        focused={focused}
        onChange={setFocused}
        step={index}
        total={guide.steps.length}
      />
      <LabStepNav
        titles={guide.steps.map((item) => item.title)}
        current={index}
        completed={checked}
        onChoose={select}
      />
      <header className="guided-heading">
        <div>
          <span className="eyebrow">GUIDED LAB / ONE STEP AT A TIME</span>
          <h2>Visual checklist</h2>
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
      <LessonWelcome lessonId={lessonId} content={welcome} showIntro={false} />
      <details className="lesson-support">
        <summary>Before you start · safety and recovery</summary>
        <p>{guide.before}</p>
        <p>
          <strong>Best practice:</strong> {productionPracticeFor(lessonId)}
        </p>
        <p>
          <strong>If you need to undo this lab:</strong> {guide.rollback}
        </p>
      </details>
      {purpose && !welcome && (
        <section className="guided-purpose">
          <b>WHAT WE ARE BUILDING · WHY IT MATTERS</b>
          <p>{purpose}</p>
        </section>
      )}

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
      {guide.steps.map((step, index) => {
        const clarity = checkTeachingFor(
          screenshotLessonId,
          index + stepOffset + 1,
        );
        const currentTitle = clarity?.title ?? step.title;
        const currentAction = clarity?.action ?? step.action;
        const coaching = explainStep({
          lessonId,
          title: currentTitle,
          action: currentAction,
          command: step.command,
          expected: step.expect,
        });
        return (
          <div className="guided-workspace" key={index}>
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
                <p className="lesson-start">
                  <b>Work in:</b> {step.where ?? guide.where}
                </p>
                {(index === 0 ||
                  (step.where ?? guide.where) !==
                    (guide.steps[index - 1].where ?? guide.where)) && (
                  <WorkspaceStart
                    where={step.where ?? guide.where}
                    action={currentAction}
                  />
                )}
                <SplitFocusWorkspace
                  stepId={`${screenshotLessonId}:guided:${index + stepOffset + 1}`}
                  resource={{
                    title: `Step ${index + 1}: ${currentTitle}`,
                    where: step.where ?? guide.where,
                    why: coaching.reason,
                    links: taskLinks(currentAction),
                  }}
                  takeaway={coaching.reason}
                  reference={
                    <>
                      <section
                        className="guided-visuals"
                        aria-label="Pictures and screen references for this step"
                      >
                        <InstructionScreenshots
                          stepId={`${screenshotLessonId}:guided:${index + stepOffset + 1}`}
                        />
                      </section>
                      {step.command && (
                        <section className="guided-command">
                          <header>
                            <span>
                              COMMAND · USE THE WORKSPACE LISTED ABOVE
                            </span>
                          </header>
                          <TerminalExample
                            command={step.command}
                            where={step.where ?? guide.where}
                          />
                          <p>
                            Type this input in the workspace above, then press
                            Enter.
                          </p>
                        </section>
                      )}
                    </>
                  }
                >
                  <VisualChecklist
                    key={`${lessonId}:${stepOffset}:${index}`}
                    stepId={`${lessonId}:guided:${index + stepOffset + 1}`}
                    actions={learnerActions(currentAction)}
                  />
                  <section className="lesson-result">
                    <b>Check your result</b>
                    <p>{step.expect}</p>
                  </section>
                  <details className="step-help">
                    <summary>Need help?</summary>
                    <details className="lesson-support">
                      <summary>Help opening this workspace</summary>
                      <WorkspaceStart
                        where={step.where ?? guide.where}
                        action={currentAction}
                      />
                    </details>

                    <details className="lesson-support">
                      <summary>Why am I doing this?</summary>
                      <p>{coaching.reason}</p>
                    </details>
                    <details className="lesson-support">
                      <summary>My result is different</summary>
                      <p>{step.trouble}</p>
                    </details>
                    <details className="lesson-support">
                      <summary>Evidence to save</summary>
                      <p className="step-evidence">
                        <strong>Keep this evidence:</strong> {step.evidence}
                      </p>
                    </details>
                    {coaching.commandNotes.length > 0 && (
                      <details className="lesson-support">
                        <summary>What the command means</summary>
                        <ul>
                          {coaching.commandNotes.map((note) => (
                            <li key={note}>{note}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </details>
                  <label className="guided-check">
                    <input
                      type="checkbox"
                      checked={checked.includes(index)}
                      onChange={() => toggle(index)}
                    />{' '}
                    I checked this result on my practice system
                  </label>
                  <nav
                    className="guided-pagination"
                    aria-label="Walkthrough pagination"
                  >
                    <button
                      disabled={index === 0}
                      onClick={() => select(index - 1)}
                    >
                      ← Previous step
                    </button>
                    <button
                      disabled={index === guide.steps.length - 1}
                      onClick={() => select(index + 1)}
                    >
                      Next step →
                    </button>
                  </nav>
                </SplitFocusWorkspace>
              </div>
            </article>
          </div>
        );
      })}
      <output aria-live="polite">{notice}</output>
    </section>
  );
}
