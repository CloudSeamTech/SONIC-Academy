import { learnerActions } from '@/lib/learner-directions';
export function BeginnerActions({ text }: { text: string }) {
  return (
    <ol className="beginner-actions">
      {learnerActions(text).map((action, index) => (
        <li key={`${index}-${action}`}>{action}</li>
      ))}
    </ol>
  );
}
export function BeginnerWords() {
  return (
    <p className="beginner-words-link">
      <a href="/lab-guide#words">
        New to an IT term? Open the plain-English word guide →
      </a>
    </p>
  );
}
