'use client';
/* oxlint-disable next/no-html-link-for-pages -- Native links preserve existing Vinext hash navigation. */
import { useEffect, useState } from 'react';
import {
  Home,
  Layers,
  BookOpen,
  NotebookPen,
  FolderOpen,
  UserRound,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Check,
  Menu,
  X,
  Target,
  Terminal,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { BrandLogo } from '../brand-logo';
import { CourseBrand } from '../course-brand';
import { careerPathways, careerSubjects } from '../career-pathways';
import { pathwayLessons } from '../learning-pathways';
import { dailyAdminCourse } from '../../lib/guided-courses';
import { contextFor, terminalLines } from '../../lib/terminal-presentation';
import { useAcademy } from '../academy-provider';
import { CourseScreenshot } from '../course-screenshot';
import { showStepScreenshot } from '../../lib/step-media';
import { TraditionalTerminal } from './traditional-terminal';
import { CommandCoach } from './command-coach';
import { studioActionCopy } from './studio-learning-copy';
import './studio-rebuild.css';

type View = 'overview' | 'paths' | 'lesson';
const course = dailyAdminCourse;
export function StudioRebuild() {
  const academy = useAcademy();
  const [view, setView] = useState<View>('lesson');
  const [pathId, setPathId] = useState('linux-system-administration');
  const [lessonIndex, setLessonIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [checks, setChecks] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [railHidden, setRailHidden] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(true);
  const [query, setQuery] = useState('');
  const lesson = course.lessons[lessonIndex];
  const step = lesson.steps[stepIndex];
  const key = `cloudseam-studio-review:${lesson.id}:${stepIndex}`;
  const path = careerPathways.find((p) => p.id === pathId)!;
  const subjects = careerSubjects(path.id);
  const count = step.actions.filter((a) => checks.includes(a)).length;
  const session = contextFor(step.where, step.terminal);
  const lines =
    step.command && session ? terminalLines(step.command, session) : [];
  const traditionalTerminal = Boolean(
    step.command && session && step.screenshot.status === 'illustration',
  );
  useEffect(() => {
    const load = () => {
      try {
        const v = JSON.parse(localStorage.getItem(key) ?? '[]');
        setChecks(
          Array.isArray(v)
            ? v.filter(
                (a: unknown): a is string =>
                  typeof a === 'string' && step.actions.includes(a),
              )
            : [],
        );
      } catch {
        setChecks([]);
      }
    };
    const frame = requestAnimationFrame(load);
    const sync = (event: StorageEvent) => {
      if (event.key === key) load();
    };
    window.addEventListener('storage', sync);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('storage', sync);
    };
  }, [key, step.actions]);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNavOpen(false);
        setOutlineOpen(false);
        setHelpOpen(false);
      }
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);
  function chooseLesson(i: number) {
    setLessonIndex(i);
    setStepIndex(0);
    setView('lesson');
    setOutlineOpen(false);
    setHelpOpen(false);
  }
  function toggle(action: string) {
    const next = checks.includes(action)
      ? checks.filter((a) => a !== action)
      : [...checks, action];
    setChecks(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      setNotice('Preview checks remain in this tab.');
    }
  }

  function move(delta: number) {
    setStepIndex((i) =>
      Math.max(0, Math.min(lesson.steps.length - 1, i + delta)),
    );
    setHelpOpen(false);
    setNotice('');
  }
  const nav = [
    { id: 'overview', title: 'Overview', Icon: Home },
    { id: 'paths', title: 'Pathways', Icon: Layers },
    { id: 'lesson', title: 'My learning', Icon: BookOpen },
  ] as const;
  return (
    <div
      id="studio-rebuild"
      data-view={view}
      data-steps={stepsOpen}
      data-nav-hidden={navHidden}
      data-rail-hidden={railHidden}
    >
      <div className="st-lip">
        <div className="st-traffic">
          <button
            aria-label="Hide navigation"
            onClick={() => {
              setNavOpen(false);
              setNavHidden(true);
            }}
          >
            ×
          </button>
          <button
            aria-label="Toggle course outline"
            onClick={() => {
              if (window.matchMedia('(min-width:921px)').matches) {
                setRailHidden(!railHidden);
              } else {
                setOutlineOpen(!outlineOpen);
              }
            }}
          >
            −
          </button>
          <button
            aria-label="Show navigation"
            onClick={() => {
              setNavOpen(true);
              setNavHidden(false);
            }}
          >
            +
          </button>
        </div>
        <span>DESIGN REVIEW · NOT PUBLISHED</span>
      </div>
      <header className="st-brandbar">
        <button
          className="st-mobile-menu"
          aria-label="Open navigation"
          onClick={() => setNavOpen(!navOpen)}
        >
          <Menu size={22} />
        </button>
        <button
          className="st-home-brand"
          aria-label="CloudSeam overview"
          onClick={() => setView('overview')}
        >
          <BrandLogo />
        </button>
        <div className="st-header-context">
          <BookOpen size={20} />
          <span>
            {view === 'lesson' ? course.title : 'Your learning studio'}
          </span>
        </div>
        <a className="st-profile" href="/profile">
          <UserRound size={20} />
          <span>{academy.user?.name ?? 'Profile'}</span>
        </a>
      </header>
      <nav
        className={'st-global-nav' + (navOpen ? ' st-open' : '')}
        aria-label="Studio navigation"
      >
        <p>Your learning</p>
        {nav.map(({ id, title, Icon }) => (
          <button
            key={id}
            aria-current={view === id ? 'page' : undefined}
            onClick={() => {
              setView(id);
              setNavOpen(false);
            }}
          >
            <Icon size={21} />
            <span>{title}</span>
          </button>
        ))}
        <a href="/?view=courses">
          <BookOpen size={21} />
          <span>All courses</span>
        </a>
        <a href="/profile#notebook">
          <NotebookPen size={21} />
          <span>My notebook</span>
        </a>
        <a href="/references">
          <FolderOpen size={21} />
          <span>Resources</span>
        </a>
        <a className="st-nav-profile" href="/profile">
          <UserRound size={21} />
          <span>Profile</span>
        </a>
        <div className="st-private">
          <ShieldCheck size={18} />
          <span>
            Your lab. Your pace.
            <small>Practice runs on your own machines.</small>
          </span>
        </div>
      </nav>
      <aside
        className={'st-learning-rail' + (outlineOpen ? ' st-open' : '')}
        aria-label="Learning outline"
      >
        <button
          className="st-rail-close"
          aria-label="Close outline"
          onClick={() => setOutlineOpen(false)}
        >
          <X size={18} />
        </button>
        <span className="st-rail-label">
          {view === 'lesson' ? 'YOUR COURSE' : 'CHOOSE A DIRECTION'}
        </span>
        <h2>{view === 'lesson' ? course.title : 'Learning pathways'}</h2>
        {view === 'lesson' ? (
          <nav aria-label="Course lessons">
            {course.lessons.map((l, i) => (
              <button
                key={l.id}
                className={i === lessonIndex ? 'st-current' : ''}
                aria-current={i === lessonIndex ? 'page' : undefined}
                onClick={() => chooseLesson(i)}
              >
                <span className="st-ordinal">
                  {academy.completed.includes(l.id) ? (
                    <Check size={14} />
                  ) : (
                    String(i + 1).padStart(2, '0')
                  )}
                </span>
                <span>{l.title.replace(/^Start Here: /, '')}</span>
              </button>
            ))}
          </nav>
        ) : (
          <nav aria-label="Pathway choices">
            {careerPathways.map((p) => (
              <button
                key={p.id}
                className={p.id === pathId ? 'st-current' : ''}
                aria-pressed={p.id === pathId}
                onClick={() => {
                  setPathId(p.id);
                  setView('paths');
                  setOutlineOpen(false);
                }}
              >
                <span className="st-rail-icon">
                  {p.id === 'cyber-analyst' ? (
                    <ShieldCheck size={23} />
                  ) : (
                    <CourseBrand id={p.id} />
                  )}
                </span>
                <span>{p.title}</span>
              </button>
            ))}
          </nav>
        )}
      </aside>
      <main className="st-canvas">
        <button
          className="st-outline-button"
          onClick={() => setOutlineOpen(!outlineOpen)}
        >
          <Layers size={16} /> {view === 'lesson' ? 'Lessons' : 'Pathways'}
        </button>
        {view === 'lesson' ? (
          <>
            <div className="st-breadcrumb">
              Linux System Administration <ChevronRight size={13} />
              <span>{lesson.title}</span>
            </div>
            <div className="st-lesson-title">
              <h1>{step.title}</h1>
              <span>
                Step {stepIndex + 1} of {lesson.steps.length}
              </span>
              {!stepsOpen && (
                <button onClick={() => setStepsOpen(true)}>
                  Show steps <ArrowRight size={15} />
                </button>
              )}
            </div>
            <div className="st-enterprise">
              <Target size={21} />
              <p>{(step.guide?.why ?? lesson.why).split(/(?<=[.!?])\s+(?=[A-Z])/)[0]}</p>
            </div>
            <p className="st-workspace-label">{step.where}</p>
            <div className="st-visual-stage">
              {step.command && (
                <div className="st-reference-toolbar">
                  <span>Step reference</span>
                </div>
              )}
              {traditionalTerminal ? (
                <TraditionalTerminal step={step} />
              ) : showStepScreenshot(`${lesson.id}:${stepIndex + 1}`, step) ? (
                <CourseScreenshot
                  step={step}
                  stepId={`${lesson.id}:${stepIndex + 1}`}
                />
              ) : (
                <figure
                  className="st-location-guide"
                  aria-label={`Instructional guide: ${step.title}`}
                >
                  <Terminal size={48} />
                  <h2>{step.title}</h2>
                  <p>{step.where}</p>
                  <small>Instructional guide · not a screenshot</small>
                </figure>
              )}
            </div>
            <section className="st-what-why" aria-label="What and why">
              <h2>Here’s what we’re doing</h2>
              <p>{step.guide?.why ?? lesson.why}</p>
              <p>
                <strong>When you’re done:</strong>{' '}
                {step.guide?.verify ?? step.expected}
              </p>
            </section>
            {step.command && (
              <CommandCoach key={`${lesson.id}:${stepIndex}`} step={step} />
            )}
            {step.command && !traditionalTerminal && (
              <details
                className="st-command"
                open={
                  !showStepScreenshot(`${lesson.id}:${stepIndex + 1}`, step)
                }
              >
                <summary>
                  <span>
                    <Terminal size={16} />{' '}
                    {session?.shell === 'powershell' ? 'PowerShell' : 'Bash'} ·
                    example prompts
                  </span>
                </summary>
                <pre>
                  {lines.length ? (
                    lines.map((line, i) => (
                      <code key={i}>
                        <span>{line.prompt} </span>
                        {line.text}
                        {'\n'}
                      </code>
                    ))
                  ) : (
                    <code>{step.command}</code>
                  )}
                </pre>
                <small>
                  Type the input yourself. Your user, hostname and directory may
                  differ.
                </small>
              </details>
            )}
            <footer className="st-canvas-footer">
              <ShieldCheck size={17} /> Practice in your own lab · completion is
              self-reported.<output>{notice}</output>
            </footer>
          </>
        ) : (
          <>
            <div className="st-breadcrumb">
              Your learning <ChevronRight size={13} />
              {view === 'overview' ? 'Overview' : 'Pathways'}
            </div>
            <div className="st-discover-heading">
              <span className="st-section-label">
                {view === 'overview'
                  ? 'YOUR NEXT CHAPTER'
                  : 'BUILD YOUR SKILLS, IN ORDER'}
              </span>
              <h1>
                {view === 'overview'
                  ? 'Learn it. Build it. Prove it.'
                  : path.title}
              </h1>
              <p>
                {view === 'overview'
                  ? 'Choose a direction. Work through one clear step at a time.'
                  : path.description}
              </p>
            </div>
            {view === 'overview' ? (
              <div className="st-start-scene">
                <div className="st-orbit" aria-hidden="true">
                  <div />
                  <div />
                  <div />
                  <BookOpen size={44} />
                </div>
                <span className="st-section-label">
                  PICK UP WHERE YOU LEFT OFF
                </span>
                <h2>{lesson.title}</h2>
                <p>{lesson.description}</p>
                <button
                  className="st-primary"
                  onClick={() => setView('lesson')}
                >
                  Open learning workspace <ArrowRight size={19} />
                </button>
                <button
                  className="st-text-button"
                  onClick={() => setView('paths')}
                >
                  Explore the pathways
                </button>
              </div>
            ) : (
              <section
                className="st-course-index"
                aria-label="Courses in selected pathway"
              >
                <label className="st-filter">
                  <Search size={18} />
                  <input
                    placeholder="Find a course in this pathway"
                    aria-label="Find a course"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                {subjects
                  .filter((s) =>
                    s.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((s, i) => {
                    const list = pathwayLessons(s),
                      completed = list.filter((l) =>
                        academy.completed.includes(l.id),
                      ).length;
                    return (
                      <div className="st-course-row" key={s.id}>
                        <span className="st-course-number">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="st-course-logo">
                          <CourseBrand id={s.id} />
                        </span>
                        <div>
                          <h3>{s.title}</h3>
                          <p>
                            {list.length} lessons · {completed} complete
                          </p>
                        </div>
                        {s.id === 'linux-daily-admin' ? (
                          <button
                            aria-label={`Preview ${s.title}`}
                            onClick={() => chooseLesson(0)}
                          >
                            <ArrowRight size={22} />
                          </button>
                        ) : (
                          <a
                            href={'/?view=courses&subject=' + s.id}
                            aria-label={`Open ${s.title}`}
                          >
                            <ArrowRight size={22} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                {!subjects.some((s) =>
                  s.title.toLowerCase().includes(query.toLowerCase()),
                ) && <p className="st-empty">No courses match that search.</p>}
                <a className="st-standalone" href="/pki">
                  Standalone course <strong>PKI Certificate Management</strong>
                  <ArrowRight size={19} />
                </a>
              </section>
            )}
            <footer className="st-canvas-footer">
              <ShieldCheck size={17} /> Your existing courses and saved progress
              stay with you.
            </footer>
          </>
        )}
      </main>
      {view === 'lesson' && stepsOpen ? (
        <aside className="st-steps-dock" aria-label="Current step checklist">
          <header>
            <h2>
              <BookOpen size={21} /> Steps
            </h2>
            <button
              aria-label="Close steps"
              onClick={() => setStepsOpen(false)}
            >
              <X size={20} />
            </button>
          </header>
          <div className="st-check-count">
            {count} of {step.actions.length} checked
          </div>
          <div
            className="st-step-progress"
            aria-label={`Step ${stepIndex + 1} of ${lesson.steps.length}`}
          >
            {lesson.steps.map((s, i) => (
              <button
                key={s.title}
                aria-label={`Go to step ${i + 1}: ${s.title}`}
                aria-current={i === stepIndex ? 'step' : undefined}
                onClick={() => {
                  setStepIndex(i);
                  setHelpOpen(false);
                }}
              >
                {i < stepIndex ? <Check size={12} /> : i + 1}
              </button>
            ))}
          </div>
          <div className="st-checks">
            {step.actions.map((a, i) => (
              <label key={a}>
                <input
                  type="checkbox"
                  checked={checks.includes(a)}
                  onChange={() => toggle(a)}
                />
                <span>
                  <small>{String(i + 1).padStart(2, '0')}</small>
                  {studioActionCopy(lesson.id, stepIndex, i, a)}
                </span>
              </label>
            ))}
          </div>
          <div className="st-success">
            <span>WHAT SUCCESS LOOKS LIKE</span>
            <p>{step.expected}</p>
          </div>
          <div className="st-step-buttons">
            <button onClick={() => move(-1)} disabled={stepIndex === 0}>
              <ArrowLeft size={17} /> Previous
            </button>
            <button
              className="st-primary"
              onClick={() => move(1)}
              disabled={stepIndex === lesson.steps.length - 1}
            >
              Next step <ArrowRight size={17} />
            </button>
          </div>
          <button
            className="st-help-button"
            aria-expanded={helpOpen}
            onClick={() => setHelpOpen(!helpOpen)}
          >
            Need help? <ChevronRight size={15} />
          </button>
          {helpOpen && (
            <section className="st-help">
              <h3>Before you start</h3>
              <ul>
                {lesson.needs?.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <h3>Recovery and troubleshooting</h3>
              {lesson.troubleshooting.map((t) => (
                <p key={t.problem}>
                  <strong>{t.problem}</strong> {t.fix}
                </p>
              ))}
              <a href={`/linux-admin#lesson=${lesson.id}`}>
                Open the complete lesson, notebook and assessments →
              </a>
            </section>
          )}
          <a
            className="st-full-lesson"
            href={`/linux-admin#lesson=${lesson.id}`}
          >
            Full lesson & assessments <ArrowRight size={14} />
          </a>
        </aside>
      ) : (
        <aside className="st-study-dock">
          <span className="st-section-label">YOUR STUDY SPACE</span>
          <h2>
            A little progress.
            <br />
            Every session.
          </h2>
          <p>Your saved course progress is available in your profile.</p>
          <div className="st-study-progress">
            <strong>{academy.completed.length}</strong>
            <span>lessons completed</span>
          </div>
          <a href="/profile">
            Open your profile <ArrowRight size={16} />
          </a>
          <div className="st-dock-bottom">
            <NotebookPen size={25} />
            <h3>Keep the evidence.</h3>
            <p>
              Save what you learned and the results you checked in your private
              notebook.
            </p>
            <a href="/profile#notebook">
              My notebook <ArrowRight size={16} />
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}
