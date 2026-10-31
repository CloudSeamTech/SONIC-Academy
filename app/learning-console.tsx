'use client';
import { useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  Layers,
  TrendingUp,
  Cloud,
  Terminal,
  Monitor,
  ShieldCheck,
  Database,
  Bookmark,
  LifeBuoy,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import { ConsoleReaderShell } from './console-reader-shell';
import { QuietPathways } from './quiet-pathways';
import { BrandLogo } from './brand-logo';
import {
  learningPathways,
  pathwayLessons,
  type LearningPathway,
} from './learning-pathways';
import {
  careerPathways,
  careerSubjects,
  careerLessons,
  standaloneCourses,
  standaloneSubjects,
  standaloneLessons,
} from './career-pathways';
import { CyberActivityMap } from './cyber-activity-map';
import { CertificateJourney } from './certificate-journey';
import { CourseBrand } from './course-brand';
import { brandForCourse } from '../lib/course-brands';
import { lessonTier } from '../lib/plan-access';
import { useAcademy } from './academy-provider';
const lessons = learningPathways.flatMap(pathwayLessons);
const standaloneIds = new Set(
  standaloneCourses.flatMap((course) => course.subjects),
);
function PathIcon({ id }: { id: string }) {
  if (brandForCourse(id) || id === 'pki-certificate-management')
    return <CourseBrand id={id} />;
  const Icon =
    id === 'sql'
      ? Database
      : id.includes('security') ||
          id.includes('nessus') ||
          id === 'cyber-analyst'
        ? ShieldCheck
        : id.includes('linux') || id === 'alma'
          ? Terminal
          : id.includes('azure') ||
              id.includes('landing') ||
              id === 'migrations'
            ? Cloud
            : Monitor;
  return <Icon size={30} />;
}
export function LearningConsole(_props: { initialPathId?: string } = {}) {
  const academy = useAcademy();
  const [query, setQuery] = useState(''),
    [view, setView] = useState('dashboard'),
    [pathId, setPathId] = useState(''),
    [courseId, setCourseId] = useState(''),
    [subjectId, setSubjectId] = useState(''),
    [tier, setTier] = useState('all');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get('q') ?? '');
    const legacyCourse = standaloneCourses.some(
      (c) => c.id === params.get('path'),
    );
    setView(legacyCourse ? 'courses' : (params.get('view') ?? 'dashboard'));
    setCourseId(
      params.get('course') ?? (legacyCourse ? (params.get('path') ?? '') : ''),
    );
    setPathId(params.get('path') ?? '');
    setSubjectId(params.get('subject') ?? '');
    const requestedTier = params.get('tier') ?? 'all';
    setTier(
      ['all', 'free', 'apex'].includes(requestedTier) ? requestedTier : 'all',
    );
  }, []);
  const complete = new Set(
    academy.completed.filter((id) => lessons.some((l) => l.id === id)),
  );
  const viewed = new Set(academy.activity.map((a) => a.lesson_id));
  const inProgress = learningPathways.filter((p) => {
    const items = pathwayLessons(p);
    const count = items.filter((l) => complete.has(l.id)).length;
    return (
      count < items.length && (count > 0 || items.some((l) => viewed.has(l.id)))
    );
  });
  const inProgressCount =
    inProgress.filter((path) => !standaloneIds.has(path.id)).length +
    standaloneCourses.filter((course) => {
      const items = standaloneLessons(course.id);
      const count = items.filter((lesson) => complete.has(lesson.id)).length;
      return (
        count < items.length &&
        (count > 0 || items.some((lesson) => viewed.has(lesson.id)))
      );
    }).length;
  const recent = academy.activity
    .map((a) => ({ ...a, lesson: lessons.find((l) => l.id === a.lesson_id) }))
    .filter((a) => a.lesson);
  const contextSubject = learningPathways.find((path) => path.id === subjectId);
  const requestedLessons = courseId
    ? standaloneLessons(courseId)
    : careerLessons(pathId);
  const contextLessons = requestedLessons.length
    ? requestedLessons
    : contextSubject
      ? pathwayLessons(contextSubject)
      : lessons;
  const contextRecent = recent.find((item) =>
    contextLessons.some((lesson) => lesson.id === item.lesson_id),
  );
  const recentPath = learningPathways.find((path) =>
    pathwayLessons(path).some(
      (lesson) => lesson.id === contextRecent?.lesson_id,
    ),
  );
  const resume =
    (recentPath
      ? pathwayLessons(recentPath).find((lesson) => !complete.has(lesson.id))
      : undefined) ??
    contextLessons.find((lesson) => !complete.has(lesson.id)) ??
    contextLessons[0];
  const resumePath = learningPathways.find((p) =>
    pathwayLessons(p).some((l) => l.id === resume.id),
  )!;
  const resumeCount = pathwayLessons(resumePath).filter((l) =>
    complete.has(l.id),
  ).length;
  const percent = Math.round((complete.size / lessons.length) * 100);
  const selectedSubject = learningPathways.find(
    (path) => path.id === subjectId,
  );
  const filtered = (
    selectedSubject ? pathwayLessons(selectedSubject) : lessons
  ).filter(
    (l) =>
      (view !== 'bookmarks' || academy.bookmarks.includes(l.id)) &&
      (tier === 'all' || lessonTier(l.id) === tier) &&
      `${l.title} ${l.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  const showLibrary =
    Boolean(query) || ['courses', 'paths', 'bookmarks'].includes(view);
  const selectedCareer = careerPathways.find((path) => path.id === pathId);
  const selectedCourse = standaloneCourses.find(
    (course) => course.id === courseId,
  );
  function standaloneCard(course: (typeof standaloneCourses)[number]) {
    const items = standaloneLessons(course.id);
    const count = items.filter((lesson) => complete.has(lesson.id)).length;
    return (
      <a
        className="path-card standalone-course-card"
        href={`/?view=courses&course=${course.id}`}
        key={course.id}
      >
        <span className="path-icon">
          <PathIcon id={course.id} />
        </span>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <progress
          value={count}
          max={items.length}
          aria-label={`${course.title} course progress`}
        />
        <div>
          <span>2 server tracks · {items.length} labs</span>
          <strong>{Math.round((count / items.length) * 100)}%</strong>
        </div>
        <span>Choose your server →</span>
      </a>
    );
  }
  function careerCard(path: (typeof careerPathways)[number]) {
    const items = careerLessons(path.id),
      count = items.filter((l) => complete.has(l.id)).length;
    return (
      <a
        className="path-card career-card"
        href={`/?view=paths&path=${path.id}`}
        key={path.id}
      >
        <span className="path-icon">
          <PathIcon id={path.id} />
        </span>
        <h3>{path.title} Pathway</h3>
        <p>{path.description}</p>
        <progress
          value={count}
          max={items.length}
          aria-label={`${path.title} progress`}
        />
        <div>
          <span>
            {careerSubjects(path.id).length} subjects · {items.length} labs
          </span>
          <strong>{Math.round((count / items.length) * 100)}%</strong>
        </div>
        <span>Explore pathway →</span>
      </a>
    );
  }
  function pathCard(path: LearningPathway) {
    return subjectCard(path, `/?view=courses&subject=${path.id}`);
  }
  function subjectCard(path: LearningPathway, href: string) {
    const items = pathwayLessons(path),
      count = items.filter((l) => complete.has(l.id)).length;
    return (
      <a className={`path-card path-${path.id}`} href={href} key={path.id}>
        <span className="path-icon">
          <PathIcon id={path.id} />
        </span>
        <h3>{path.title}</h3>
        <p>{path.prerequisite}</p>
        <small>
          {items.filter((item) => lessonTier(item.id) === 'free').length} Free ·{' '}
          {items.filter((item) => lessonTier(item.id) === 'apex').length}{' '}
          planned Apex labs
        </small>
        <progress
          value={count}
          max={items.length}
          aria-label={`${path.title} progress`}
        />
        <div>
          <span>{items.length} labs</span>
          <strong>{Math.round((count / items.length) * 100)}%</strong>
        </div>
        <span className="card-action">Open course →</span>
      </a>
    );
  }
  return (
    <ConsoleReaderShell activeView={view}>
      <main className="academy-dashboard">
        <div className="dashboard-main">
          {!showLibrary ? (
            <>
              <section className="academy-hero">
                <div>
                  <span className="eyebrow">SONIC ACADEMY</span>
                  <h1>
                    Real Skills.
                    <br className="hero-mobile-break" /> <span>
                      Seamless
                    </span>{' '}
                    Growth.
                  </h1>
                  <p>
                    Step-by-step, hands-on training for Linux, Windows, Azure,
                    security, and more—built for real-world environments.
                  </p>
                  <div className="hero-actions">
                    <a className="primary-button" href={resume.href}>
                      {recent.length || complete.size
                        ? 'Continue Learning'
                        : 'Start Learning'}
                      <ArrowRight size={17} />
                    </a>
                    <a className="secondary-button" href="/?view=courses">
                      Browse All Courses
                    </a>
                  </div>
                </div>
                <div className="quiet-hero-brand">
                  <BrandLogo wording="white" />
                </div>
              </section>
              <section
                className="dashboard-metrics"
                aria-label="Your learning progress"
              >
                {[
                  {
                    label: 'Courses in Progress',
                    value: inProgressCount,
                    note: inProgressCount
                      ? 'Keep going!'
                      : 'Choose your first course',
                    Icon: BookOpen,
                  },
                  {
                    label: 'Labs Completed',
                    value: complete.size,
                    note: 'Self-verified in your lab',
                    Icon: FlaskConical,
                  },
                  {
                    label: 'Learning Paths',
                    value: careerPathways.length,
                    note: 'Explore your next skill',
                    Icon: Layers,
                  },
                  {
                    label: 'Overall Progress',
                    value: `${percent}%`,
                    note: `${complete.size} of ${lessons.length} labs`,
                    Icon: TrendingUp,
                  },
                ].map(({ label, value, note, Icon }) => (
                  <article key={label}>
                    <span className="metric-icon">
                      <Icon size={25} />
                    </span>
                    <div>
                      <p>{label}</p>
                      <strong>{value}</strong>
                      {label === 'Overall Progress' ? (
                        <progress
                          value={complete.size}
                          max={lessons.length}
                          aria-label="Overall progress"
                        />
                      ) : (
                        <small>{note}</small>
                      )}
                    </div>
                  </article>
                ))}
              </section>
              <section className="featured-paths">
                <header>
                  <h2>Featured Learning Paths</h2>
                  <a href="/?view=paths">
                    View All Paths <ArrowRight size={14} />
                  </a>
                </header>
                <div className="path-grid">
                  {careerPathways.map(careerCard)}
                </div>
              </section>
              <section className="explore-courses">
                <header>
                  <h2>Explore More Courses</h2>
                  <a href="/?view=courses">
                    View All Courses <ArrowRight size={14} />
                  </a>
                </header>
                <div className="course-grid">
                  {standaloneCourses.map(standaloneCard)}
                  {['splunk', 'mecm', 'wsus', 'alma'].map((id) => {
                    const path = learningPathways.find((p) => p.id === id)!;
                    return subjectCard(path, pathwayLessons(path)[0].href);
                  })}
                </div>
              </section>
              <section className="learning-guide">
                <h2>Your lab, at your pace</h2>
                <p>
                  Choose a subject, read its short lab summary, and follow one
                  step at a time. Each lab explains where to work, why the
                  action matters, and what to check before moving on.
                </p>
                <a href="/migration#lesson=lab-00">
                  New here? Set up your practice lab <ArrowRight size={15} />
                </a>
              </section>
            </>
          ) : (
            <section className="course-library">
              <header>
                <div>
                  <span className="eyebrow">YOUR NEXT SKILL STARTS HERE</span>
                  <h1>
                    {query
                      ? 'Search results'
                      : selectedCourse
                        ? selectedCourse.title
                        : view === 'bookmarks'
                          ? 'My Bookmarks'
                          : view === 'paths'
                            ? selectedCareer
                              ? `${selectedCareer.title} Pathway`
                              : 'Learning Paths'
                            : (selectedSubject?.title ?? 'All Courses')}
                  </h1>
                  <p>
                    {query
                      ? `Labs matching “${query}”`
                      : (selectedCourse?.description ??
                        selectedCareer?.description ??
                        selectedSubject?.prerequisite ??
                        'Choose a career pathway or a subject. Your lessons stay in order, from setup to daily operations.')}
                  </p>
                </div>
                <a href="/">Back to dashboard</a>
              </header>
              {selectedCareer?.id === 'cyber-analyst' && !query && (
                <CyberActivityMap />
              )}
              {selectedCourse && !query ? (
                <>
                  <CertificateJourney />
                  <h2>Choose your server</h2>
                  <p>
                    Follow one track from start to finish. Each track keeps its
                    own lab checks and progress.
                  </p>
                  <div className="path-grid">
                    {standaloneSubjects(selectedCourse.id).map(pathCard)}
                  </div>
                </>
              ) : view === 'paths' && !query ? (
                selectedCareer ? (
                  <>
                    <h2>Training in this pathway</h2>
                    <div className="path-grid">
                      {careerSubjects(selectedCareer.id).map(pathCard)}
                    </div>
                  </>
                ) : (
                  <QuietPathways />
                )
              ) : view === 'courses' &&
                !query &&
                !selectedSubject &&
                tier === 'all' ? (
                <div className="path-grid">
                  {standaloneCourses.map(standaloneCard)}
                  {learningPathways
                    .filter((path) => !standaloneIds.has(path.id))
                    .map(pathCard)}
                </div>
              ) : (
                <div className="lab-library-list">
                  <nav
                    className="catalog-tier-filters"
                    aria-label="Catalog plan filter"
                  >
                    {['all', 'free', 'apex'].map((value) => (
                      <a
                        key={value}
                        href={`/?view=${view}&subject=${encodeURIComponent(subjectId)}&q=${encodeURIComponent(query)}&tier=${value}`}
                        aria-current={tier === value ? 'page' : undefined}
                      >
                        {value === 'all'
                          ? 'All labs'
                          : value === 'free'
                            ? 'Free labs'
                            : 'Planned Apex labs'}
                      </a>
                    ))}
                  </nav>
                  <p className="catalog-plan-note">
                    Plan preview: labels show the proposed Free/Apex split.
                    Access restrictions and payments are not live yet.
                  </p>
                  {filtered.map((l) => (
                    <article key={l.id}>
                      <a href={l.href}>
                        <span className="plan-badge">
                          {lessonTier(l.id) === 'free'
                            ? 'Free'
                            : 'Apex · planned'}
                        </span>
                        <h2>{l.title}</h2>
                        <p>{l.description}</p>
                        <span>
                          {complete.has(l.id) ? 'Completed' : 'Open guided lab'}{' '}
                          <ChevronRight size={14} />
                        </span>
                      </a>
                      <button
                        type="button"
                        aria-label={`${academy.bookmarks.includes(l.id) ? 'Remove bookmark for' : 'Bookmark'} ${l.title}`}
                        aria-pressed={academy.bookmarks.includes(l.id)}
                        onClick={() => academy.toggleBookmark(l.id)}
                      >
                        <Bookmark
                          size={18}
                          fill={
                            academy.bookmarks.includes(l.id)
                              ? 'currentColor'
                              : 'none'
                          }
                        />
                      </button>
                    </article>
                  ))}
                  {!filtered.length && (
                    <p>
                      {view === 'bookmarks'
                        ? 'Save a lab using its bookmark button in All Courses.'
                        : 'No matching labs. Try a different title or topic.'}
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
        <aside className="dashboard-right" aria-label="Your learning activity">
          <section className="resume-card" id="resume-learning">
            <h2>Resume Learning</h2>
            <div className="resume-progress">
              <span>
                {resumeCount} of {pathwayLessons(resumePath).length} labs
                complete
              </span>
              <strong>
                {Math.round(
                  (resumeCount / pathwayLessons(resumePath).length) * 100,
                )}
                %
              </strong>
            </div>
            <progress
              value={resumeCount}
              max={pathwayLessons(resumePath).length}
              aria-label="Resume course progress"
            />
            <div className="resume-lesson">
              <span className="path-icon">
                <PathIcon id={resumePath.id} />
              </span>
              <div>
                <h3>{resume.title}</h3>
                <p>{resumePath.title}</p>
              </div>
            </div>
            <a className="primary-button" href={resume.href}>
              {recent.length || complete.size
                ? 'Continue'
                : 'Begin your first lab'}
              <ArrowRight size={16} />
            </a>
          </section>
          <section className="recent-card">
            <header>
              <h2>Recent Activity</h2>
              <a href="/profile">My profile</a>
            </header>
            {recent.length ? (
              recent.slice(0, 5).map((a) => (
                <a
                  className="activity-row"
                  href={a.lesson!.href}
                  key={a.lesson_id}
                >
                  <span className="activity-icon">
                    <BookOpen size={17} />
                  </span>
                  <div>
                    <h3>{a.lesson!.title}</h3>
                    <p>
                      {complete.has(a.lesson_id) ? 'Completed' : 'Opened'} ·{' '}
                      {new Date(a.visited_at).toLocaleDateString()}
                    </p>
                  </div>
                </a>
              ))
            ) : (
              <p className="empty-activity">
                Your learning journey starts here. Open a lab and your recent
                activity will appear in this space.
              </p>
            )}
          </section>
          <section className="quick-card">
            <h2>Quick Links</h2>
            <div>
              <a href="/migration#lesson=lab-00">
                <FlaskConical size={20} />
                Practice Labs
              </a>
              <a href="/?view=courses">
                <FolderOpen size={20} />
                Course Library
              </a>
              <a href="/migration#lesson=lab-19">
                <LifeBuoy size={20} />
                Troubleshooting
              </a>
              <a href="/?view=bookmarks">
                <Bookmark size={20} />
                My Bookmarks
              </a>
            </div>
          </section>
          <section className="account-card">
            <h3>
              {academy.user
                ? `Your space, ${academy.user.name}`
                : 'Make your progress yours'}
            </h3>
            <p>
              {academy.user
                ? academy.syncMessage
                : 'Sign in to save your progress across devices. You can also learn as a guest.'}
            </p>
            <a href="/profile">
              {academy.user ? 'Manage profile' : 'Set up my profile'}{' '}
              <ArrowRight size={14} />
            </a>
          </section>
        </aside>
      </main>
    </ConsoleReaderShell>
  );
}
