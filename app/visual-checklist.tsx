'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { actionCopy, readActionChecks } from '../lib/action-checklist';
import { ServerRoleText } from './server-role-text';
import './visual-checklist.css';

/** Keeps exact authored actions; checking a row never awards course completion. */
export function VisualChecklist({
  stepId,
  actions,
  renderAction,
}: {
  stepId: string;
  actions: string[];
  renderAction?: (action: string) => ReactNode;
}) {
  const storageKey = `sonic-visual-actions-v1:${stepId}`;
  const signature = JSON.stringify(actions);
  const [state, setState] = useState<{ key: string; values: string[] }>({
    key: '',
    values: [],
  });
  const [notice, setNotice] = useState('');
  const checks = state.key === storageKey + signature ? state.values : [];
  useEffect(() => {
    function load() {
      try {
        setState({
          key: storageKey + signature,
          values: readActionChecks(
            localStorage.getItem(storageKey),
            JSON.parse(signature),
          ),
        });
      } catch {
        setState({ key: storageKey + signature, values: [] });
        setNotice('Checks stay on this page; browser storage is unavailable.');
      }
    }
    load();
    const sync = (event: StorageEvent) => {
      if (!event.key || event.key === storageKey) load();
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, [storageKey, signature]);
  function toggle(action: string) {
    const values = checks.includes(action)
      ? checks.filter((value) => value !== action)
      : [...checks, action];
    setState({ key: storageKey + signature, values });
    try {
      localStorage.setItem(storageKey, JSON.stringify(values));
    } catch {
      setNotice('Checks stay on this page; browser storage is unavailable.');
    }
  }
  return (
    <section className="visual-checklist" aria-label="Action checklist">
      <header>
        <h4>Do this</h4>
        <span aria-live="polite">
          {actions.filter((action) => checks.includes(action)).length} of{' '}
          {actions.length} checked
        </span>
      </header>
      <ol>
        {actions.map((action, index) => {
          const copy = actionCopy(action);
          return (
            <li key={`${index}:${action}`}>
              <label>
                <input
                  type="checkbox"
                  checked={checks.includes(action)}
                  onChange={() => toggle(action)}
                />
                <span className="visual-action-number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>
                  {renderAction ? (
                    renderAction(copy.instruction)
                  ) : (
                    <ServerRoleText text={copy.instruction} />
                  )}
                </span>
              </label>
              {copy.explanation && (
                <details className="visual-action-help">
                  <summary>Why?</summary>
                  <p>{copy.explanation}</p>
                </details>
              )}
            </li>
          );
        })}
      </ol>
      {notice && <output aria-live="polite">{notice}</output>}
    </section>
  );
}
