'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Home,
  Layers,
  BookOpen,
  FlaskConical,
  LifeBuoy,
  Bookmark,
  Search,
  Menu,
  UserRound,
  Terminal,
} from 'lucide-react';
import { learningPathways, pathwayLessons } from './learning-pathways';
import { guidedCourses } from '../lib/guided-courses';
import { careerPathways, standaloneCourses } from './career-pathways';
import { planLabel, lessonTier } from '../lib/plan-access';
import { useAcademy } from './academy-provider';
import { BrandLogo } from './brand-logo';
import { LabVerificationPanel } from './lab-verification-panel';
import { LabPassport, LabEnvironmentScope } from './lab-passport';
import { LessonTools } from './learning-rhythm';
import { ClickableLabMap } from './clickable-lab-map';
import { PrivateNotebook } from './private-notebook';
import { StepReferencePanel } from './step-reference-panel';
import { ModuleTest } from './module-test';
import './learner-experience.css';
import './learning-console.css';
import './lesson-reading.css';
import './reader-cleanup.css';
import './premium-steps.css';
import './premium-surfaces.css';
import './split-focus.css';
import './catalog-surfaces.css';
import './lesson-geometry.css';
import './interface-polish.css';
import './concise-steps.css';
import './quiet-desktop.css';
import './studio-site.css';
const allLessons = learningPathways.flatMap(pathwayLessons);
export function ConsoleReaderShell({
  lessonId,
  children,
  tools,
  activeView,
}: {
  lessonId?: string;
  children: ReactNode;
  tools?: ReactNode;
  activeView?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [outlineWide, setOutlineWide] = useState(false);
  const [desktopNavigation, setDesktopNavigation] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'full' | 'compact' | 'hidden'>(
    'full',
  );
  const menuButton = useRef<HTMLButtonElement>(null);
  function hideSidebar() {
    setSidebarMode('hidden');
    setMenuOpen(false);
    requestAnimationFrame(() =>
      menuButton.current?.focus({ preventScroll: true }),
    );
  }
  useEffect(() => {
    const media = window.matchMedia('(min-width: 801px)');
    const outlineMedia = window.matchMedia('(min-width: 1280px)');
    const sync = () => {
      setDesktopNavigation(media.matches);
      setOutlineWide(outlineMedia.matches);
    };
    sync();
    media.addEventListener('change', sync);
    outlineMedia.addEventListener('change', sync);
    const close = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        window.matchMedia('(max-width: 1279px)').matches
      ) {
        setMenuOpen(false);
        setOutlineOpen(false);
        menuButton.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener('keydown', close);
    return () => {
      media.removeEventListener('change', sync);
      outlineMedia.removeEventListener('change', sync);
      window.removeEventListener('keydown', close);
    };
  }, []);
  const academy = useAcademy();
  const referenceId =
    guidedCourses.find((item) =>
      item.lessons.some((lesson) => lesson.id === lessonId),
    )?.id ?? courseFallback();
  function courseFallback() {
    return lessonId?.startsWith('alma-') ? 'alma' : 'linux';
  }
  const course = learningPathways.find((path) =>
    pathwayLessons(path).some((l) => l.id === lessonId),
  );
  const career = careerPathways.find((path) =>
    path.subjects.includes(course?.id ?? ''),
  );
  const standalone = standaloneCourses.find((item) =>
    item.subjects.includes(course?.id ?? ''),
  );
  const completed = allLessons.filter((l) =>
    academy.completed.includes(l.id),
  ).length;
  const percent = Math.round((completed / allLessons.length) * 100);
  const courseCount = course
    ? pathwayLessons(course).filter((l) => academy.completed.includes(l.id))
        .length
    : 0;
  return (
    <>
      <LabEnvironmentScope id={course?.id}>
        <div
          id="quiet-desktop"
          className="learning-console console-reader academy-shell"
          data-lesson-id={lessonId}
          data-sidebar-mode={sidebarMode}
          data-quiet-outline={Boolean(course)}
          data-studio-dock={outlineWide && Boolean(lessonId)}
        >
          <a className="console-skip" href="#reader-content">
            Skip to learning
          </a>
          <header className="quiet-window-lip">
            {' '}
            <div
              className="sidebar-window-controls"
              role="group"
              aria-label="Navigation window controls"
            >
              <button
                type="button"
                className="sidebar-dot sidebar-dot-red"
                aria-label="Hide navigation"
                title="Hide navigation"
                onClick={hideSidebar}
              >
                ×
              </button>
              <button
                type="button"
                className="sidebar-dot sidebar-dot-yellow"
                aria-label="Compact navigation"
                title="Compact navigation"
                aria-pressed={sidebarMode === 'compact'}
                onClick={() => {
                  if (!desktopNavigation) {
                    setSidebarMode('full');
                    setMenuOpen(!menuOpen);
                    setOutlineOpen(false);
                  } else {
                    setSidebarMode(
                      sidebarMode === 'compact' ? 'full' : 'compact',
                    );
                  }
                }}
              >
                −
              </button>
              <button
                type="button"
                className="sidebar-dot sidebar-dot-green"
                aria-label="Restore full navigation"
                title="Restore full navigation"
                onClick={() => {
                  setSidebarMode('full');
                  setMenuOpen(!desktopNavigation);
                  setOutlineOpen(false);
                }}
              >
                +
              </button>
            </div>
            <span>CloudSeam Tech / SONIC-Academy</span>
          </header>
          <header className="console-commandbar studio-site-brandbar">
            <a
              href="/"
              className="studio-site-brand"
              aria-label="CloudSeam Tech home"
            >
              <BrandLogo wording="black" label="Cloud Seam Tech" />
            </a>
            <button
              ref={menuButton}
              className="console-menu"
              aria-label="Toggle navigation"
              aria-expanded={
                sidebarMode !== 'hidden' && (desktopNavigation || menuOpen)
              }
              aria-controls="academy-navigation"
              onClick={() => {
                if (window.matchMedia('(max-width: 800px)').matches) {
                  setSidebarMode('full');
                  setMenuOpen(!menuOpen);
                  setOutlineOpen(false);
                } else if (sidebarMode === 'hidden') {
                  setSidebarMode('full');
                } else {
                  hideSidebar();
                }
              }}
            >
              <Menu size={20} />
            </button>
            {course && (
              <button
                type="button"
                className="quiet-outline-toggle"
                aria-label="Toggle course outline"
                aria-expanded={outlineWide || outlineOpen}
                aria-controls="quiet-outline"
                onClick={() => {
                  setOutlineOpen(!outlineOpen);
                  setMenuOpen(false);
                }}
              >
                <Layers size={18} />
                <span>Lessons</span>
              </button>
            )}
            <form className="academy-search" action="/" role="search">
              <Search size={18} />
              <input
                name="q"
                type="search"
                placeholder="Search courses or labs"
                aria-label="Search courses and labs"
              />
            </form>
            {lessonId && course && (
              <div className="course-progress-strip">
                <a
                  href={
                    standalone
                      ? `/?view=courses&course=${standalone.id}`
                      : career
                        ? `/?view=paths&path=${career.id}`
                        : '/?view=paths'
                  }
                  className={activeView === 'paths' ? 'active' : ''}
                >
                  {course.title}
                </a>
                <span className="plan-badge">
                  {lessonTier(lessonId) === 'free' ? 'Free' : 'Apex · planned'}
                </span>
                <span>
                  {courseCount} of {pathwayLessons(course).length} labs complete
                </span>
                <progress
                  value={courseCount}
                  max={pathwayLessons(course).length}
                  aria-label={`${course.title} course progress`}
                />
                <button
                  type="button"
                  aria-label={
                    academy.bookmarks.includes(lessonId)
                      ? 'Remove lab bookmark'
                      : 'Bookmark this lab'
                  }
                  aria-pressed={academy.bookmarks.includes(lessonId)}
                  onClick={() => academy.toggleBookmark(lessonId)}
                >
                  <Bookmark size={15} />
                  {academy.bookmarks.includes(lessonId) ? 'Saved' : 'Bookmark'}
                </button>
                <a href="/profile">
                  {academy.user ? 'Account progress' : 'Save your progress →'}
                </a>
              </div>
            )}
            <div className="reader-tools">{tools}</div>
            <a
              className="profile-link profile-avatar-link"
              href="/profile"
              aria-label="My profile"
              title="My profile"
            >
              <span className="profile-avatar">
                {academy.user ? (
                  academy.user.name.slice(0, 2).toUpperCase()
                ) : (
                  <UserRound size={20} />
                )}
              </span>
            </a>
          </header>
          <aside
            className={'console-sidebar' + (menuOpen ? ' is-open' : '')}
            aria-label="Learning navigation"
            id="academy-navigation"
            inert={
              sidebarMode === 'hidden' || (!desktopNavigation && !menuOpen)
            }
          >
            <button
              type="button"
              className="sidebar-close"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
            >
              ×
            </button>
            <p className="studio-nav-heading">Your learning</p>
            <nav
              className="academy-primary-nav"
              aria-label="Academy navigation"
            >
              <a
                href="/"
                className={activeView === 'dashboard' ? 'active' : ''}
              >
                <Home size={18} />
                <span className="studio-nav-label">Overview</span>
              </a>
              <a
                href="/?view=paths"
                className={activeView === 'paths' ? 'active' : ''}
              >
                <Layers size={18} />
                <span className="studio-nav-label">Pathways</span>
              </a>
              <a
                href="/?view=courses"
                className={activeView === 'courses' ? 'active' : ''}
              >
                <BookOpen size={18} />
                <span className="studio-nav-label">All Courses</span>
              </a>
              <a href="/#resume-learning">
                <FlaskConical size={18} />
                <span className="studio-nav-label">My Learning</span>
              </a>
              <a
                href="/commands"
                className={activeView === 'commands' ? 'active' : ''}
                aria-current={activeView === 'commands' ? 'page' : undefined}
              >
                <Terminal size={18} />
                <span className="studio-nav-label">Commands</span>
              </a>
            </nav>
            <div className="academy-secondary-nav">
              <a href="/?view=bookmarks">
                <Bookmark size={17} />
                <span className="studio-nav-label">My Bookmarks</span>
              </a>
              <a href="/migration#lesson=lab-19">
                <LifeBuoy size={17} />
                <span className="studio-nav-label">Troubleshooting</span>
              </a>
            </div>
            <section
              className="sidebar-learning-details"
              aria-label="Your learning space"
            >
              <span>LEARN · BUILD · VERIFY</span>
              <p>
                {careerPathways.length} career pathways
                <br />
                {learningPathways.length} subjects · {allLessons.length} labs
              </p>
              <small>
                {academy.user
                  ? planLabel(academy.user.subscriptionTier)
                  : 'Guest learner · self-paced'}
              </small>
            </section>
            <div className="sidebar-information-links">
              <a href="/support">Help & FAQ</a>
              <a href="/plans">Plans</a>
              <a href="/support#contact">Contact us</a>
            </div>
            <div className="console-sidebar-foot">
              <span>MY PROGRESS</span>
              <div className="sidebar-progress">
                <strong>{percent}%</strong>
                <span>Overall completion</span>
              </div>
              <progress
                value={completed}
                max={allLessons.length}
                aria-label="Overall course completion"
              />
              <small>
                {academy.user
                  ? 'Saved to your account'
                  : 'Guest · saved in this browser'}
              </small>
            </div>
          </aside>
          {course && (
            <aside
              className={'quiet-outline' + (outlineOpen ? ' is-open' : '')}
              id="quiet-outline"
              aria-label="Course outline"
              inert={!outlineWide && !outlineOpen}
            >
              <header>
                <span className="quiet-kicker">
                  {career?.title ?? 'YOUR COURSE'}
                </span>
                <h2>{course.title}</h2>
                <button
                  type="button"
                  className="quiet-outline-close"
                  aria-label="Close course outline"
                  onClick={() => setOutlineOpen(false)}
                >
                  ×
                </button>
              </header>
              <nav aria-label="Lessons in this course">
                {course.sections.map((section) => (
                  <details
                    key={section.title}
                    open={section.lessons.some((l) => l.id === lessonId)}
                  >
                    <summary>{section.title}</summary>
                    {section.lessons.map((l, i) => (
                      <a
                        key={l.id}
                        href={l.href}
                        aria-current={l.id === lessonId ? 'page' : undefined}
                      >
                        <span>
                          {academy.completed.includes(l.id)
                            ? '✓'
                            : String(i + 1).padStart(2, '0')}
                        </span>
                        {l.title}
                      </a>
                    ))}
                  </details>
                ))}
              </nav>
              <p>Practice in your own lab. Completion is self-reported.</p>
            </aside>
          )}
          <div className="reader-workspace" id="reader-content">
            {/failed|unavailable/i.test(academy.syncMessage) && (
              <p className="account-sync-notice" role="status">
                {academy.syncMessage}
              </p>
            )}
            {children}
            {lessonId && (
              <>
                <LessonTools key={lessonId} />
                <LabPassport lessonId={lessonId} />
                <ClickableLabMap lessonId={lessonId} />
                {!outlineWide && <PrivateNotebook lessonId={lessonId} />}
                <ModuleTest lessonId={lessonId} />
                <LabVerificationPanel
                  key={`verification:${lessonId}`}
                  lessonId={lessonId}
                />
              </>
            )}
            <footer className="academy-footer">
              <span>CloudSeamTech · SONIC-Academy</span>
              <nav aria-label="Support and business information">
                <a href="/support#contact">Contact us</a>
                <a href="/support#faq">FAQ</a>
                <a href="/references">References</a>
                <a href="/support#billing">Billing information</a>
                <a href="/support#privacy">Privacy</a>
                <a href="/support#about">About us</a>
              </nav>
              <a href="/support#contact">Support email · coming soon</a>
              <a
                className="footer-brand"
                href="/"
                aria-label="Cloud Seam Tech home"
              >
                <BrandLogo />
              </a>
            </footer>
          </div>
          <aside
            className="studio-live-dock reader-workspace"
            aria-label="References and notes"
            hidden={!outlineWide || !lessonId}
          >
            {lessonId && (
              <>
                <h2>References &amp; notes</h2>
                <StepReferencePanel
                  lessonId={lessonId}
                  referenceId={referenceId}
                />
                <PrivateNotebook key={lessonId} lessonId={lessonId} />
              </>
            )}
          </aside>
        </div>
      </LabEnvironmentScope>
    </>
  );
}
