'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useAcademy } from './academy-provider';
import { learningPathways, pathwayLessons } from './learning-pathways';
import {
  blankEnvironment,
  passportKey,
  readPassport,
  validIPv4,
  type LabEnvironment,
} from '../lib/lab-passport';
import './learner-experience.css';
const changed = 'sonic-lab-passport-change';
const LabScope = createContext<string | undefined>(undefined);
export function LabEnvironmentScope({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return <LabScope.Provider value={id}>{children}</LabScope.Provider>;
}
export function useRecordedEnvironment() {
  const academy = useAcademy();
  const id = useContext(LabScope);
  const key = passportKey(academy.user?.id);
  const raw = useSyncExternalStore(
    subscribe,
    () => (academy.ready ? rawFor(key) : ''),
    () => '',
  );
  return id ? readPassport(raw).environments[id] : undefined;
}
function subscribe(callback: () => void) {
  window.addEventListener(changed, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(changed, callback);
    window.removeEventListener('storage', callback);
  };
}
function rawFor(key: string) {
  try {
    return localStorage.getItem(key) ?? '';
  } catch {
    return '';
  }
}
export function LabPassport({
  lessonId,
  profile = false,
}: {
  lessonId?: string;
  profile?: boolean;
}) {
  const academy = useAcademy();
  const course = learningPathways.find((path) =>
    pathwayLessons(path).some((lesson) => lesson.id === lessonId),
  );
  const [selected, setSelected] = useState('linux-daily-admin');
  const id = course?.id ?? selected;
  const key = passportKey(academy.user?.id);
  const raw = useSyncExternalStore(
    subscribe,
    () => (academy.ready ? rawFor(key) : ''),
    () => '',
  );
  const saved = readPassport(raw);
  const environment = saved.environments[id] ?? blankEnvironment();
  const [draft, setDraft] = useState<{
    scope: string;
    values: LabEnvironment;
  } | null>(null);
  const [notice, setNotice] = useState('');
  const scope = key + ':' + id;
  const values = draft?.scope === scope ? draft.values : environment;
  useEffect(() => {
    setDraft(null);
    setNotice('');
  }, [scope]);
  const content = (
    <>
      {profile && (
        <label>
          Class
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
          >
            {learningPathways.map((path) => (
              <option key={path.id} value={path.id}>
                {path.title}
              </option>
            ))}
          </select>
        </label>
      )}
      <p className="passport-note">
        Record your own lab values. Saved on this device under your{' '}
        {academy.user ? 'signed-in profile' : 'guest profile'}. Sync across
        devices is not available yet. No passwords or keys.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!academy.ready) return;
          if (!validIPv4(values.ipv4.trim())) {
            setNotice(
              'Enter a full IPv4 address, such as 192.168.211.128, or leave it blank.',
            );
            return;
          }
          try {
            const current = readPassport(rawFor(key));
            const clean = Object.fromEntries(
              Object.entries(values).map(([field, value]) => [
                field,
                value.trim(),
              ]),
            ) as LabEnvironment;
            localStorage.setItem(
              key,
              JSON.stringify({
                ...current,
                updatedAt: new Date().toISOString(),
                environments: { ...current.environments, [id]: clean },
              }),
            );
            window.dispatchEvent(new Event(changed));
            setDraft(null);
            setNotice('Lab values saved on this device.');
          } catch {
            setNotice(
              'Could not save: browser storage is unavailable. Keep a copy in your lab notes.',
            );
          }
        }}
      >
        <fieldset disabled={!academy.ready} className="passport-fields">
          <legend className="sr-only">Your lab values</legend>
          {(
            [
              ['hostname', 'VM hostname', 'Example: alma-lab01'],
              ['username', 'VM username', 'Example: learner'],
              ['ipv4', 'VM IPv4 address', 'Example: 192.168.211.128'],
              [
                'directory',
                'Your working directory',
                'Example: /home/learner/sonic-admin',
              ],
            ] as const
          ).map(([field, label, placeholder]) => (
            <label key={field}>
              {label}
              <input
                autoComplete="off"
                spellCheck={false}
                maxLength={200}
                placeholder={placeholder}
                value={values[field]}
                onChange={(event) => {
                  setDraft({
                    scope,
                    values: { ...values, [field]: event.target.value },
                  });
                  setNotice('Unsaved changes');
                }}
              />
            </label>
          ))}
          <button type="submit">Save lab values</button>
        </fieldset>
      </form>
      <p className="passport-note">
        Values are reference notes. They do not replace commands or prove a
        connection to your VM.{' '}
        <a href="/profile#lab-passport">Manage in my profile →</a>
      </p>
      <output role="status" aria-live="polite">
        {notice}
      </output>
    </>
  );
  if (profile)
    return (
      <section id="lab-passport" className="profile-section lab-passport">
        <h2>My Lab Passport</h2>
        {content}
      </section>
    );
  if (!course) return null;
  return (
    <details className="lab-passport">
      <summary>
        <span>My Lab Passport</span>
        <span className="passport-preview">
          {environment.username ? `${environment.username}@` : ''}
          {environment.hostname || 'Add your VM'}
          {environment.ipv4
            ? ` · ${environment.ipv4}`
            : ' · hostname, IP and folder'}
          {environment.directory ? ` · ${environment.directory}` : ''}
        </span>
      </summary>
      {content}
    </details>
  );
}
