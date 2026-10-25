import { explainStep } from '@/lib/step-coaching';

/** Readable technical teaching note; supplemental, not a replacement for commands. */
export function StepTeachingNotes({
  lessonId,
  title,
  action,
  expected,
  command,
}: {
  lessonId: string;
  title: string;
  action: string;
  expected: string;
  command?: string;
}) {
  const note = explainStep({ lessonId, title, action, expected, command });
  return (
    <section className="coaching-brief" aria-label="Meaning of this step">
      <p>
        <strong>Why this matters:</strong> {note.reason}
      </p>
      {note.commandNotes.length > 0 && (
        <section className="coaching-command">
          <h4>What the command means</h4>
          <ul>
            {note.commandNotes.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
