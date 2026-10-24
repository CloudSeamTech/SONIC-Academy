'use client';
import { TroubleshootingLibrary } from '../troubleshooting-library';
import { welcomeFor } from '@/lib/lesson-welcome';
/* oxlint-disable next/no-html-link-for-pages -- Vinext's client router currently crashes on these cross-page transitions; native navigation is intentional. */

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleDollarSign,
  Cloud,
  Copy,
  ExternalLink,
  Play,
  RotateCcw,
  ShieldCheck,
  TerminalSquare,
  Wrench,
} from 'lucide-react';
import {
  migrationLessonById,
  migrationLessons,
  migrationStageFor,
  migrationTasks,
  type MigrationLesson,
} from '../migration-course';
import {
  parseMigrationContent,
  type MigrationBlock,
} from '@/lib/migration-content';
import {
  readMigrationProgress,
  writeMigrationProgress,
} from '@/lib/migration-progress';
import { LabTerminal } from '../lab-terminal/lab-terminal';
import {
  learningPathways,
  pathwayLessons,
  lessonSequenceFor,
} from '../learning-pathways';
import './migration.css';
import { ConsoleReaderShell } from '../console-reader-shell';
import { LearningConsole } from '../learning-console';
import { GuidedLab } from './guided-lab';
import { LessonVisualGuide } from '../lesson-visual-guide';
import { parseGuidedLab, referenceBody } from '@/lib/guided-lab';

type Mode = 'home' | 'learn' | 'job' | 'lesson' | 'terminal';
const lessonIds = migrationLessons.map((lesson) => lesson.id);

function cleanInline(value: string) {
  return value
    .replaceAll('**', '')
    .replaceAll('`', '')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<');
}

function Inline({ text }: { text: string }) {
  const chunks = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {chunks.map((chunk, index) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return <strong key={index}>{chunk.slice(2, -2)}</strong>;
        }
        if (chunk.startsWith('`') && chunk.endsWith('`')) {
          return <code key={index}>{chunk.slice(1, -1)}</code>;
        }
        return <Fragment key={index}>{cleanInline(chunk)}</Fragment>;
      })}
    </>
  );
}

function CopyCommand({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const command = lines.join('\n');
  return (
    <section className="migration-command" aria-label="Command or code">
      <header>
        <span>
          <TerminalSquare size={15} /> COMMAND / EXACT INPUT
        </span>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(command);
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            } catch {
              setCopied(false);
            }
          }}
        >
          <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </header>
      <pre>
        <code>{command}</code>
      </pre>
      <p>
        <b>Where:</b> use the named machine and shell shown by this lesson. Read
        the surrounding step before running anything.
      </p>
    </section>
  );
}

function ContentBlock({ block }: { block: MigrationBlock }) {
  if (block.type === 'heading') {
    if (block.level === 1) return null;
    return block.level === 2 ? (
      <h2>
        <Inline text={block.text} />
      </h2>
    ) : (
      <h3>
        <Inline text={block.text} />
      </h3>
    );
  }
  if (block.type === 'paragraph')
    return (
      <p>
        <Inline text={block.text} />
      </p>
    );
  if (block.type === 'command') return <CopyCommand lines={block.lines} />;
  if (block.type === 'checklist') {
    return (
      <section className="migration-pane pane-action">
        <span className="pane-label">Lab instructions</span>
        <ol className="action-list">
          {block.items.map((item, index) => (
            <li key={index}>
              <span>{index + 1}</span>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      </section>
    );
  }
  if (block.type === 'table') {
    const [header, ...rows] = block.rows;
    return (
      <div
        className="migration-table-wrap"
        aria-label="Scrollable course table"
      >
        <table>
          <thead>
            <tr>
              {header.map((cell, index) => (
                <th key={index}>
                  <Inline text={cell} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, index) => (
                  <td key={index}>
                    <Inline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <aside className={`migration-pane pane-${block.tone}`}>
      <span className="pane-label">{block.label}</span>
      <p>
        <Inline text={block.text} />
      </p>
    </aside>
  );
}

function TaskCard({
  task,
  openLesson,
}: {
  task: (typeof migrationTasks)[number];
  openLesson: (id: string) => void;
}) {
  const lesson = migrationLessonById(task.lessonId)!;
  return (
    <button
      className="migration-task-card"
      onClick={() => openLesson(task.lessonId)}
    >
      <span className="task-card-top">
        <Cloud size={21} />
        <b>{lesson.code}</b>
      </span>
      <span className="task-machine">{task.machine}</span>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <span className="task-open">
        Open this exact workflow <ArrowRight size={14} />
      </span>
    </button>
  );
}

function ProjectDirectory({
  completed,
  openLesson,
}: {
  completed: string[];
  openLesson: (id: string) => void;
}) {
  return (
    <section
      className="project-directory"
      aria-labelledby="project-directory-title"
    >
      <header>
        <span className="eyebrow">PATHWAYS / IN PREREQUISITE ORDER</span>
        <h2 id="project-directory-title">Choose a class</h2>
        <p>
          Build Windows and Active Directory first, then SQL, Azure, and
          migrations; optional extensions have their own prerequisites.
        </p>
      </header>
      <div className="project-stage-list">
        {learningPathways
          .filter((path) => path.id !== 'linux')
          .map((path, index) => (
            <details key={path.id} className="project-stage" open={index === 0}>
              <summary>
                <span className="project-stage-number">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <strong>{path.title}</strong>
                  <small>{path.prerequisite}</small>
                </span>
                <ChevronRight size={17} />
              </summary>
              {path.sections.map((section) => (
                <div key={section.title}>
                  <h3 className="reader-section-title">
                    {section.title}
                    {section.optional ? ' · OPTIONAL EXTENSION' : ''}
                  </h3>
                  {section.optional && (
                    <p className="reader-prerequisite">
                      {path.id === 'windows'
                        ? 'Complete the SQL Server core pathway before MECM; complete WSUS before MECM updates.'
                        : 'Complete SQL recovery and Azure foundations; prepare two healthy cluster nodes.'}
                    </p>
                  )}
                  <ol>
                    {section.lessons.map((project) => (
                      <li key={project.id}>
                        <button onClick={() => openLesson(project.id)}>
                          <span>
                            {completed.includes(project.id) ? (
                              <Check size={15} />
                            ) : (
                              project.id.toUpperCase()
                            )}
                          </span>
                          <b>{project.title}</b>
                          <small>{project.description}</small>
                          <ArrowRight size={14} />
                        </button>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </details>
          ))}
      </div>
    </section>
  );
}

function LearnView({
  completed,
  openLesson,
}: {
  completed: string[];
  openLesson: (id: string) => void;
}) {
  return (
    <section className="migration-index">
      <header>
        <span className="eyebrow">LEARN IT / IN ORDER</span>
        <h1>Your Learning Pathways</h1>
        <p>
          Start at LAB 00. Open one stage, complete one named outcome, prove it,
          and then continue.
        </p>
      </header>
      <ProjectDirectory completed={completed} openLesson={openLesson} />
    </section>
  );
}

function JobView({
  completed,
  openLesson,
}: {
  completed: string[];
  openLesson: (id: string) => void;
}) {
  return (
    <section className="migration-index job-index">
      <header>
        <span className="eyebrow">DO THE JOB / EXACT WINDOWS TASK</span>
        <h1>Which named system are you working on?</h1>
        <p>
          Choose a specific outcome. The project opens directly, but its
          prerequisite and safety gates still apply.
        </p>
      </header>
      <div className="migration-task-grid">
        {migrationTasks.map((task) => (
          <TaskCard key={task.id} task={task} openLesson={openLesson} />
        ))}
      </div>
      <ProjectDirectory completed={completed} openLesson={openLesson} />
    </section>
  );
}

function LessonView({
  lesson,
  completed,
  toggle,
  openLesson,
}: {
  lesson: MigrationLesson;
  completed: string[];
  toggle: () => void;
  openLesson: (id: string) => void;
}) {
  const course = learningPathways.find((path) =>
    pathwayLessons(path).some((item) => item.id === lesson.id),
  )!;
  const display = pathwayLessons(course).find((item) => item.id === lesson.id)!;
  const blocks = useMemo(
    () => parseMigrationContent(referenceBody(lesson.body)),
    [lesson.body],
  );
  const guide = useMemo(() => parseGuidedLab(lesson.body), [lesson.body]);
  const pathwaySection = course.sections.find((section) =>
    section.lessons.some((item) => item.id === lesson.id),
  )!;
  const stage = {
    ...migrationStageFor(lesson.id)!,
    title: pathwaySection.title,
    plainEnglish: course.prerequisite,
    lessonIds: pathwaySection.lessons.map((item) => item.id),
  };
  const stageIndex = stage.lessonIds.indexOf(lesson.id);
  const sequence = lessonSequenceFor(lesson.id);
  const globalIndex = sequence.findIndex((item) => item.id === lesson.id);
  const stageCompleted = stage.lessonIds.filter((id) =>
    completed.includes(id),
  ).length;
  const next = sequence[globalIndex + 1];
  const previous = sequence[globalIndex - 1];
  return (
    <article className="migration-lesson">
      <nav className="you-are-here" aria-label="You are here">
        <span>YOU ARE HERE</span>
        <a href="/">SONIC-Academy</a>
        <ChevronRight size={13} />
        <a href="/migration#view=learn">{course.title}</a>
        <ChevronRight size={13} />
        <button onClick={() => openLesson(stage.lessonIds[0])}>
          {stage.title}
        </button>
        <ChevronRight size={13} />
        <b>{lesson.code}</b>
      </nav>
      <header className="lesson-hero">
        <div>
          <span className="eyebrow">
            {stage.title.toUpperCase()} · {stageIndex + 1} OF{' '}
            {stage.lessonIds.length}
          </span>
          <h1>{display.title}</h1>
          <p>{display.description}</p>
        </div>
        <div className="stage-progress">
          <strong>
            {stageCompleted} / {stage.lessonIds.length}
          </strong>
          <span>stage projects verified</span>
          <span className="stage-meter">
            <span
              style={{
                width: `${Math.round((stageCompleted / stage.lessonIds.length) * 100)}%`,
              }}
            />
          </span>
        </div>
      </header>
      <section className="migration-pane pane-warning">
        <span className="pane-label">BEFORE YOU CHANGE ANYTHING</span>
        <p>
          For Azure work, review estimated cost and approved limits before
          Create. For state-changing work, record the rollback first. SONIC does
          not execute cloud changes silently.
        </p>
      </section>
      <div className="lesson-content">
        {lesson.id === 'lab-19' ? (
          <TroubleshootingLibrary />
        ) : (
          guide && (
            <GuidedLab
              key={lesson.id}
              lessonId={lesson.id}
              guide={guide}
              purpose={display.description}
              screenshotLessonId={lesson.screenshotLessonId}
              stepOffset={lesson.stepOffset}
            />
          )
        )}
        {!guide && !lesson.separated && (
          <LessonVisualGuide key={lesson.id} lessonId={lesson.id} />
        )}
        {!guide && lesson.id !== 'lab-19' && <section className="lesson-reference-notes">
          <h2>Lesson instructions</h2>
          {blocks.map((block, index) => (
            <ContentBlock key={index} block={block} />
          ))}
        </section>}
      </div>



      <section className="lesson-complete">
        <div>
          <ShieldCheck size={22} />
          <span>
            <b>SELF-VERIFICATION</b>
            <small>
              Mark complete only after your actual lab evidence matches the pass
              check.
            </small>
          </span>
        </div>
        <button
          onClick={toggle}
          className={completed.includes(lesson.id) ? 'is-complete' : ''}
        >
          {completed.includes(lesson.id) ? (
            <Check size={17} />
          ) : (
            <span className="empty-check" />
          )}{' '}
          {completed.includes(lesson.id) ? 'VERIFIED' : 'MARK VERIFIED'}
        </button>
      </section>
      <nav className="lesson-pagination" aria-label="Lesson navigation">
        {previous ? (
          <a href={previous.href}>
            <ArrowLeft size={15} />
            <span>
              <small>PREVIOUS LAB</small>
              {previous.title}
            </span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={next.href}>
            <span>
              <small>NEXT LAB</small>
              {next.title}
            </span>
            <ArrowRight size={15} />
          </a>
        ) : (
          <span>COURSE ROUTE COMPLETE</span>
        )}
      </nav>
    </article>
  );
}

export function MigrationAcademy() {
  const [mode, setModeState] = useState<Mode>('home');
  const [lesson, setLesson] = useState<MigrationLesson | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [storageNotice, setStorageNotice] = useState('');

  useEffect(() => {
    const syncHash = () => {
      const params = new URLSearchParams(
        window.location.hash.replace(/^#/, ''),
      );
      const selected = migrationLessonById(params.get('lesson'));
      if (selected) {
        setLesson(selected);
        setModeState('lesson');
      } else if (params.get('view') === 'learn') setModeState('learn');
      else if (params.get('view') === 'job') setModeState('job');
      else if (params.get('view') === 'terminal') setModeState('terminal');
      else {
        setLesson(null);
        setModeState('home');
      }
    };
    const initialSync = window.setTimeout(() => {
      setCompleted(readMigrationProgress(lessonIds).completed);
      syncHash();
    }, 0);
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  const setMode = (next: Mode) => {
    setModeState(next);
    setLesson(null);
    window.location.hash = next === 'home' ? '' : `view=${next}`;
    window.scrollTo({ top: 0 });
  };
  const openLesson = (id: string) => {
    const selected = migrationLessonById(id);
    if (!selected) return;
    setLesson(selected);
    setModeState('lesson');
    window.location.hash = `lesson=${id}`;
    window.scrollTo({ top: 0 });
  };
  const toggle = () => {
    if (!lesson) return;
    const next = completed.includes(lesson.id)
      ? completed.filter((id) => id !== lesson.id)
      : [...completed, lesson.id];
    setCompleted(next);
    if (!writeMigrationProgress({ version: 1, completed: next }))
      setStorageNotice(
        'Progress is kept for this session because browser storage is unavailable.',
      );
  };

  if (mode === 'home') return <LearningConsole initialPathId="migrations" />;

  return (
    <ConsoleReaderShell
      lessonId={lesson?.id}
      tools={
        <>
          <button
            onClick={() => setMode('learn')}
            aria-current={mode === 'learn' ? 'page' : undefined}
          >
            All classes
          </button>
          <button
            onClick={() => setMode('job')}
            aria-current={mode === 'job' ? 'page' : undefined}
          >
            Learning paths
          </button>
          <button
            onClick={() => setMode('terminal')}
            aria-current={mode === 'terminal' ? 'page' : undefined}
          >
            Lab Terminal
          </button>
        </>
      }
    >
      <main>
        {mode === 'learn' && (
          <LearnView completed={completed} openLesson={openLesson} />
        )}
        {mode === 'job' && (
          <JobView completed={completed} openLesson={openLesson} />
        )}
        {mode === 'lesson' && lesson && (
          <LessonView
            key={lesson.id}
            lesson={lesson}
            completed={completed}
            toggle={toggle}
            openLesson={openLesson}
          />
        )}
        {mode === 'terminal' && <LabTerminal />}
        {storageNotice && <p className="storage-notice">{storageNotice}</p>}
      </main>
    </ConsoleReaderShell>
  );
}
