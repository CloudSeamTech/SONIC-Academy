'use client';
import Link from 'next/link';
import { ServerRoleText } from '../server-role-text';
import { TlsText } from '../tls/tls-text';
import { TlsCourseExtras } from '../tls/tls-interactives';
import { WorkspaceStart } from '../workspace-start';
import { learnerActions } from '../../lib/learner-directions';
import { DmzLabNotebook } from '../dmz/lab-notebook';
import { FocusStepControl } from '../focus-step-control';
import { LabStepNav } from '../lab-step-nav';
import { LabOverview } from '../lab-overview';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LessonWelcome } from '../lesson-welcome';
import { MaintenanceRehearsal } from '../azure-operations/maintenance-rehearsal';
import { SecurityBudget } from '../security/security-budget';
import { CourseScreenshot } from '../course-screenshot';
import {
  guidedCourses,
  guidedCourseHref,
  pkiCourses,
} from '@/lib/guided-courses';
import { ConsoleReaderShell } from '../console-reader-shell';
import {
  nessusCourses,
  type NessusLesson,
  type NessusStep,
} from '@/lib/nessus-curriculum';
import {
  canVerifyNessusLesson,
  nessusSnapshot,
  nessusServerSnapshot,
  subscribeNessus,
  updateNessusProgress,
  type NessusProgress,
} from '@/lib/nessus-progress';
import '../alma/alma.css';
import '../migration/guided-lab.css';
import './nessus.css';

function CommandExample({ step }: { step: NessusStep }) {
  const [notice, setNotice] = useState('');
  return (
    <>
      {step.command && (
        <section className="guided-command">
          <header>
            <span>
              {step.command?.startsWith('index=sonic_lab')
                ? 'SPL SEARCH · PASTE INTO SPLUNK WEB'
                : 'YOUR COMMAND · COPY IT WHEN YOU’RE READY'}
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(step.command!);
                  setNotice('Copied');
                } catch {
                  setNotice('Select the command text to copy it manually.');
                }
              }}
            >
              Copy command
            </button>
          </header>
          <pre>
            <code>{step.command}</code>
          </pre>
          <output aria-live="polite">{notice}</output>
        </section>
      )}
      {step.breakdown.length > 0 && (
        <section className="nessus-explanation teaching-callout">
          <h4>What these commands and settings mean</h4>
          <dl className="nessus-breakdown">
            {step.breakdown.map((item, i) => (
              <div key={i}>
                <dt>
                  <code>{item.term}</code>
                </dt>
                <dd>{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </>
  );
}

function KnowledgeCheck({
  lesson,
  progress,
  save,
}: {
  lesson: NessusLesson;
  progress: NessusProgress;
  save: (update: (current: NessusProgress) => NessusProgress) => void;
}) {
  const [draft, setAnswers] = useState<number[] | null>(null);
  const answers =
    draft ?? progress.answers[lesson.id] ?? lesson.quiz.map(() => -1);
  const [submitted, setSubmitted] = useState(false);
  const showFeedback =
    submitted || (draft === null && Boolean(progress.answers[lesson.id]));
  const answered =
    answers.length === lesson.quiz.length &&
    answers.every((answer) => answer >= 0);
  const allCorrect = lesson.quiz.every(
    (question, index) => answers[index] === question.answer,
  );
  return (
    <section className="nessus-quiz" aria-label="Knowledge check">
      <h2>
        {lesson.id === 'tls-final' ? 'Final assessment' : 'Knowledge check'}
      </h2>
      <p>Try these before continuing. You can look back and try again.</p>
      {lesson.quiz.map((question, index) => (
        <fieldset key={index}>
          <legend>
            {index + 1}. {question.question}
          </legend>
          {question.options.map((option, answer) => (
            <label key={answer}>
              <input
                type="radio"
                name={`${lesson.id}-question-${index}`}
                value={answer}
                checked={answers[index] === answer}
                onChange={() => {
                  setAnswers(
                    answers.map((value, i) => (i === index ? answer : value)),
                  );
                  setSubmitted(false);
                  // Invalidate a saved pass when an answer changes.
                  save((current) => ({
                    ...current,
                    answers: { ...current.answers, [lesson.id]: [] },
                    verified: current.verified.filter((id) => id !== lesson.id),
                  }));
                }}
              />
              {option}
            </label>
          ))}
          {showFeedback && (
            <p
              className={
                answers[index] === question.answer
                  ? 'console-green'
                  : 'console-amber'
              }
            >
              {answers[index] === question.answer ? 'Correct. ' : 'Try again. '}
              {question.explanation}
            </p>
          )}
        </fieldset>
      ))}
      <button
        type="button"
        disabled={!answered}
        onClick={() => {
          setSubmitted(true);
          save((current) => ({
            ...current,
            answers: { ...current.answers, [lesson.id]: answers },
          }));
        }}
      >
        Check my answers
      </button>
      <p role="status">
        {showFeedback
          ? allCorrect
            ? 'You’ve got it. When your lab checks are finished too, you can mark this lesson complete.'
            : 'You’re close. Have another look at the explanation, then try again.'
          : 'Pick an answer for each question. It’s fine to look back at the lesson.'}
      </p>
    </section>
  );
}

function LessonReader({
  lesson,
  progress,
  save,
}: {
  lesson: NessusLesson;
  progress: NessusProgress;
  save: (update: (current: NessusProgress) => NessusProgress) => void;
}) {
  const [index, setIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const resumeStep = () => {
      const current = JSON.parse(nessusSnapshot()) as NessusProgress;
      const next = lesson.steps.findIndex(
        (_, i) => !current.checked.includes(`${lesson.id}:step:${i}`),
      );
      setIndex(next < 0 ? 0 : next);
    };
    resumeStep();
    window.addEventListener('storage', resumeStep);
    return () => window.removeEventListener('storage', resumeStep);
  }, [lesson.id, lesson.steps]);
  const panel = useRef<HTMLElement>(null);
  const step = lesson.steps[index];
  const stepKey = `${lesson.id}:step:${index}`;
  const check = (key: string) =>
    save((current) => ({
      ...current,
      checked: current.checked.includes(key)
        ? current.checked.filter((id) => id !== key)
        : [...current.checked, key],
    }));
  const choose = (next: number) => {
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
  };
  return (
    <article
      className="nessus-lesson"
      data-step-focus={focused}
      data-final-step={index === lesson.steps.length - 1}
    >
      <FocusStepControl
        focused={focused}
        onChange={setFocused}
        step={index}
        total={lesson.steps.length}
      />
      {lesson.id.startsWith('dmz-') && <DmzLabNotebook lessonId={lesson.id} />}
      <section className="guided-lab" aria-label="Guided walkthrough">
        <LabStepNav
          titles={lesson.steps.map((item) => item.title)}
          current={index}
          completed={lesson.steps.flatMap((_, i) =>
            progress.checked.includes(`${lesson.id}:step:${i}`) ? [i] : [],
          )}
          onChoose={choose}
        />
        <header className="guided-heading">
          <h2>Let’s do this together</h2>
          <span>
            {
              lesson.steps.filter((_, i) =>
                progress.checked.includes(`${lesson.id}:step:${i}`),
              ).length
            }
            /{lesson.steps.length} steps checked
          </span>
        </header>
        <progress
          value={
            lesson.steps.filter((_, i) =>
              progress.checked.includes(`${lesson.id}:step:${i}`),
            ).length
          }
          max={lesson.steps.length}
          aria-label="Lab step completion"
        />

        <label className="guided-step-picker">
          Choose a step
          <select
            value={index}
            onChange={(event) => choose(Number(event.target.value))}
          >
            {lesson.steps.map((item, i) => (
              <option key={i} value={i}>
                Step {i + 1}: {item.title}
              </option>
            ))}
          </select>
        </label>
        <div className="guided-workspace">
          <section
            ref={panel}
            className="guided-step"
            tabIndex={-1}
            aria-label={`Step ${index + 1}`}
          >
            <div className="guided-step-number">
              STEP {index + 1} OF {lesson.steps.length}
            </div>
            <h3>{step.title}</h3>
            <div className="guided-step-content">
              <div className="nessus-location">
                <b>WHERE TO WORK</b>
                <p>{step.where}</p>
              </div>
              <WorkspaceStart
                where={step.where}
                action={step.actions.join(' ')}
              />
              {step.guide && (
                <section className="tls-step-guide teaching-callout">
                  <h4>What we’re doing</h4>
                  <p>
                    <TlsText text={step.guide.what} />
                  </p>
                  <h4>Why we’re doing it</h4>
                  <p>
                    <TlsText text={step.guide.why} />
                  </p>
                </section>
              )}
              <section className="guided-action">
                <h4>Let’s try it</h4>
                <ol>
                  {step.actions.flatMap(learnerActions).map((action, i) => (
                    <li key={i}>
                      {step.guide ? (
                        <TlsText text={action} />
                      ) : (
                        <ServerRoleText text={action} />
                      )}
                    </li>
                  ))}
                </ol>
              </section>
              {step.downloads?.map((file) => (
                <p key={file.href}>
                  <a href={file.href} download>
                    {file.title}
                  </a>
                </p>
              ))}
              <CommandExample key={`${lesson.id}:${index}`} step={step} />
              <section className="guided-expected">
                <h4>What you should see</h4>
                <p>
                  {step.guide ? (
                    <TlsText text={step.expected} />
                  ) : (
                    step.expected
                  )}
                </p>
                <small>
                  Expected observation, not recorded output from your
                  environment.
                </small>
              </section>
              {step.guide && (
                <section className="tls-step-verification teaching-callout">
                  <h4>Verify success</h4>
                  <p>
                    <TlsText text={step.guide.verify} />
                  </p>
                  <h4>If this fails</h4>
                  <p>
                    <TlsText text={step.guide.failure} />
                  </p>
                </section>
              )}
              <div className="guided-visuals">
                <CourseScreenshot screenshot={step.screenshot} />
              </div>
              <label className="guided-check">
                <input
                  type="checkbox"
                  checked={progress.checked.includes(stepKey)}
                  onChange={() => check(stepKey)}
                />
                I checked this result in my own lab
              </label>
              <nav className="guided-pagination" aria-label="Step navigation">
                <button
                  disabled={index === 0}
                  onClick={() => choose(index - 1)}
                >
                  ← Previous step
                </button>
                <button
                  disabled={index === lesson.steps.length - 1}
                  onClick={() => choose(index + 1)}
                >
                  Next step →
                </button>
              </nav>
            </div>
          </section>
        </div>
      </section>
      <div className="nessus-advice">
        <section className="teaching-callout">
          <h3>Best practices</h3>
          <ul>
            {lesson.bestPractices.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="teaching-callout">
          <h3>Avoid these mistakes</h3>
          <ul>
            {lesson.commonMistakes.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="nessus-explanation">
          <h3>If your screen is different</h3>
          {lesson.troubleshooting.map((item, i) => (
            <section key={i}>
              <h3>{item.problem}</h3>
              <p>{item.fix}</p>
            </section>
          ))}
        </section>
      </div>
      <section className="nessus-exercise">
        <span className="eyebrow">YOUR TURN / PRACTICAL EXERCISE</span>
        <h2>Show what you can do</h2>
        <p>{lesson.exercise}</p>
        <h3>Pass check</h3>
        <p>{lesson.pass}</p>
        <label className="guided-check">
          <input
            type="checkbox"
            checked={progress.checked.includes(`${lesson.id}:exercise`)}
            onChange={() => check(`${lesson.id}:exercise`)}
          />
          I completed the exercise and saved my own evidence privately
        </label>
      </section>
      <KnowledgeCheck
        key={lesson.id}
        lesson={lesson}
        progress={progress}
        save={save}
      />
      <section className="alma-verify">
        <h2>Finished? Verify this lesson</h2>
        <p>
          Check every step, finish the exercise, and pass the knowledge check.
          Progress is self-reported. Signed-in learners can save it to their
          connected academy account.
        </p>
        <button
          type="button"
          disabled={!canVerifyNessusLesson(lesson.id, progress)}
          aria-pressed={progress.verified.includes(lesson.id)}
          onClick={() =>
            save((current) => ({
              ...current,
              verified: current.verified.includes(lesson.id)
                ? current.verified.filter((id) => id !== lesson.id)
                : [...current.verified, lesson.id],
            }))
          }
        >
          {progress.verified.includes(lesson.id)
            ? '✓ Lesson verified · undo'
            : 'Verify lesson complete'}
        </button>
      </section>
    </article>
  );
}

export function NessusAcademy({ courseId }: { courseId: string }) {
  const course = guidedCourses.find((item) => item.id === courseId)!;
  const isEnterprise = ['mecm-operations', 'wsus-operations'].includes(
    course.id,
  );
  const isTls = course.id === 'rhel-nginx-tls';
  const isPki = course.id.startsWith('pki-');
  const isSplunk = course.id === 'splunk-core-user';
  const isDmz = course.id === 'windows-dmz';
  const isLandingZone = course.id === 'azure-landing-zone';
  const isMaintenance = course.id === 'azure-maintenance';
  const isHelpdesk = course.id === 'iis-helpdesk';
  const isSecurity = course.id === 'budget-cloud-security';
  const relatedCourses = isPki
    ? pkiCourses
    : isTls ||
        isSplunk ||
        isDmz ||
        isEnterprise ||
        isLandingZone ||
        isMaintenance ||
        isHelpdesk ||
        isSecurity
      ? [course]
      : nessusCourses;
  const [id, setId] = useState(course.lessons[0].id);
  const [notice, setNotice] = useState('');
  const progress = JSON.parse(
    useSyncExternalStore(subscribeNessus, nessusSnapshot, nessusServerSnapshot),
  ) as NessusProgress;
  useEffect(() => {
    const sync = () => {
      const requested = new URLSearchParams(location.hash.slice(1)).get(
        'lesson',
      );
      setId(
        course.lessons.find((lesson) => lesson.id === requested)?.id ??
          course.lessons[0].id,
      );
      setNotice('');
    };
    const frame = requestAnimationFrame(sync);
    window.addEventListener('hashchange', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('hashchange', sync);
    };
  }, [course]);
  const lesson =
    course.lessons.find((item) => item.id === id) ?? course.lessons[0];
  const index = course.lessons.indexOf(lesson);
  const done = course.lessons.filter((item) =>
    progress.verified.includes(item.id),
  ).length;
  function save(update: (current: NessusProgress) => NessusProgress) {
    setNotice(
      updateNessusProgress(update)
        ? ''
        : 'Browser storage is unavailable. Your latest check could not be saved. Enable local storage to keep progress.',
    );
  }
  return (
    <ConsoleReaderShell
      lessonId={lesson.id}
      tools={<a href="/migration#view=terminal">Lab terminal</a>}
    >
      <main className="alma-reader nessus-reader">
        <nav
          className={
            'nessus-course-switcher' +
            (isTls ||
            isSplunk ||
            isDmz ||
            isEnterprise ||
            isLandingZone ||
            isMaintenance ||
            isHelpdesk ||
            isSecurity
              ? ' single-course'
              : '')
          }
          aria-label={
            isPki
              ? 'PKI Certificate Management classes'
              : isTls || isSplunk || isEnterprise || isDmz
                ? course.title
                : isLandingZone
                  ? 'Azure landing zone course'
                  : isSecurity
                    ? 'Cloud security course'
                    : isMaintenance
                      ? 'Azure maintenance course'
                      : isHelpdesk
                        ? 'IIS help desk course'
                        : 'Nessus courses'
          }
        >
          {relatedCourses.map((item, i) => (
            <a
              key={item.id}
              href={guidedCourseHref(item.id)}
              aria-current={item.id === course.id ? 'page' : undefined}
            >
              <small>CLASS {String(i + 1).padStart(2, '0')}</small>
              {item.title}
            </a>
          ))}
        </nav>
        <header className="alma-header">
          <span className="eyebrow">
            {isPki || isTls || isSplunk || isEnterprise || isDmz
              ? course.title.toUpperCase()
              : isLandingZone
                ? 'YOUR FIRST AZURE LANDING ZONE'
                : isSecurity
                  ? 'CLOUD AND ENDPOINT SECURITY'
                  : isMaintenance
                    ? 'AZURE SERVER MAINTENANCE'
                    : isHelpdesk
                      ? 'IIS / CLOUDSEAM HELP DESK'
                      : 'NESSUS 10.12.5'}{' '}
            / LESSON {index + 1} OF {course.lessons.length}
          </span>
          <p>{course.title}</p>
          {isEnterprise && (
            <p>
              <a
                href={
                  course.id === 'mecm-operations'
                    ? '/migration#lesson=mecm-01'
                    : '/migration#lesson=lab-13'
                }
              >
                Need the installation first? Open this class’s install lab →
              </a>
            </p>
          )}
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
          <small>
            {course.baseline} · {done}/{course.lessons.length} lessons
            self-verified
          </small>
        </header>
        {isTls && (
          <section
            className="tls-course-progress teaching-callout"
            aria-label="TLS course progress"
          >
            <h2>
              {done === course.lessons.length
                ? 'Course complete · self-verified'
                : 'Your certificate-management pathway'}
            </h2>
            <p role="status">
              {done} of {course.lessons.length} lessons self-verified. Finish
              the step checks, practical exercise and quiz to verify each
              lesson.
            </p>
            <progress
              value={done}
              max={course.lessons.length}
              aria-label="TLS course completion"
            />
            <p>
              Progress uses the academy’s existing storage. Browser rehearsals
              do not execute commands or verify your server.
            </p>
            <nav className="tls-actions">
              <a href="/tls-lab/certificate-inventory.csv" download>
                Inventory template
              </a>
              <a href="/tls-lab/app-tls.conf" download>
                Example NGINX configuration
              </a>
              <a href="/migration#lesson=lab-04-vmware">VMware setup help</a>
            </nav>
          </section>
        )}
        {isDmz && (
          <section className="dmz-practice-files" aria-label="DMZ lab files">
            <p>
              <strong>Isolated practice:</strong> this class does not publish
              your home network or change the live academy DNS. Screens labeled
              illustrated are interface recreations, not live lab evidence.
            </p>
            <nav aria-label="DMZ practice downloads">
              <a href="/dmz/nginx-dmz.conf" download>
                NGINX configuration
              </a>
              <a href="/dmz/new-iis-backend.ps1" download>
                Private IIS setup script
              </a>
              <a href="/dmz/traffic-matrix.csv" download>
                Traffic test checklist
              </a>
              <a href="/?view=courses&subject=windows">
                Windows installation prerequisites
              </a>
              <a href="/migration#lesson=lab-06">IIS foundation</a>
              <a href="/alma#lesson=alma-install">AlmaLinux installation</a>
              <a href="/alma#lesson=alma-terminal">AlmaLinux terminal basics</a>
            </nav>
          </section>
        )}
        {isSplunk && (
          <section className="teaching-callout splunk-practice-files">
            <h2>Your practice files</h2>
            <p>
              Download these inside your practice VM. All three files contain
              fictional lab data. Upload each event CSV only once using Add Data
              when its lesson asks you to. Use cloudseam-status.csv only in
              Lookups.
            </p>
            <a href="/splunk/cloudseam-web.csv" download>
              Download cloudseam-web.csv · 12 events
            </a>
            <a href="/splunk/cloudseam-security.csv" download>
              Download cloudseam-security.csv · security investigations
            </a>
            <a href="/splunk/cloudseam-status.csv" download>
              Download cloudseam-status.csv · lookup
            </a>
            <a href="/migration#lesson=lab-04-vmware">
              Need a VM? Open the VMware setup lab
            </a>
            <p>
              Paste SPL into Splunk Web’s Search bar, not the SONIC terminal or
              PowerShell. A reference picture shows real vendor controls, not
              your own result.
            </p>
          </section>
        )}
        {isPki && (
          <section className="teaching-callout" aria-label="PKI class context">
            <Link href="/pki">← PKI Certificate Management pathway</Link>
            <p>
              Two separate classes, each with its own chapter progress. Start at
              the explanation page, then follow the request, PKI handoff, trust,
              validation and renewal chapters.
            </p>
            <p>
              Genuine images identify their captured OS and limits. Missing
              NGINX/IIS screens remain marked capture needed. The website does
              not install software, inspect your VM or verify your results
              automatically.
            </p>
          </section>
        )}
        <LabOverview
          summary={lesson.what === lesson.description ? undefined : lesson.what}
          steps={lesson.steps.map((item) => item.title)}
          outcome={lesson.pass}
        />
        <LessonWelcome
          lessonId={lesson.id}
          showIntro={false}
          content={{
            welcome: index === 0 ? course.prerequisite : lesson.what,
            why: lesson.why,
            needs: (index === 0 ? course.supplies : lesson.needs) ??
              course.supplies ?? [
                'Keep your practice computers and the previous lesson’s notes nearby.',
              ],
            firstMove: lesson.steps[0].actions[0],
            reassurance:
              'You don’t have to remember every setting. Keep the instructions beside your screen, and take one small action at a time.',
          }}
        />

        <output className="nessus-storage-notice" aria-live="polite">
          {notice}
        </output>
        {isMaintenance &&
          [
            'azure-maint-plan',
            'azure-maint-rolling',
            'azure-maint-rollback',
          ].includes(lesson.id) && (
            <MaintenanceRehearsal key={`practice-${lesson.id}`} />
          )}
        {isSecurity &&
          ['sec-plan', 'sec-cost', 'sec-vdi-license'].includes(lesson.id) && (
            <SecurityBudget />
          )}
        {isTls && (
          <TlsCourseExtras
            key={`tls-extras-${lesson.id}`}
            lessonId={lesson.id}
          />
        )}
        <LessonReader
          key={lesson.id}
          lesson={lesson}
          progress={progress}
          save={save}
        />
        <nav className="alma-pagination" aria-label="Lesson navigation">
          {index > 0 && (
            <a href={`#lesson=${course.lessons[index - 1].id}`}>
              ← {course.lessons[index - 1].title}
            </a>
          )}
          {index < course.lessons.length - 1 && (
            <a href={`#lesson=${course.lessons[index + 1].id}`}>
              {course.lessons[index + 1].title} →
            </a>
          )}
        </nav>
        <p className="lesson-reference-link">
          <a href={`/references#${course.id}`}>
            Official references and version notes →
          </a>
        </p>
      </main>
    </ConsoleReaderShell>
  );
}
