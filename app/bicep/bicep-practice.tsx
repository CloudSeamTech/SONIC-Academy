'use client';
import { useEffect, useRef, useState } from 'react';
import exercises from '../../content/bicep/practices.json';
import { useAcademy } from '../academy-provider';
import { notebookOwner } from '../../lib/private-notebook';
import './bicep.css';
type Exercise = {
  title: string;
  code: string;
  files: Record<string, string>;
  task: string;
  expected: string;
  terms: string[][];
  capstone: boolean;
};
type Diagnostic = {
  message: string;
  severity?: number;
  startLineNumber?: number;
  startColumn?: number;
  code?: string;
};
type Result = { template: string; diagnostics: Diagnostic[]; error?: string };
export function BicepPractice({ lessonId }: { lessonId: string }) {
  const { user } = useAcademy();
  const owner = notebookOwner(user?.id);
  const exercise = (exercises as Record<string, Exercise>)[lessonId];
  if (!exercise) return null;
  return (
    <PracticeEditor
      key={`${owner}:${lessonId}`}
      exercise={exercise}
      lessonId={lessonId}
      owner={owner}
    />
  );
}
function PracticeEditor({
  exercise,
  lessonId,
  owner,
}: {
  exercise: Exercise;
  lessonId: string;
  owner: string;
}) {
  const [code, setCode] = useState(exercise.capstone ? '' : exercise.code);
  const [files, setFiles] = useState(exercise.files);
  const [activeFile, setActiveFile] = useState('main.bicep');
  const [status, setStatus] = useState(
    'Not compiled. Source stays in this browser.',
  );
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [startupLog, setStartupLog] = useState<string[]>([]);
  const [showJson, setShowJson] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [draftNotice, setDraftNotice] = useState(
    'Save a draft before leaving this step. Drafts stay in this browser profile.',
  );
  const worker = useRef<Worker | null>(null);
  const request = useRef(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timeout.current);
      worker.current?.terminate();
    };
  }, []);
  const invalidate = () => {
    setResult(null);
    setStatus('Edited since last check. Compile again to check this version.');
  };
  const finish = (message: string) => {
    clearTimeout(timeout.current);
    setBusy(false);
    setStatus(message);
  };
  async function compile() {
    if (busy) return;
    setBusy(true);
    setResult(null);
    setStatus(
      'Loading the official compiler. The first load can take a moment…',
    );
    try {
      if (!worker.current) {
        await new Promise<void>((resolve, reject) => {
          const instance = new Worker('/bicep-compiler-worker.js', {
            type: 'module',
          });
          worker.current = instance;
          timeout.current = setTimeout(
            () =>
              reject(
                new Error(
                  'Compiler download timed out. Check your connection and try again.',
                ),
              ),
            60000,
          );
          instance.onerror = () =>
            reject(
              new Error(
                'The browser could not start the compiler. Try again or use the local CLI instructions.',
              ),
            );
          instance.onmessage = ({ data }) => {
            if (data.type === 'progress') {
              setStatus(data.message);
              setStartupLog((log) => [...log.slice(-24), data.message]);
            }
            if (data.type === 'ready') {
              clearTimeout(timeout.current);
              resolve();
            } else if (data.type === 'error') reject(new Error(data.message));
          };
          instance.postMessage({ type: 'init' });
        });
      }
      if (!mounted.current) return;
      const id = ++request.current;
      setStatus(
        'Compiling this version of main.bicep and its companion files…',
      );
      const instance = worker.current!;
      timeout.current = setTimeout(() => {
        instance.terminate();
        worker.current = null;
        finish(
          'Compilation timed out. No pass was recorded. Try a smaller file or the local CLI.',
        );
      }, 30000);
      instance.onerror = () => {
        instance.terminate();
        worker.current = null;
        finish(
          'Compiler stopped unexpectedly. No result was verified. Try again.',
        );
      };
      instance.onmessage = ({ data }) => {
        if (data.type === 'error') {
          finish(`Compiler unavailable: ${data.message}`);
          return;
        }
        if (data.type !== 'result' || data.id !== request.current) return;
        const output = data.result as Result;
        setResult(output);
        let validJson = false;
        try {
          validJson = !!JSON.parse(output.template).$schema;
        } catch {
          /* A failed emit is not a syntax pass. */
        }
        finish(
          validJson && !output.error
            ? 'Compiled to ARM JSON. Review diagnostics and the requirements below. Azure has not been checked or changed.'
            : 'Compilation failed. Read the first diagnostic, make one correction and try again.',
        );
      };
      instance.postMessage({ type: 'compile', id, code, files });
    } catch (error) {
      worker.current?.terminate();
      worker.current = null;
      if (mounted.current)
        finish(
          error instanceof Error
            ? error.message
            : 'Compiler unavailable. No verification result.',
        );
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'main.bicep';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const draftKey = `sonic-bicep-draft-v1:${owner}:${lessonId}`;
  function saveDraft() {
    try {
      localStorage.setItem(draftKey, JSON.stringify({ code, files }));
      setDraftNotice(
        'Draft saved in this browser profile. It is not uploaded or synced.',
      );
    } catch {
      setDraftNotice(
        'Draft could not be saved. Download your source and companion files instead.',
      );
    }
  }
  function restoreDraft() {
    try {
      const value = JSON.parse(localStorage.getItem(draftKey) ?? 'null');
      if (
        !value ||
        typeof value.code !== 'string' ||
        value.code.length > 200000
      ) {
        setDraftNotice('No valid saved draft for this lesson.');
        return;
      }
      const restored: Record<string, string> = { ...exercise.files };
      for (const name of Object.keys(restored))
        if (
          typeof value.files?.[name] === 'string' &&
          value.files[name].length <= 200000
        )
          restored[name] = value.files[name];
      setCode(value.code);
      setFiles(restored);
      setActiveFile('main.bicep');
      invalidate();
      setDraftNotice('Saved draft restored. Compile again to verify it.');
    } catch {
      setDraftNotice(
        'This draft cannot be read. Downloaded files or the example can be used to recover.',
      );
    }
  }
  const diagnostics = Array.isArray(result?.diagnostics)
    ? result.diagnostics
    : [];
  let template: {
    resources?: { type?: string; name?: unknown; copy?: { count?: unknown } }[];
  } | null = null;
  try {
    if (result) template = JSON.parse(result.template);
  } catch {
    /* Failed compilation has no inventory. */
  }
  return (
    <section className="bicep-practice" aria-label="Bicep practice editor">
      <header>
        <p className="bicep-eyebrow">WRITE → COMPILE → EXPLAIN</p>
        <h4>Your Bicep workbench</h4>
        <p>{exercise.task}</p>
      </header>
      <p className="bicep-privacy">
        Real Microsoft Bicep compiler · runs locally in your browser · no Azure
        sign-in · no deployment. Compiler assets download when you select
        Compile. Don’t enter secrets.
      </p>
      <label>
        File to edit
        <select
          value={activeFile}
          disabled={busy}
          onChange={(e) => setActiveFile(e.target.value)}
        >
          <option>main.bicep</option>
          {Object.keys(files).map((name) => (
            <option key={name}>{name}</option>
          ))}
        </select>
      </label>
      <label htmlFor={`source-${lessonId}`}>{activeFile} — source code</label>
      <textarea
        id={`source-${lessonId}`}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        disabled={busy}
        value={activeFile === 'main.bicep' ? code : files[activeFile]}
        onChange={(e) => {
          if (activeFile === 'main.bicep') setCode(e.target.value);
          else setFiles({ ...files, [activeFile]: e.target.value });
          invalidate();
        }}
        rows={Math.min(
          24,
          Math.max(
            8,
            (activeFile === 'main.bicep' ? code : files[activeFile]).split('\n')
              .length,
          ),
        )}
      />
      <div className="bicep-actions">
        <button type="button" disabled={busy || !code.trim()} onClick={compile}>
          {busy ? 'Working…' : 'Compile to ARM JSON'}
        </button>
        <button type="button" disabled={busy} onClick={saveDraft}>
          Save draft
        </button>
        <button type="button" disabled={busy} onClick={restoreDraft}>
          Restore saved draft
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setCode('');
            setActiveFile('main.bicep');
            invalidate();
          }}
        >
          Start blank
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setCode(exercise.code);
            setFiles(exercise.files);
            setActiveFile('main.bicep');
            invalidate();
          }}
        >
          Restore example
        </button>
        <button type="button" onClick={download}>
          Download main.bicep
        </button>
      </div>
      <p role="status">{draftNotice}</p>
      {Object.entries(files).map(([name, value]) => (
        <a
          key={name}
          download={name}
          href={`data:text/plain;charset=utf-8,${encodeURIComponent(value)}`}
        >
          Download companion: {name}
        </a>
      ))}
      <p role="status" aria-live="polite" className="bicep-status">
        {status}
      </p>
      {startupLog.length > 0 && (
        <details>
          <summary>Compiler startup details</summary>
          <pre>{startupLog.join('\n')}</pre>
        </details>
      )}
      {result?.error && <p role="alert">{result.error}</p>}
      {diagnostics.length > 0 && (
        <ol className="bicep-diagnostics" aria-label="Compiler diagnostics">
          {diagnostics.map((item, index) => (
            <li key={index}>
              <strong>
                {item.severity === 8
                  ? 'Error'
                  : item.severity === 4
                    ? 'Warning'
                    : 'Message'}{' '}
                · line {item.startLineNumber ?? '?'}:{item.startColumn ?? '?'}{' '}
                {item.code ?? ''}
              </strong>
              <p>{item.message}</p>
            </li>
          ))}
        </ol>
      )}
      {result && (
        <>
          <button
            type="button"
            aria-expanded={showJson}
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? 'Hide' : 'Show'} generated ARM JSON
          </button>
          {showJson && (
            <pre tabIndex={0} aria-label="Generated ARM JSON">
              <code>{result.template}</code>
            </pre>
          )}
        </>
      )}
      {template && Array.isArray(template.resources) && (
        <details>
          <summary>
            Resource declarations in this template ({template.resources.length})
          </summary>
          <p>
            This lists declarations, not deployed instances. A loop can request
            multiple instances; Azure resolves expressions using deployment
            inputs. Modules contain further nested declarations.
          </p>
          <ul>
            {template.resources.map((resource, index) => (
              <li key={index}>
                <strong>{resource.type}</strong>
                <br />
                Name expression: <code>{String(resource.name)}</code>
                {resource.copy && (
                  <>
                    <br />
                    Loop count: <code>{String(resource.copy.count)}</code>
                  </>
                )}
              </li>
            ))}
          </ul>
          {template.resources.length === 0 && (
            <p>No new resource declarations.</p>
          )}
        </details>
      )}
      <section className="bicep-review">
        <h4>Check the requirement, not just the syntax</h4>
        <p>{exercise.expected}</p>
        <ul>
          <li>Find the changed input and explain its type.</li>
          <li>Identify a fixed keyword and a derived expression.</li>
          <li>
            Compare the resource types, properties and loop counts with the
            task.
          </li>
          <li>
            State the limit of this result: no live Azure permissions, policy,
            quota or runtime checks.
          </li>
        </ul>
      </section>
      {exercise.code.includes('resource vms') && (
        <details>
          <summary>Read the server file in eight small blocks</summary>
          <ol>
            <li>
              <strong>Inputs:</strong> location, prefix, count, username and
              public key. You supply these; types and decorators constrain them.
            </li>
            <li>
              <strong>NSG:</strong> a network rulebook. Its explicit inbound
              deny is intentional. An approved access design must precede any
              real use.
            </li>
            <li>
              <strong>VNet and subnet:</strong> the private address space and
              its apps section. The subnet references the NSG ID.
            </li>
            <li>
              <strong>NIC loop:</strong> creates a named network interface per
              server. Dynamic private addresses are assigned by Azure, not
              chosen in this file.
            </li>
            <li>
              <strong>VM loop:</strong> repeats the server declaration. The same
              index connects each VM to its own NIC.
            </li>
            <li>
              <strong>OS and disk:</strong> imageReference chooses Ubuntu;
              hardwareProfile chooses size; storageProfile configures its
              managed OS disk.
            </li>
            <li>
              <strong>Guest configuration:</strong> osProfile defines the
              administrator and SSH public-key access. A public key is not the
              private key.
            </li>
            <li>
              <strong>Outputs:</strong> vmNames returns planned server names. It
              is not a health check or proof that software started.
            </li>
          </ol>
          <p>
            For real servers, plan approved outbound connectivity, patching,
            monitoring, backup, DNS and management access. These examples teach
            the resource relationships; they are not a complete production
            baseline.
          </p>
        </details>
      )}
      {lessonId === 'bicep-software' && (
        <details>
          <summary>Why software can fail after the template succeeds</summary>
          <p>
            The guest needs an approved route to its package repositories, such
            as controlled NAT egress or a private mirror. This private network
            example does not create that route; do not assume implicit outbound
            internet access. No inbound allow rule is supplied either.
          </p>
          <p>
            Cloud-init runs inside Ubuntu. After an approved deployment, open an
            authorized guest session and run{' '}
            <code>cloud-init status --long</code>,{' '}
            <code>systemctl status nginx</code> and{' '}
            <code>curl -I http://localhost</code>. An Azure VM provisioning
            success alone does not prove these checks.
          </p>
          <p>
            For Windows software, an approved VM extension or
            configuration-management tool serves a similar guest-configuration
            role. An extension is a separate child resource with its own
            publisher, type, version and protected settings; do not paste a
            Linux cloud-init file into a Windows VM.
          </p>
        </details>
      )}
      <button
        type="button"
        aria-expanded={showExample}
        onClick={() => setShowExample(!showExample)}
      >
        {showExample ? 'Hide' : 'Show'} example for comparison
      </button>
      {showExample && (
        <pre tabIndex={0}>
          <code>{exercise.code}</code>
        </pre>
      )}
      {lessonId === 'bicep-azure-checks' && (
        <section>
          <h4>Optional live checks — run locally after scope approval</h4>
          <p>
            Save this lesson’s example as main.bicep. Replace YOUR-TRAINING-RG
            with an existing approved training group. Confirm az account show
            identifies the correct subscription. These commands validate and
            preview; they do not deploy.
          </p>
          <pre tabIndex={0}>
            <code>
              {
                'PS C:\\Users\\YourName\\Documents\\CloudSeam-Bicep> az account show --query "{name:name,id:id}"\nPS C:\\Users\\YourName\\Documents\\CloudSeam-Bicep> az deployment group validate --resource-group YOUR-TRAINING-RG --template-file .\\main.bicep\nPS C:\\Users\\YourName\\Documents\\CloudSeam-Bicep> az deployment group what-if --resource-group YOUR-TRAINING-RG --template-file .\\main.bicep'
              }
            </code>
          </pre>
          <p>
            Type only the az command after each &gt;. Read errors and proposed
            changes. No output here is fabricated as a successful Azure check.
          </p>
        </section>
      )}
      {lessonId === 'bicep-environments' && (
        <p>
          <a href="/bicep/dev.bicepparam" download>
            Download dev.bicepparam
          </a>{' '}
          · Save this lesson’s Bicep example as main.bicep beside it.
          Parameter-file compilation is a local CLI exercise.
        </p>
      )}
      {['bicep-capstone', 'bicep-handoff'].includes(lessonId) && (
        <p>
          <a href="/bicep/approved-deployment-runbook.md" download>
            Download the optional approved Azure deployment runbook
          </a>{' '}
          · Exact local commands for scope checks, public-key inputs,
          validation, what-if, deployment, resource verification and cleanup.
          Real deployment is separate and can incur charges.
        </p>
      )}
    </section>
  );
}
