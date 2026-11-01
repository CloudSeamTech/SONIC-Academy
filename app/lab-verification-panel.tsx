'use client';
import { useState, type ChangeEvent } from 'react';
import {
  checkDC01,
  parseLocalLabReport,
  validateDC01Expected,
  type DC01Expected,
  type LocalLabReport,
  type CheckResult,
} from '../lib/lab-verification';
import manifest from '../content/teaching/verifier-manifest.json';
import demo from '../content/verification/dc01-demo.json';
import './lab-verification.css';

export function LabVerificationPanel({ lessonId }: { lessonId: string }) {
  const [expected, setExpected] = useState<DC01Expected>({
    hostname: 'DC01',
    ipv4: '10.50.0.10',
    prefix: 24,
    domain: 'lab.example.test',
    dns: '10.50.0.10',
  });
  const [report, setReport] = useState<LocalLabReport | null>(null);
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [fileKey, setFileKey] = useState(0);
  const supported = lessonId === 'lab-04';
  const update = (key: keyof DC01Expected, value: string) => {
    setExpected((current) => ({
      ...current,
      [key]: key === 'prefix' ? Number(value) : value.trim(),
    }));
    setResults(null);
    setError('');
  };
  async function importReport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setReport(null);
    setResults(null);
    setError('');
    if (!file) return;
    if (file.size > 131072) {
      setError('Choose the collector’s JSON report, smaller than 128 KB.');
      return;
    }
    setBusy(true);
    try {
      setReport(parseLocalLabReport(await file.text()));
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'The report could not be read.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="lab-verification"
      aria-labelledby={`verify-heading-${lessonId}`}
    >
      <p className="verification-mode">LAB VERIFICATION · PREVIEW</p>
      <h2 id={`verify-heading-${lessonId}`}>Check your lab setup</h2>
      {!supported ? (
        <p>
          No automated check pack is available for this lesson yet. Its existing
          completion checkbox remains self-reported; we won’t show a green pass
          without a supported check.
        </p>
      ) : (
        <>
          <p>
            Run a read-only check inside DC01, then let this page compare its
            report with your lab plan. No RDP, SSH or inbound port is needed.
          </p>
          <p className="verification-notice">
            <strong>Local report mode.</strong> No live connection or upload
            occurs. The report stays in this tab’s memory until you leave or
            select Clear report. Imported evidence can be edited; these results
            are practice feedback, not a certified assessment.
          </p>
          <ol className="verification-instructions">
            <li>
              <h3>Confirm your lab plan</h3>
              <p>
                These defaults are the course examples. Use your actual planned
                values, not whichever values make a failed check pass.
              </p>
              <div className="verification-fields">
                <label>
                  Short computer name
                  <input
                    value={expected.hostname}
                    onChange={(e) => update('hostname', e.target.value)}
                    autoComplete="off"
                  />
                  <small>Example: DC01 — not its FQDN.</small>
                </label>
                <label>
                  DC01 IPv4 address
                  <input
                    value={expected.ipv4}
                    onChange={(e) => update('ipv4', e.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                  />
                  <small>Example: 10.50.0.10.</small>
                </label>
                <label>
                  Network prefix
                  <input
                    value={expected.prefix}
                    onChange={(e) => update('prefix', e.target.value)}
                    type="number"
                    min="1"
                    max="32"
                  />
                  <small>24 means mask 255.255.255.0.</small>
                </label>
                <label>
                  DNS domain
                  <input
                    value={expected.domain}
                    onChange={(e) => update('domain', e.target.value)}
                    autoComplete="off"
                  />
                  <small>Example: lab.example.test.</small>
                </label>
                <label>
                  Expected IPv4 DNS server
                  <input
                    value={expected.dns}
                    onChange={(e) => update('dns', e.target.value)}
                    inputMode="decimal"
                    autoComplete="off"
                  />
                  <small>
                    Use the DNS server specified at this lesson stage.
                  </small>
                </label>
              </div>
              <p>
                Your DC’s FQDN (full DNS name):{' '}
                <code>
                  {expected.hostname.toLowerCase()}.{expected.domain}
                </code>
                .
              </p>
            </li>
            <li>
              <h3>Download and review the checker on DC01</h3>
              <p>
                Inside the Windows Server VM, open this lesson in a browser and{' '}
                <a href="/verification/CloudSeam-DC01-Check.ps1" download>
                  download the DC01 checker v1.0.0
                </a>
                . If this isolated VM has no internet, download on your host and
                use your approved VMware file-transfer method.
              </p>
              <p>
                Open the file in Notepad before running it. It reads local
                settings and writes one JSON file; it never installs roles,
                fixes settings, asks for passwords or uploads data.
              </p>
              <p>
                <strong>Unsigned preview:</strong> it is not
                Authenticode-signed. If your execution policy blocks it, stop
                and have your lab administrator approve/sign it. Do not disable
                execution policy or certificate checks.
              </p>
            </li>
            <li>
              <h3>Check the download, then run it locally</h3>
              <p>
                Inside DC01: Start → type Windows PowerShell → right-click → Run
                as administrator. Sign in locally if asked. Type these commands
                one at a time; do not type the displayed prompt.
              </p>
              <pre aria-label="DC01 PowerShell commands">
                <code>
                  {
                    "PS C:\\Users\\YourName> Set-Location (Join-Path $HOME 'Downloads')\nPS C:\\Users\\YourName\\Downloads> Get-FileHash .\\CloudSeam-DC01-Check.ps1 -Algorithm SHA256"
                  }
                </code>
              </pre>
              <p>
                If you saved elsewhere, use that actual folder. Compare every
                SHA-256 character with:
              </p>
              <code className="verification-hash">{manifest.sha256}</code>
              <p>
                The hash checks download integrity; it is not a publisher
                signature. Stop if it differs. If local policy permits the
                reviewed file, type:
              </p>
              <pre>
                <code>
                  {
                    'PS C:\\Users\\YourName\\Downloads> .\\CloudSeam-DC01-Check.ps1'
                  }
                </code>
              </pre>
              <p>
                <strong>Expected:</strong> “Report saved:” followed by a JSON
                path in your Documents folder. Nothing is sent to CloudSeam. If
                a tool or permission is missing, its checks will say Not
                checked.
              </p>
            </li>
            <li>
              <h3>Choose the report and check results</h3>
              <p>
                Review the JSON for private lab details. On this page, choose
                the new cloudseam-dc01-….json file. If your browser is on the
                host, transfer that report back using your approved lab
                file-transfer method.
              </p>
              <label>
                DC01 JSON report
                <input
                  type="file"
                  key={fileKey}
                  accept=".json,application/json"
                  onChange={importReport}
                  disabled={busy}
                />
              </label>
              <div className="verification-actions">
                <button
                  type="button"
                  disabled={!report || busy}
                  onClick={() => {
                    const problem = validateDC01Expected(expected);
                    if (problem) {
                      setError(problem);
                      return;
                    }
                    if (report) {
                      setResults(checkDC01(report, expected));
                      setError('');
                    }
                  }}
                >
                  Check results
                </button>
                <button
                  type="button"
                  disabled={busy || (!report && !error)}
                  onClick={() => {
                    setReport(null);
                    setResults(null);
                    setError('');
                    setFileKey((current) => current + 1);
                  }}
                >
                  Clear report
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const sample = parseLocalLabReport(
                      JSON.stringify({
                        ...demo,
                        collectedAt: new Date().toISOString(),
                      }),
                    );
                    setReport(sample);
                    setResults(null);
                    setError('');
                    setFileKey((current) => current + 1);
                  }}
                >
                  Try sample report · demo only
                </button>
              </div>
              {report?.demo && (
                <p className="verification-notice">
                  <strong>Demonstration data — no real VM was checked.</strong>{' '}
                  The sample intentionally has the wrong DNS client setting so
                  you can see a failed check.
                </p>
              )}
              <output className="verification-status" aria-live="polite">
                {busy
                  ? 'Reading report…'
                  : report
                    ? report.demo
                      ? 'Sample report loaded. This is not lab evidence.'
                      : `Report collected ${report.collectedAt}. Not uploaded or authenticated.`
                    : 'No report selected. No machine has been checked.'}
              </output>
            </li>
          </ol>
          {error && (
            <p role="alert" className="verification-error">
              {error}
            </p>
          )}
          {results && (
            <section aria-label="DC01 check results" aria-live="polite">
              {report?.demo && (
                <p>
                  <strong>
                    DEMO RESULTS · sample data, not a connected VM.
                  </strong>
                </p>
              )}
              <h3>
                {results.filter((r) => r.status === 'pass').length} passed ·{' '}
                {results.filter((r) => r.status === 'fail').length} failed ·{' '}
                {results.filter((r) => r.status === 'not-checked').length} not
                checked
              </h3>
              <p>
                These checks cover the listed configuration facts, not every
                class task or the security of your whole domain. A green result
                does not mark the lesson complete.
              </p>
              <ul className="verification-results">
                {results.map((result) => (
                  <li key={result.id} data-status={result.status}>
                    <h4>
                      <span aria-hidden="true">
                        {result.status === 'pass'
                          ? '✓'
                          : result.status === 'fail'
                            ? '✕'
                            : '—'}
                      </span>{' '}
                      {result.title}{' '}
                      <small>
                        {result.status === 'pass'
                          ? 'Passed'
                          : result.status === 'fail'
                            ? 'Failed'
                            : 'Not checked'}
                      </small>
                    </h4>
                    <p>
                      <strong>Expected:</strong> {result.expected}
                    </p>
                    <p>
                      <strong>Observed:</strong> {result.observed}
                    </p>
                    {result.status !== 'pass' && (
                      <p>
                        <strong>Next:</strong> {result.repair}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
              <p>
                After a repair, rerun the checker on DC01 and choose the newly
                generated report. The old report cannot show your new settings.
              </p>
            </section>
          )}
          <details>
            <summary>How secure live checking will differ</summary>
            <p>
              A future paired connector will send selected observations over
              authenticated outbound HTTPS. That feature needs real account
              authentication, revocable pairing and protected result storage; it
              is not enabled in this preview. This local checker opens no
              listening port.
            </p>
          </details>
        </>
      )}
    </section>
  );
}
