'use client';
import { useState } from 'react';
import {
  tlsTerminalTasks,
  tlsScenarios,
  checkTlsCommand,
  checkTlsScenario,
} from '../../lib/tls-lab';
import './tls.css';
const nodes = [
  [
    'External users',
    'In an enterprise, browsers connect from outside the protected network. In our isolated lab, your Windows host is a private practice client; this is not Internet publication.',
  ],
  [
    'Firewall',
    'A real edge firewall controls allowed traffic into the DMZ. This TLS course uses VMnet6 isolation and RHEL firewalld as a practice boundary, not a complete enterprise firewall deployment.',
  ],
  [
    'RHEL 9 server · DMZ',
    'Application server (TLS-APP01), 10.90.0.10, hosts NGINX and the small static practice application. Its protected website key stays on this server.',
  ],
  [
    'NGINX · HTTPS',
    'TLS ends here in this architecture. NGINX presents the website leaf and intermediate chain, and proves possession using the matching private key.',
  ],
  [
    'Hosted application',
    'The page lives in /usr/share/nginx/html/tls-lab. This is a safe stand-in application, not an installed osTicket system or database.',
  ],
];
const chain = [
  [
    'Website leaf',
    'Public identity for app.example.mil. It contains the website public key, SAN, validity and issuer. NGINX sends this first.',
  ],
  [
    'Intermediate CA',
    'The public issuing certificate links the leaf to the root. NGINX sends it after the leaf; its secret signing key stays only on the practice CA.',
  ],
  [
    'Trusted root',
    'A client must already trust this public root through a deliberate trust decision. Our root is trusted only in the disposable Firefox profile or via an explicit curl/OpenSSL CA file.',
  ],
];
export function TlsArchitecture() {
  const [selected, setSelected] = useState(3);
  const [link, setLink] = useState(0);
  return (
    <section
      className="tls-interactive"
      aria-label="Interactive TLS architecture"
    >
      <h2>Follow the request</h2>
      <p>
        Select each stop to learn its job. The enterprise pattern and our
        private practice boundary are different.
      </p>
      <ol className="tls-flow">
        {nodes.map(([title], i) => (
          <li key={title}>
            <button
              type="button"
              className={selected === i ? 'primary-button' : ''}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              {i + 1}. {title}
            </button>
            {i < nodes.length - 1 && <span aria-hidden="true">→</span>}
          </li>
        ))}
      </ol>
      <p className="teaching-callout" aria-live="polite">
        {nodes[selected][1]}
      </p>
      <h3>Follow the trust chain</h3>
      <div className="tls-chain">
        {chain.map(([title], i) => (
          <button
            type="button"
            key={title}
            className={link === i ? 'primary-button' : ''}
            aria-pressed={link === i}
            onClick={() => setLink(i)}
          >
            {title}
          </button>
        ))}
      </div>
      <p className="teaching-callout" aria-live="polite">
        {chain[link][1]}
      </p>
      <p>
        <strong>
          The separate practice CA (TLS-CA01), 10.90.0.20, is a signing office.
        </strong>{' '}
        Only the CSR and public response files move between it and the
        application. It is not a DoD CA or a web-traffic hop.
      </p>
    </section>
  );
}
export function TlsTerminalPractice() {
  const [id, setId] = useState(tlsTerminalTasks[0].id);
  const [value, setValue] = useState('');
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState(false);
  const task = tlsTerminalTasks.find((item) => item.id === id)!;
  return (
    <section className="tls-interactive" aria-label="Guided command rehearsal">
      <h2>Practice choosing a command</h2>
      <p>
        <strong>Browser rehearsal only:</strong> nothing runs on RHEL, and no
        terminal result is fabricated. Use the lesson’s real SSH terminal for
        the hands-on check.
      </p>
      <label>
        Choose a small task
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setValue('');
            setChecked(false);
            setHint(false);
          }}
        >
          {tlsTerminalTasks.map((item) => (
            <option value={item.id} key={item.id}>
              {item.task}
            </option>
          ))}
        </select>
      </label>
      <label htmlFor="tls-command-answer">Type the exact Linux command</label>
      <textarea
        id="tls-command-answer"
        value={value}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        rows={3}
        placeholder="Type here; commands are case-sensitive"
        onChange={(e) => {
          setValue(e.target.value);
          setChecked(false);
        }}
      />
      <div className="tls-actions">
        <button type="button" onClick={() => setChecked(true)}>
          Check my command
        </button>
        <button
          type="button"
          onClick={() => setHint(!hint)}
          aria-expanded={hint}
        >
          {hint ? 'Hide hint' : 'Show command hint'}
        </button>
      </div>
      {hint && (
        <pre>
          <code>{task.command}</code>
        </pre>
      )}
      {checked && (
        <p className="teaching-callout" role="status">
          {checkTlsCommand(id, value)
            ? `Correct command. ${task.why} No command was executed.`
            : 'Try again. Keep the command case, spaces and path correct. Do not include the terminal prompt. Open the hint if needed.'}
        </p>
      )}
    </section>
  );
}
export function TlsTroubleshooting() {
  const [id, setId] = useState(tlsScenarios[0].id);
  const [answer, setAnswer] = useState(-1);
  const [checked, setChecked] = useState(false);
  const scenario = tlsScenarios.find((item) => item.id === id)!;
  return (
    <section
      className="tls-interactive"
      aria-label="TLS troubleshooting simulation"
    >
      <h2>Investigate a simulated problem</h2>
      <p>
        <strong>Simulated evidence only:</strong> these failures are not
        readings from your VM. Choose a safe next action without breaking your
        live practice server.
      </p>
      <label>
        Choose a scenario
        <select
          value={id}
          onChange={(e) => {
            setId(e.target.value);
            setAnswer(-1);
            setChecked(false);
          }}
        >
          {tlsScenarios.map((item) => (
            <option value={item.id} key={item.id}>
              {item.title}
            </option>
          ))}
        </select>
      </label>
      <p className="teaching-callout">
        <strong>Simulated evidence:</strong> {scenario.evidence}
      </p>
      <fieldset>
        <legend>What should you do next?</legend>
        {scenario.choices.map((choice, i) => (
          <label className="tls-choice" key={choice}>
            <input
              type="radio"
              name="tls-scenario-answer"
              checked={answer === i}
              onChange={() => {
                setAnswer(i);
                setChecked(false);
              }}
            />
            <span>{choice}</span>
          </label>
        ))}
      </fieldset>
      <button
        type="button"
        disabled={answer < 0}
        onClick={() => setChecked(true)}
      >
        Check my next action
      </button>
      {checked && (
        <p className="teaching-callout" role="status">
          {checkTlsScenario(id, answer)
            ? `Correct. ${scenario.why}`
            : 'Try again. Look for the action that investigates the specific evidence while keeping protection enabled.'}
        </p>
      )}
    </section>
  );
}
export function TlsCourseExtras({ lessonId }: { lessonId: string }) {
  return (
    <>
      {['tls-start', 'tls-basics'].includes(lessonId) && <TlsArchitecture />}
      {['tls-find', 'tls-install'].includes(lessonId) && (
        <TlsTerminalPractice />
      )}
      {lessonId === 'tls-troubleshoot' && <TlsTroubleshooting />}
      {lessonId === 'tls-enterprise' && (
        <p>
          <a href="/tls-lab/certificate-inventory.csv" download>
            Download your blank/example certificate inventory
          </a>{' '}
          · Save your actual values privately.
        </p>
      )}
    </>
  );
}
