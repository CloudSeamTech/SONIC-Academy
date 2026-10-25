'use client';
import { useEffect, useState } from 'react';
import { useAcademy } from '../academy-provider';
import {
  dmzNotebookKey,
  readLabNotebook,
  type LabNotebook,
} from '../../lib/lab-notebook';
const fields = [
  [
    'app-name',
    'What application am I protecting?',
    'Example: my practice help desk',
    'dmz-plan',
  ],
  [
    'public-name',
    'Name visitors will use',
    'Example: app-dmz.cloudseam.tech',
    'dmz-plan',
  ],
  ['iis-name', 'Private IIS server name', 'Example: IIS-DMZ01', 'dmz-plan'],
  [
    'backend-name',
    'Private HTTPS name on IIS',
    'Example: iis-backend.cloudseam.tech',
    'dmz-iis',
  ],
  ['proxy-name', 'Gateway server name', 'Example: PROXY01', 'dmz-plan'],
  [
    'ad-network',
    'Existing AD network',
    'Example: VMnet2 / 10.50.0.0/24',
    'dmz-networks',
  ],
  [
    'dmz-network',
    'DMZ network',
    'Example: VMnet3 / 10.60.0.0/24',
    'dmz-networks',
  ],
  [
    'outside-network',
    'Practice visitor network',
    'Example: VMnet4 / 10.70.0.0/24',
    'dmz-networks',
  ],
  [
    'app-network',
    'Private application network',
    'Example: VMnet5 / 10.80.0.0/24',
    'dmz-networks',
  ],
  [
    'admin-ip',
    'Windows host management IP',
    'Example: 10.50.0.254',
    'dmz-networks',
  ],
  ['iis-ip', 'Private IIS IP address', 'Example: 10.80.0.40', 'dmz-iis'],
  ['proxy-ip', 'DMZ gateway IP address', 'Example: 10.60.0.10', 'dmz-proxy'],
  [
    'visitor-ip',
    'Practice visitor IP address',
    'Example: 10.70.0.10',
    'dmz-publish',
  ],
  [
    'mac-map',
    'Firewall adapters: zone, VMnet and MAC address',
    'One adapter per line. Copy the MAC from VMware Settings → Network Adapter → Advanced.',
    'dmz-firewall',
  ],
  [
    'rules',
    'My firewall rules',
    'Source → destination → port → allow/block. Use one rule per line.',
    'dmz-firewall',
  ],
  [
    'test-results',
    'My allowed and blocked test results',
    'Record the time, command result and matching firewall rule.',
    'dmz-verify',
  ],
  [
    'recovery',
    'My backup and recovery notes',
    'Backup location, change made, how I restored it. No passwords or keys.',
    'dmz-recover',
  ],
  [
    'azure-cost',
    'My Azure estimate and shutdown plan',
    'Region, date, estimated cost and resources to delete. This lesson does not deploy them.',
    'dmz-azure',
  ],
] as const;
export function DmzLabNotebook({ lessonId }: { lessonId: string }) {
  const academy = useAcademy();
  const [draft, setDraft] = useState<LabNotebook>(() => readLabNotebook(null));
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [showAll, setShowAll] = useState(false);
  useEffect(() => {
    if (!academy.ready) return;
    try {
      const owner = localStorage.getItem('sonic-academy-active-account');
      const blocked = Boolean(owner && owner !== academy.user?.id);
      setStorageBlocked(blocked);
      if (blocked) {
        setDraft(readLabNotebook(null));
        setStatus(
          'Account connection is unavailable. Reload to verify your account before opening or saving its notes.',
        );
        return;
      }
      setDraft(readLabNotebook(localStorage.getItem(dmzNotebookKey)));
      setStatus('');
    } catch {
      setStatus(
        'Browser storage is unavailable. Download your notes before leaving.',
      );
    }
    setShowAll(false);
  }, [academy.ready, academy.user?.id, lessonId]);
  async function save() {
    setSaving(true);
    const raw = JSON.stringify(draft);
    try {
      if (!academy.ready)
        throw new Error('Wait for your learning space to load.');
      const owner = localStorage.getItem('sonic-academy-active-account');
      if (storageBlocked || (owner && owner !== academy.user?.id))
        throw new Error('Reload to verify your account before saving.');
      localStorage.setItem(dmzNotebookKey, raw);
      window.dispatchEvent(new Event('sonic-academy-progress'));
      if (academy.user) {
        const response = await fetch('/api/learner', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: academy.user.id,
            records: { [dmzNotebookKey]: raw },
          }),
        });
        if (!response.ok)
          throw new Error(
            'Saved in this browser. Account save failed; try Save notes again.',
          );
        setStatus('Saved to your account and this browser.');
      } else
        setStatus(
          'Saved in this browser only. Download a copy to keep a backup.',
        );
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  function download() {
    const text = [
      'MY DMZ LAB NOTEBOOK',
      ...fields.map(
        ([key, label]) =>
          `${label}:\n${draft.fields[key] || '(not filled in)'}`,
      ),
      ...Object.entries(draft.notes).map(([id, note]) => `${id}:\n${note}`),
    ].join('\n\n');
    const url = URL.createObjectURL(
      new Blob([text], { type: 'text/plain;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'my-dmz-lab-notes.txt';
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="lab-notebook" aria-labelledby="dmz-notebook-title">
      <h2 id="dmz-notebook-title">My lab notebook</h2>
      <p>
        Write your choices here so you can find them again in the next lesson.
        The empty boxes belong to your notes; the examples are not saved until
        you type them.
      </p>
      <p className="notebook-storage">
        {academy.user
          ? 'Notes save under your signed-in account. Do not enter passwords, tokens or private keys.'
          : 'You are learning as a guest. Notes save only in this browser, which other people using this browser can also open. Profile saving will be available after account sign-in and storage are connected.'}
      </p>
      <p>
        <strong>For your first build:</strong> use the course’s names and
        addresses. These notes do not change the commands or screenshots. If you
        later choose different values, update every matching certificate, rule
        and configuration together.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <fieldset
          disabled={!academy.ready || storageBlocked || saving}
          className="notebook-edit-fields"
        >
          <legend className="sr-only">My DMZ choices and lesson notes</legend>
          <div className="notebook-fields">
            {fields
              .filter((field) => showAll || field[3] === lessonId)
              .map(([key, label, example]) => (
                <div className="notebook-field" key={key}>
                  <label htmlFor={'notebook-' + key}>{label}</label>
                  <textarea
                    id={'notebook-' + key}
                    rows={key === 'rules' || key === 'mac-map' ? 4 : 2}
                    maxLength={2000}
                    placeholder={example}
                    value={draft.fields[key] ?? ''}
                    onChange={(event) => {
                      setDraft((current) => ({
                        ...current,
                        fields: {
                          ...current.fields,
                          [key]: event.target.value,
                        },
                      }));
                      setStatus('Unsaved changes — click Save notes.');
                    }}
                  />
                </div>
              ))}
          </div>
          <div className="notebook-field">
            <label htmlFor="notebook-lesson">My notes for this lesson</label>
            <textarea
              id="notebook-lesson"
              rows={3}
              maxLength={2000}
              placeholder="What did I change? What did I see? What do I need to check next?"
              value={draft.notes[lessonId] ?? ''}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  notes: { ...current.notes, [lessonId]: event.target.value },
                }));
                setStatus('Unsaved changes — click Save notes.');
              }}
            />
          </div>
        </fieldset>
        <div className="notebook-actions">
          <button
            type="submit"
            disabled={!academy.ready || storageBlocked || saving}
          >
            {saving ? 'Saving…' : 'Save notes'}
          </button>
          <button type="button" onClick={download}>
            Download my notes
          </button>
          <button
            type="button"
            aria-expanded={showAll}
            onClick={() => setShowAll((value) => !value)}
          >
            {showAll ? 'Show this lesson’s fields' : 'Show my whole lab plan'}
          </button>
        </div>
        <p role="status" aria-live="polite">
          {status}
        </p>
      </form>
    </section>
  );
}
