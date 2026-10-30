'use client';
import { useEffect, useState, type ReactNode } from 'react';
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
} from 'lucide-react';
import { learningPathways, pathwayLessons } from './learning-pathways';
import { careerPathways, standaloneCourses } from './career-pathways';
import { planLabel, lessonTier } from '../lib/plan-access';
import { useAcademy } from './academy-provider';
import { BrandLogo } from './brand-logo';
import { LabPassport, LabEnvironmentScope } from './lab-passport';
import { LessonTools } from './learning-rhythm';
import { ClickableLabMap } from './clickable-lab-map';
import { PrivateNotebook } from './private-notebook';
import { ModuleTest } from './module-test';
import './learner-experience.css';
import './learning-console.css';
import './lesson-reading.css';
import './reader-cleanup.css';
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
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);
  const academy = useAcademy();
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
    <LabEnvironmentScope id={course?.id}>
      <div
        className="learning-console console-reader academy-shell"
        data-lesson-id={lessonId}
      >
        <a className="console-skip" href="#reader-content">
          Skip to learning
        </a>
        <aside
          className={'console-sidebar' + (menuOpen ? ' is-open' : '')}
          aria-label="Learning navigation"
        >
          <button
            type="button"
            className="sidebar-close"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
          <div className="console-brand">
            <a href="/" className="academy-brand">
              <BrandLogo
                wording="white"
                className="academy-logo"
                label="Cloud Seam Tech — SONIC-Academy home"
              />
            </a>
          </div>
          <nav className="academy-primary-nav" aria-label="Academy navigation">
            <a href="/" className={activeView === 'dashboard' ? 'active' : ''}>
              <Home size={18} />
              Dashboard
            </a>
            <a
              href="/?view=paths"
              className={activeView === 'paths' ? 'active' : ''}
            >
              <Layers size={18} />
              Learning Paths
            </a>
            <a
              href="/?view=courses"
              className={activeView === 'courses' ? 'active' : ''}
            >
              <BookOpen size={18} />
              All Courses
            </a>
            <a href="/migration#lesson=lab-00">
              <FlaskConical size={18} />
              Start Your Lab
            </a>
          </nav>
          <div className="academy-secondary-nav">
            <a href="/?view=bookmarks">
              <Bookmark size={17} />
              My Bookmarks
            </a>
            <a href="/migration#lesson=lab-19">
              <LifeBuoy size={17} />
              Troubleshooting
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
        <div className="reader-workspace" id="reader-content">
          <header className="console-commandbar">
            <button
              className="console-menu"
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={20} />
            </button>
            <form className="academy-search" action="/" role="search">
              <Search size={18} />
              <input
                name="q"
                type="search"
                placeholder="Search courses or labs"
                aria-label="Search courses and labs"
              />
            </form>
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
          {/failed|unavailable/i.test(academy.syncMessage) && (
            <p className="account-sync-notice" role="status">
              {academy.syncMessage}
            </p>
          )}
          {lessonId && (
            <>
              <LessonTools key={lessonId} />
              <LabPassport lessonId={lessonId} />
              <ClickableLabMap lessonId={lessonId} />
            </>
          )}
          {children}
          {lessonId && (
            <>
              <PrivateNotebook lessonId={lessonId} />
              <ModuleTest lessonId={lessonId} />
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
      </div>
    </LabEnvironmentScope>
  );
}
