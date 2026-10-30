import { ExamConnection } from './exam-connection';
import { LabExamplePlan } from './lab-example-plan';
import {
  welcomeFor,
  type LessonWelcome as Welcome,
} from '@/lib/lesson-welcome';
import './lesson-welcome.css';

export function LessonWelcome({
  lessonId,
  content,
  showIntro = true,
}: {
  lessonId?: string;
  content?: Welcome;
  showIntro?: boolean;
}) {
  const welcome = content ?? (lessonId ? welcomeFor(lessonId) : undefined);
  if (!welcome) return null;
  return (
    <details
      className="teacher-welcome lesson-support"
      aria-label="Let’s get ready"
    >
      <summary>Before you start · prerequisites and lab values</summary>
      {lessonId && <LabExamplePlan lessonId={lessonId} />}
      {lessonId && <ExamConnection lessonId={lessonId} />}
      {showIntro && <p className="teacher-intro">{welcome.welcome}</p>}
      <aside className="teaching-callout">
        <h3>Why this matters</h3>
        <p>{welcome.why}</p>
      </aside>
      <section className="teacher-preparation">
        <h3>What you’ll need</h3>
        <ul>
          {welcome.needs.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
        <p>
          <strong>Your first move: </strong>
          {welcome.firstMove}
        </p>
      </section>
    </details>
  );
}
