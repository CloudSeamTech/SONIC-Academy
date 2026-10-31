'use client';
import { useState } from 'react';
import { teachingInputs } from '../lib/teaching-inputs';
import { useRecordedEnvironment } from './lab-passport';
import {
  contextFor,
  promptFor,
  terminalLines,
  type TerminalContext,
} from '../lib/terminal-presentation';
import './learner-experience.css';

export function TerminalExample({
  command,
  where,
  context,
  breakdown = [],
}: {
  command: string;
  where: string;
  context?: TerminalContext;
  breakdown?: { term: string; meaning: string }[];
}) {
  const [position, setPosition] = useState({ command, index: 0 });
  const recorded = useRecordedEnvironment();
  const authored = contextFor(where, context);
  const session =
    authored && context?.shell === 'bash' && recorded
      ? {
          ...authored,
          user: recorded.username || authored.user,
          host: recorded.hostname || authored.host,
        }
      : authored;
  const inputs = teachingInputs(command, session?.shell);
  const index =
    position.command === command
      ? Math.min(position.index, inputs.length - 1)
      : 0;
  const input = inputs[index] ?? {
    text: command,
    startLine: 0,
    lineCount: command.split('\n').length,
  };
  const lines = session ? terminalLines(command, session) : [];
  const meaning = [...breakdown]
    .sort((a, b) => b.term.length - a.term.length)
    .find((item) =>
      item.term.split(' / ').some((term) => input?.text.includes(term.trim())),
    )?.meaning;
  if (!session)
    return (
      <pre>
        <code>{command}</code>
      </pre>
    );
  return (
    <div className="terminal-example">
      <div className="typing-lesson-heading">
        <strong>Type it with me</strong>
        <span>
          Input {index + 1} of {inputs.length}
        </span>
      </div>
      <div className="terminal-location">
        <span>Example session</span>
        <strong>{promptFor(session)}</strong>
      </div>
      {recorded && (recorded.hostname || recorded.ipv4) && (
        <p className="terminal-context-note">
          My recorded VM: {recorded.hostname || 'hostname not recorded'}
          {recorded.ipv4 ? ` · ${recorded.ipv4}` : ''}
          {recorded.directory ? ` · folder: ${recorded.directory}` : ''}. Check
          it matches this step’s target.
        </p>
      )}
      <p className="terminal-context-note">
        {session.shell === 'sftp'
          ? 'At sftp>, run pwd for the remote folder and lpwd for the local folder. Follow cd/lcd in this step.'
          : session.directory === '<pwd>'
            ? 'Run pwd first; <pwd> stands for the directory it prints. Keep the folder required by this step; follow any cd line below.'
            : session.shell === 'powershell'
              ? `Start in the folder named by this step: ${session.directory}. Use Get-Location to check your current folder; use Set-Location to change it when instructed.`
              : `Start in ${session.directory}${session.directory === '~' ? ' (your home directory)' : session.directory === '/' ? ' (root directory—the top of the folder tree)' : ''}: run ${session.directory === '~' ? 'cd "$HOME"' : `cd "${session.directory}"`}, then pwd.`}{' '}
        User and host names shown are examples.
      </p>
      <pre aria-label="Commands with example terminal prompts">
        <code>
          {lines
            .slice(input.startLine, input.startLine + input.lineCount)
            .map((line, i) => (
              <span
                className="terminal-input-example"
                data-prompt={line.prompt}
                key={i}
              >
                {line.text}
                {i < input.lineCount - 1 ? '\n' : ''}
              </span>
            ))}
        </code>
      </pre>
      <small>
        {input.lineCount > 1
          ? 'These lines stay together. Type them in order, pressing Enter after each line; finish any closing quote, brace or marker before continuing.'
          : 'Type this input yourself, then press Enter and read the result.'}{' '}
        Leave out the example prompt. Keep $, # and &gt; wherever they are part
        of the input itself.
      </small>
      {meaning && (
        <p className="terminal-context-note">
          <strong>What this means:</strong> {meaning}
        </p>
      )}
      {inputs.length > 1 && (
        <nav
          className="typing-lesson-navigation"
          aria-label="Command practice navigation"
        >
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setPosition({ command, index: index - 1 })}
          >
            Previous input
          </button>
          <span aria-live="polite">
            {index === inputs.length - 1
              ? 'Last input — compare your result with the step’s success check.'
              : 'Read your result before moving on.'}
          </span>
          <button
            type="button"
            disabled={index === inputs.length - 1}
            onClick={() => setPosition({ command, index: index + 1 })}
          >
            Next input
          </button>
        </nav>
      )}
      <details className="lesson-support">
        <summary>Read the prompt</summary>
        <p>
          $ = regular Linux user. # = root shell. &gt; = continued Bash input.
          PS path&gt; = PowerShell. Running sudo does not turn every later
          prompt into #.
        </p>
      </details>
    </div>
  );
}
