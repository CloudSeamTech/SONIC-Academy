import { examRelevance } from '../lib/exam-relevance';
export function ExamConnection({ lessonId }: { lessonId: string }) {
  const note = examRelevance(lessonId);
  if (!note) return null;
  return <aside className="exam-connection teaching-callout" aria-label="Certification connection">
    <h3>Certification connection</h3>
    <p><strong>{note.exam}:</strong> {note.skill}</p>
    <a href={note.url} target="_blank" rel="noreferrer">Check the official exam skills →</a>
    <p className="exam-scope">This lesson supports these skills; it is not a complete exam preparation course.</p>
  </aside>;
}
