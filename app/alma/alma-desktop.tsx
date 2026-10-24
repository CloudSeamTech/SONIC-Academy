'use client';
import Link from 'next/link';
import { welcomeFor } from '@/lib/lesson-welcome';
import { useEffect, useState, useSyncExternalStore } from 'react';
import course from '@/content/alma/desktop-lessons.json';
import { ConsoleReaderShell } from '../console-reader-shell';
import { GuidedLab } from '../migration/guided-lab';
import {
  almaSnapshot,
  almaServerSnapshot,
  subscribeAlma,
  toggleAlmaLesson,
} from '@/lib/alma-progress';
import './alma.css';

export function AlmaDesktop() {
  const [id, setId] = useState(course.lessons[0].id);
  const [notice, setNotice] = useState('');
  const completed = JSON.parse(
    useSyncExternalStore(subscribeAlma, almaSnapshot, almaServerSnapshot),
  ) as string[];
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
  }, []);
  const index = course.lessons.findIndex((lesson) => lesson.id === id);
  const lesson = course.lessons[index];
  return (
    <ConsoleReaderShell
      lessonId={id}
      tools={<Link href="/migration#view=terminal">Lab Terminal</Link>}
    >
      <main className="alma-reader">
        <header className="alma-header">
          <span className="eyebrow">
            ALMALINUX DESKTOP / {String(index + 1).padStart(2, '0')} OF{' '}
            {course.lessons.length}
          </span>
          <p>{course.title}</p>
          <h1>{lesson.title}</h1>
          <p>{welcomeFor(id)?.welcome ?? lesson.description}</p>
          <small>
            {course.baseline} · {completed.length}/{course.lessons.length}{' '}
            classes self-verified
          </small>
        </header>
        {id === 'alma-real-terminal' && <p><a href="/migration#view=terminal&setup=1">Start here: install Node.js, npm and Git with the Windows setup guide →</a></p>}
        <p><a href="/?view=courses&subject=alma">Browse AlmaLinux Desktop classes →</a></p>
        <article key={id}>
          <GuidedLab
            lessonId={id}
            guide={lesson.guide}
            purpose={lesson.description}
          />
          <section className="alma-verify">
            <h2>Finished? Check your work</h2>
            <p>{lesson.guide.pass}</p>
            <p>
              Mark this only after checking your own results. Step notes and
              class verification are separate; this website does not detect
              changes on your computer.
            </p>
            <button
              onClick={() => {
                if (!toggleAlmaLesson(id))
                  setNotice(
                    'Browser storage is unavailable; verification could not be saved.',
                  );
              }}
              aria-pressed={completed.includes(id)}
            >
              {completed.includes(id)
                ? '✓ Verified · undo'
                : 'I verified this in my lab'}
            </button>
            <output aria-live="polite">{notice}</output>
          </section>
          <nav className="alma-pagination" aria-label="Class pagination">
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
        </article>
        <p className="lesson-reference-link"><a href="/references#alma">Official references and version notes →</a></p>
      </main>
    </ConsoleReaderShell>
  );
}
