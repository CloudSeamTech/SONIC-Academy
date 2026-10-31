'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Check,
  CircleSlash,
  Play,
  Plug,
  RotateCcw,
  Square,
  TerminalSquare,
} from 'lucide-react';
import {
  classifyCommand,
  commandHelp,
  helpFor,
  type CommandRisk,
} from '@/lib/lab-terminal/command-help';
import {
  companionWebSocketUrl,
  isLoopbackHostname,
  type ClientMessage,
  type ServerMessage,
  type ShellCapability,
  type ShellId,
} from '@/lib/lab-terminal/protocol';
import './lab-terminal.css';
import { TerminalSetup } from './terminal-setup';

const shells: { id: ShellId; label: string; location: string }[] = [
  {
    id: 'windows-powershell',
    label: 'Windows PowerShell',
    location: 'Your Windows workstation',
  },
  {
    id: 'azure-cli',
    label: 'Azure CLI in PowerShell',
    location: 'Windows PowerShell with installed Azure CLI',
  },
  {
    id: 'wsl-rocky',
    label: 'Linux / WSL',
    location: 'An actually installed WSL distribution',
  },
];

const ansiPattern = new RegExp(
  `${String.fromCharCode(27)}\\[[0-?]*[ -/]*[@-~]`,
  'g',
);
const stripAnsi = (value: string) =>
  value
    .replace(ansiPattern, '')
    .replace(/\r(?!\n)/g, '\n')
    .split('\n')
    .filter(
      (line) => !/FromBase64String|__SONIC_EXIT__|base64 --decode/.test(line),
    )
    .join('\n');

const riskText: Record<CommandRisk, string> = {
  'read-only': 'READ ONLY',
  'changes-local': 'CHANGES THIS COMPUTER',
  'changes-cloud': 'MAY CHANGE AZURE',
  destructive: 'DESTRUCTIVE / HIGH RISK',
};

export function LabTerminal() {
  const loopback =
    typeof window !== 'undefined' &&
    isLoopbackHostname(window.location.hostname);
  const [selected, setSelected] = useState<ShellId>('windows-powershell');
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<
    'copy' | 'disconnected' | 'connecting' | 'ready' | 'running' | 'error'
  >('copy');
  const [message, setMessage] = useState(
    'Hosted SONIC cannot execute commands on your computer. Use reference mode, or run SONIC and the companion locally.',
  );
  const [capabilities, setCapabilities] = useState<ShellCapability[]>([]);
  const [distro, setDistro] = useState('');
  const [output, setOutput] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [command, setCommand] = useState('');
  const [pending, setPending] = useState<{
    command: string;
    risk: CommandRisk;
  } | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const setupRef = useRef<HTMLDivElement>(null);
  const selectedCapability = capabilities.find((item) => item.id === selected);
  const examples = commandHelp.filter((item) => item.shellId === selected);
  const contextualHelp = useMemo(
    () => helpFor(selected, command),
    [selected, command],
  );

  useEffect(() => {
    const localReady = window.setTimeout(() => {
      if (
        new URLSearchParams(window.location.hash.slice(1)).get('setup') === '1'
      ) {
        const details = setupRef.current?.querySelector('details');
        if (details) details.open = true;
      }
      if (loopback) {
        setStatus('disconnected');
        setMessage('Companion not connected. No command has run.');
      }
    }, 0);
    return () => {
      window.clearTimeout(localReady);
      socket.current?.close();
    };
  }, [loopback]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [output]);

  const send = (value: ClientMessage) => {
    if (socket.current?.readyState !== WebSocket.OPEN) return false;
    socket.current.send(JSON.stringify(value));
    return true;
  };

  const disconnect = (reason = 'Disconnected. No command is running.') => {
    socket.current?.close();
    socket.current = null;
    setStatus(loopback ? 'disconnected' : 'copy');
    setMessage(reason);
  };

  const connect = () => {
    const url = companionWebSocketUrl(window.location.hostname);
    if (!url || token.trim().length < 32) {
      setStatus('error');
      setMessage(
        'Paste the one-time token printed by the local companion. It is kept only in this page memory.',
      );
      return;
    }
    socket.current?.close();
    setOutput('');
    setStatus('connecting');
    setMessage('Connecting to the loopback-only companion…');
    const nextSocket = new WebSocket(url);
    socket.current = nextSocket;
    nextSocket.onopen = () =>
      nextSocket.send(
        JSON.stringify({
          type: 'authenticate',
          token: token.trim(),
          protocol: 1,
        } satisfies ClientMessage),
      );
    nextSocket.onmessage = (event) => {
      if (socket.current !== nextSocket) return;
      let response: ServerMessage;
      try {
        response = JSON.parse(event.data) as ServerMessage;
      } catch {
        setStatus('error');
        setMessage(
          'The companion sent an unreadable response. Disconnect and reconnect before trying again.',
        );
        return;
      }
      if (response.type === 'authenticated') {
        setCapabilities(response.shells);
        const capability = response.shells.find((item) => item.id === selected);
        if (!capability?.available) {
          setStatus('error');
          setMessage(
            capability?.detail ??
              'This shell was not reported by the companion.',
          );
          return;
        }
        const requestedDistro =
          selected === 'wsl-rocky'
            ? distro || capability.distros?.[0]
            : undefined;
        if (requestedDistro) setDistro(requestedDistro);
        nextSocket.send(
          JSON.stringify({
            type: 'open',
            shellId: selected,
            columns: 110,
            rows: 34,
            distro: requestedDistro,
          } satisfies ClientMessage),
        );
      } else if (response.type === 'opened') {
        setStatus('ready');
        setMessage(
          'LIVE LOCAL SESSION · actual output and exit state come from your computer.',
        );
      } else if (response.type === 'output') {
        setOutput((current) =>
          (current + stripAnsi(response.data)).slice(-120_000),
        );
      } else if (response.type === 'command-exit') {
        setOutput(
          (current) => `${current}\n[exit code ${response.exitCode}]\n`,
        );
        setStatus('ready');
        setMessage(
          `Command completed with real exit code ${response.exitCode}.`,
        );
      } else if (response.type === 'exit') {
        setOutput(
          (current) =>
            `${current}\n[process exited with code ${String(response.exitCode)}]\n`,
        );
        setStatus('disconnected');
        setMessage(
          `Shell exited with code ${String(response.exitCode)}. Connect again to start a new session.`,
        );
      } else if (response.type === 'error') {
        setStatus('error');
        setMessage(`${response.code}: ${response.message}`);
      }
    };
    nextSocket.onerror = () => {
      if (socket.current !== nextSocket) return;
      setStatus('error');
      setMessage(
        'The localhost companion could not be reached or rejected the connection. Nothing was executed.',
      );
    };
    nextSocket.onclose = () => {
      if (socket.current !== nextSocket) return;
      socket.current = null;
      setStatus((current) => (current === 'error' ? 'error' : 'disconnected'));
      setMessage((current) =>
        current.includes('could not be reached') || current.includes('token')
          ? current
          : 'The terminal connection closed. No more commands can run. Start the companion and connect again.',
      );
    };
  };

  const changeShell = (shellId: ShellId) => {
    disconnect(
      'Shell changed. Reconnect explicitly to start the selected local session.',
    );
    setSelected(shellId);
    setOutput('');
    setPending(null);
  };

  const showSetup = () => {
    setMessage(
      loopback
        ? 'Start the companion in a second PowerShell window, paste its one-time token, then choose Connect locally. No command has run.'
        : 'To run real commands, open SONIC on your own PC and connect its companion. Follow the setup steps now shown below. No command has run.',
    );
    const details = setupRef.current?.querySelector('details');
    if (details) {
      details.open = true;
      details.querySelector('summary')?.focus();
      details.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
  };

  const execute = (value: string) => {
    if (!value.trim()) return;
    if (status !== 'ready' || !send({ type: 'run', command: value })) {
      setStatus(loopback ? 'disconnected' : 'copy');
      setPending(null);
      setMessage(
        'There is no live terminal connection. Nothing ran. Connect the local companion first.',
      );
      return;
    }
    setOutput((current) => `${current}\n> ${value}\n`);
    setStatus('running');
    setMessage(
      'Command is running locally. Output below is streamed from the real process.',
    );
    setCommand('');
    setPending(null);
  };

  const requestExecution = () => {
    if (status !== 'ready') {
      showSetup();
      return;
    }
    if (!command.trim()) {
      setMessage(
        'Type a command yourself. Try Get-Date first.',
      );
      return;
    }
    const risk = classifyCommand(command);
    if (risk === 'read-only') execute(command);
    else setPending({ command, risk });
  };

  return (
    <section
      className={`lab-terminal-experience${expanded ? ' terminal-expanded' : ''}`}
    >
      <header className="terminal-titlebar">
        <div>
          <span className="eyebrow">OPT-IN / LOCAL USER CONTEXT</span>
          <h1>LAB TERMINAL</h1>
          <p>
            Real commands only when the authenticated Windows companion is
            running on this same computer.
          </p>
        </div>
        <span className={`terminal-state state-${status}`}>
          <i />
          {status === 'copy'
            ? 'HOSTED · REFERENCE MODE'
            : status === 'ready'
              ? 'LOCAL · CONNECTED'
              : status.toUpperCase()}
        </span>
      </header>
      <aside className="terminal-safety">
        <ShieldIcon />
        <div>
          <b>NO PUBLIC REMOTE SHELL</b>
          <p>
            The companion binds to 127.0.0.1, requires a one-time token and
            approved browser origin, runs as your current user, and never
            elevates privileges. Terminal content is not logged by the
            companion.
          </p>
        </div>
      </aside>
      <div ref={setupRef}>
        <TerminalSetup />
      </div>
      <nav className="terminal-tabs" aria-label="Terminal shells">
        {shells.map((shell) => (
          <button
            key={shell.id}
            className={selected === shell.id ? 'selected' : ''}
            onClick={() => changeShell(shell.id)}
          >
            <TerminalSquare size={16} />
            <span>
              {shell.label}
              <small>{shell.location}</small>
            </span>
            {capabilities.length > 0 && (
              <i
                className={
                  capabilities.find((item) => item.id === shell.id)?.available
                    ? 'available'
                    : 'unavailable'
                }
              />
            )}
          </button>
        ))}
      </nav>
      <div className="terminal-layout">
        <section className="terminal-console">
          <header>
            <span>{shells.find((item) => item.id === selected)?.label}</span>
            <div>
              <button
                type="button"
                aria-pressed={expanded}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Standard view' : 'Expand terminal'}
              </button>
              {(status === 'ready' || status === 'running') && (
                <button onClick={() => send({ type: 'cancel' })}>
                  <Square size={13} /> Ctrl+C / cancel
                </button>
              )}
              <button
                onClick={() => {
                  setOutput('');
                }}
              >
                <RotateCcw size={13} /> Clear display
              </button>
            </div>
          </header>
          {status === 'copy' ? (
            <div className="copy-mode">
              <CircleSlash size={35} />
              <h2>Connect your PC to run commands</h2>
              <p>
                This website is your guide. PowerShell runs on your PC, so we
                need to connect the local app before this panel can show real
                results.
              </p>
              <p>
                You can type a command into your own terminal now, or follow the
                setup below to see its output here.
              </p>
              <button type="button" onClick={showSetup}>
                Set up real terminal
              </button>
            </div>
          ) : (
            <pre ref={outputRef} className="terminal-output" aria-live="polite">
              {output ||
                'No output yet. Connect, then run an approved command.\n'}
            </pre>
          )}
          <p className="terminal-feedback" role="status" aria-live="polite">
            {message}
          </p>
          <div className="terminal-input-row">
            <span>&gt;</span>
            <textarea
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              placeholder={
                status === 'ready'
                  ? 'Type a command. Enter is sent only when you choose Run.'
                  : status === 'running'
                    ? 'Type a response only if the running command is prompting.'
                    : 'Type the example yourself, or choose Set up to connect your terminal.'
              }
              aria-label="Terminal command"
              disabled={status === 'connecting'}
              rows={2}
            />
            {status !== 'running' && status !== 'ready' && null}
            {status === 'running' ? (
              <button
                disabled={!command}
                onClick={() => {
                  send({ type: 'input', data: `${command}\r` });
                  setCommand('');
                }}
              >
                <Play size={14} /> Send reply
              </button>
            ) : (
              <button
                disabled={
                  status === 'connecting' ||
                  (status === 'ready' && !command.trim())
                }
                onClick={requestExecution}
              >
                <Play size={14} fill="currentColor" />{' '}
                {status === 'ready' ? 'Run' : 'Set up to run'}
              </button>
            )}
          </div>
        </section>
        <aside className="terminal-guide">
          <section>
            <span className="eyebrow">CURRENT STATE</span>
            <p>{message}</p>
          </section>
          {loopback && status !== 'ready' && status !== 'connecting' && (
            <section className="connect-panel">
              <label htmlFor="companion-token">One-time companion token</label>
              <input
                id="companion-token"
                type="password"
                autoComplete="off"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Paste token; never stored"
              />
              {selected === 'wsl-rocky' &&
              selectedCapability?.distros?.length ? (
                <label>
                  Installed WSL distribution
                  <select
                    value={distro}
                    onChange={(event) => setDistro(event.target.value)}
                  >
                    {selectedCapability.distros.map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                </label>
              ) : null}
              <button onClick={connect}>
                <Plug size={14} /> Connect locally
              </button>
            </section>
          )}
          {(status === 'ready' || status === 'running') && (
            <section>
              <button type="button" onClick={() => disconnect()}>
                Disconnect terminal
              </button>
            </section>
          )}
          <section>
            <span className="eyebrow">QUESTION</span>
            <p>
              {contextualHelp?.question ??
                'What fact will this command prove, and is this the correct shell?'}
            </p>
          </section>
          <section>
            <span className="eyebrow">COMMAND ANATOMY</span>
            {contextualHelp ? (
              <ul>
                {contextualHelp.explanation.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p>
                Choose an approved example below or read the current lesson
                before executing.
              </p>
            )}
          </section>
          <section>
            <span className="eyebrow">STATE IMPACT</span>
            <strong className={`risk risk-${classifyCommand(command)}`}>
              {riskText[classifyCommand(command)]}
            </strong>
          </section>
        </aside>
      </div>
      {pending && (
        <section className="risk-gate" role="alertdialog" aria-modal="true">
          <AlertTriangle size={28} />
          <div>
            <span className="eyebrow">EXPLICIT CHANGE CONFIRMATION</span>
            <h2>{riskText[pending.risk]}</h2>
            <p>
              SONIC detected a command that may change state. Confirm the named
              account/subscription, expected cost or impact, pass check, and
              rollback before sending it.
            </p>
            <pre>{pending.command}</pre>
            <div>
              <button onClick={() => setPending(null)}>Cancel</button>
              <button
                className="confirm-risk"
                onClick={() => execute(pending.command)}
              >
                <Check size={14} /> I reviewed the target and rollback · Run
              </button>
            </div>
          </div>
        </section>
      )}
      <section className="terminal-examples">
        <header>
          <span className="eyebrow">SAFE STARTING COMMANDS</span>
          <p>
            Type these examples yourself. They are reference input, not
            simulated output.
          </p>
        </header>
        <div>
          {examples.map((example) => (
            <article key={example.command}>
              <span>{riskText[example.risk]}</span>
              <code>{example.command}</code>
              <p>{example.question}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function ShieldIcon() {
  return (
    <span className="terminal-shield" aria-hidden="true">
      <Check size={18} />
    </span>
  );
}

