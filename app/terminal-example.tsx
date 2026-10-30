'use client';
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
}: {
  command: string;
  where: string;
  context?: TerminalContext;
}) {
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
  if (!session)
    return (
      <pre>
        <code>{command}</code>
      </pre>
    );
  return (
    <div className="terminal-example">
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
        {session.directory === '<pwd>'
          ? 'Run pwd first; <pwd> stands for the directory it prints. Keep the folder required by this step; follow any cd line below.'
          : session.shell === 'powershell'
            ? 'Start in your Windows home folder: run Set-Location $HOME, then Get-Location.'
            : `Start in ${session.directory}: run ${session.directory === '~' ? 'cd "$HOME"' : `cd "${session.directory}"`}, then pwd.`}{' '}
        User and host names shown are examples.
      </p>
      <pre aria-label="Commands with example terminal prompts">
        <code>
          {terminalLines(command, session).map((line, i) => (
            <span
              className="terminal-input-example"
              data-prompt={line.prompt}
              key={i}
            >
              {line.text}
              {i < command.split('\n').length - 1 ? '\n' : ''}
            </span>
          ))}
        </code>
      </pre>
      <small>
        Copy command copies the input only. Keep $, # and &gt; wherever they are
        part of the command itself.
      </small>
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
