import { Terminal } from 'lucide-react';
import type { NessusStep } from '../../lib/nessus-curriculum';
import { contextFor, terminalLines } from '../../lib/terminal-presentation';
import { directoryMeaning } from './studio-learning-copy';

/** A code-native teaching example; never represents a connected shell or measured result. */
export function TraditionalTerminal({ step }: { step: NessusStep }) {
  const session = contextFor(step.where, step.terminal);
  const lines =
    session && step.command ? terminalLines(step.command, session) : [];
  return (
    <figure
      className="st-traditional-terminal"
      aria-label="Traditional terminal instructional example"
    >
      <header>
        <span>
          <Terminal size={17} />
          Terminal — {session?.shell === 'powershell' ? 'PowerShell' : 'Bash'}
        </span>
        <small>INSTRUCTIONAL EXAMPLE</small>
      </header>
      {session && (
        <p className="st-terminal-directory">
          Start in <code>{session.directory}</code> (
          {directoryMeaning(session.directory)}).
        </p>
      )}
      <pre aria-label="Commands with example prompts">
        {lines.length ? (
          lines.map((line, i) => (
            <code key={i}>
              <span className="st-shell-prompt">{line.prompt} </span>
              <span>{line.text}</span>
              {'\n'}
            </code>
          ))
        ) : (
          <code>{step.command}</code>
        )}
      </pre>
      <div className="st-terminal-expected">
        <span>WHAT TO LOOK FOR (EXAMPLE)</span>
        <pre>{step.expected}</pre>
      </div>
      <figcaption>
        Instructional terminal example · not a screenshot or connected VM.
        Usernames, hostnames and results will vary.
      </figcaption>
    </figure>
  );
}
