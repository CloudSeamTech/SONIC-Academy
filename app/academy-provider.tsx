'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { isProgressKey, parseCompleted } from '@/lib/academy-tracking';
const ownerKey = 'sonic-academy-active-account';
const guestKey = 'sonic-academy-guest-backup';
type Activity = { lesson_id: string; visited_at: number };
type Learner = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  subscriptionTier?: string;
};
type AccountResponse = {
  accountAvailable: boolean;
  user: Learner | null;
  records: Record<string, string>;
  activity: Activity[];
};
type AcademyState = {
  user: Learner | null;
  accountAvailable: boolean;
  ready: boolean;
  completed: string[];
  bookmarks: string[];
  activity: Activity[];
  syncMessage: string;
  saveProfile: (
    name: string,
    contact?: { email: string; phone: string },
  ) => Promise<void>;
  toggleBookmark: (id: string) => void;
  importGuest: () => Promise<void>;
};
const Context = createContext<AcademyState | null>(null);
function readRecords() {
  const records: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && isProgressKey(key)) {
      const value = localStorage.getItem(key);
      if (value) records[key] = value;
    }
  }
  return records;
}
function replaceRecords(records: Record<string, string>) {
  for (const key of Object.keys(readRecords())) localStorage.removeItem(key);
  for (const [key, value] of Object.entries(records))
    if (isProgressKey(key)) localStorage.setItem(key, value);
  window.dispatchEvent(new StorageEvent('storage', { key: null }));
  window.dispatchEvent(new Event('focus'));
}
function bookmarksOf(records: Record<string, string>) {
  try {
    const value = JSON.parse(records['sonic-academy-bookmarks-v1'] ?? '[]');
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}
export function AcademyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Learner | null>(null),
    [available, setAvailable] = useState(false),
    [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]),
    [bookmarks, setBookmarks] = useState<string[]>([]),
    [activity, setActivity] = useState<Activity[]>([]),
    [message, setMessage] = useState('');
  useEffect(() => {
    let disposed = false,
      initialized = false,
      signedIn = false,
      saving = false,
      last = '',
      observed = '',
      retryAfter = 0,
      accountId = '',
      sent: Record<string, string> = {},
      pendingVisit: string | undefined;
    const apply = (records: Record<string, string>) => {
      const serialized = JSON.stringify(records);
      if (serialized === observed) return;
      observed = serialized;
      setCompleted(parseCompleted(records));
      setBookmarks(bookmarksOf(records));
    };
    const post = async (body: Record<string, unknown>) => {
      const response = await fetch('/api/learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, ...body }),
        keepalive: true,
      });
      if (!response.ok)
        throw new Error(
          'Your latest changes are still in this browser. Cloud save failed; try again.',
        );
    };
    const tick = async () => {
      if (disposed || !initialized) return;
      let records: Record<string, string>;
      try {
        records = readRecords();
      } catch {
        setMessage(
          'Browser storage is unavailable. Enable it to keep your progress.',
        );
        return;
      }
      apply(records);
      const serialized = JSON.stringify(records);
      if (accountId && serialized !== last) {
        try {
          localStorage.setItem('sonic-academy-outbox:' + accountId, serialized);
        } catch {
          /* Server save still gets a chance. */
        }
      }
      if (
        signedIn &&
        !saving &&
        Date.now() >= retryAfter &&
        (serialized !== last || pendingVisit)
      ) {
        saving = true;
        const lessonId = pendingVisit;
        try {
          const entries = Object.entries(records).filter(
            ([key, value]) => sent[key] !== value,
          );
          for (let i = 0; i < entries.length; i += 35)
            await post({
              records: Object.fromEntries(entries.slice(i, i + 35)),
            });
          if (lessonId) await post({ lessonId });
          sent = records;
          last = serialized;
          if (JSON.stringify(readRecords()) === serialized)
            localStorage.removeItem('sonic-academy-outbox:' + accountId);
          if (pendingVisit === lessonId) pendingVisit = undefined;
          if (!disposed) setMessage('Progress saved to your account');
        } catch (error) {
          retryAfter = Date.now() + 15000;
          if (!disposed) setMessage((error as Error).message);
        } finally {
          saving = false;
        }
      }
    };
    const visit = () => {
      const lesson = new URLSearchParams(location.hash.slice(1)).get('lesson');
      if (!lesson) return;
      const item = { lesson_id: lesson, visited_at: Date.now() };
      setActivity((items) =>
        [item, ...items.filter((x) => x.lesson_id !== lesson)].slice(0, 12),
      );
      try {
        const prior = JSON.parse(
          localStorage.getItem('sonic-academy-recent-v1') ?? '[]',
        ) as Activity[];
        localStorage.setItem(
          'sonic-academy-recent-v1',
          JSON.stringify(
            [item, ...prior.filter((x) => x.lesson_id !== lesson)].slice(0, 12),
          ),
        );
      } catch {
        /* History is optional in a guest browser. */
      }
      pendingVisit = lesson;
      void tick();
    };
    const initialize = async () => {
      try {
        const response = await fetch('/api/learner', {
          cache: 'no-store',
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok)
          throw new Error(
            'Account connection is unavailable. You can still learn as a guest.',
          );
        const data = (await response.json()) as AccountResponse;
        if (disposed) return;
        setAvailable(data.accountAvailable === true);
        setUser(data.user ?? null);
        signedIn = Boolean(data.user);
        accountId = data.user?.id ?? '';
        if (data.user) {
          if (localStorage.getItem(ownerKey) !== data.user.id) {
            if (!localStorage.getItem(ownerKey))
              localStorage.setItem(guestKey, JSON.stringify(readRecords()));
            replaceRecords(data.records ?? {});
            localStorage.setItem(ownerKey, data.user.id);
          } else replaceRecords(data.records ?? {});
          setActivity(data.activity ?? []);
          sent = data.records ?? {};
          last = JSON.stringify(sent);
          const pending = localStorage.getItem(
            'sonic-academy-outbox:' + accountId,
          );
          if (pending) {
            const queued = JSON.parse(pending) as Record<string, string>;
            replaceRecords({ ...sent, ...queued });
          }
          setMessage('Account progress loaded');
        } else if (localStorage.getItem(ownerKey)) {
          const guest = JSON.parse(localStorage.getItem(guestKey) ?? '{}');
          replaceRecords(guest);
          localStorage.removeItem(ownerKey);
        }
        if (!signedIn) {
          try {
            setActivity(
              JSON.parse(
                localStorage.getItem('sonic-academy-recent-v1') ?? '[]',
              ),
            );
          } catch {
            /* Ignore invalid local history. */
          }
        }
        apply(readRecords());
      } catch (error) {
        if (!disposed) {
          setMessage((error as Error).message);
          try {
            // Queue offline edits for the cached owner; never send them until identity is verified.
            accountId = localStorage.getItem(ownerKey) ?? '';
            sent = readRecords();
            last = JSON.stringify(sent);
            apply(sent);
          } catch {
            /* Storage unavailable. */
          }
        }
      } finally {
        if (!disposed) {
          initialized = true;
          setReady(true);
          visit();
          void tick();
        }
      }
    };
    void initialize();
    const interval = window.setInterval(() => void tick(), 2500);
    window.addEventListener('hashchange', visit);
    window.addEventListener('sonic-academy-progress', tick);
    window.addEventListener('storage', tick);
    window.addEventListener('pagehide', tick);
    return () => {
      disposed = true;
      clearInterval(interval);
      window.removeEventListener('hashchange', visit);
      window.removeEventListener('sonic-academy-progress', tick);
      window.removeEventListener('storage', tick);
      window.removeEventListener('pagehide', tick);
    };
  }, []);
  async function saveProfile(
    name: string,
    contact?: { email: string; phone: string },
  ) {
    const response = await fetch('/api/learner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ...contact, accountId: user?.id }),
    });
    if (!response.ok)
      throw new Error('Your profile could not be saved. Try again.');
    setUser((current) =>
      current ? { ...current, ...contact, name: name.trim() } : null,
    );
  }
  function toggleBookmark(id: string) {
    try {
      const values = bookmarks.includes(id)
        ? bookmarks.filter((x) => x !== id)
        : [...bookmarks, id];
      localStorage.setItem(
        'sonic-academy-bookmarks-v1',
        JSON.stringify(values),
      );
      setBookmarks(values);
      window.dispatchEvent(new Event('sonic-academy-progress'));
    } catch {
      setMessage('This browser could not save your bookmark.');
    }
  }
  async function importGuest() {
    if (!user) throw new Error('Sign in first.');
    const guest = JSON.parse(localStorage.getItem(guestKey) ?? '{}') as Record<
      string,
      string
    >;
    const current = readRecords();
    for (const [key, raw] of Object.entries(guest)) {
      if (!isProgressKey(key)) continue;
      const prior = JSON.parse(current[key] ?? 'null'),
        value = JSON.parse(raw);
      if (!prior) current[key] = raw;
      else if (Array.isArray(prior) && Array.isArray(value))
        current[key] = JSON.stringify([...new Set([...prior, ...value])]);
      else if (key === 'sonic-academy-notebook-v1:windows-dmz') {
        // Explicit guest import keeps the signed-in account's choices on conflict.
        current[key] = JSON.stringify({
          version: 1,
          fields: { ...value.fields, ...prior.fields },
          notes: { ...value.notes, ...prior.notes },
        });
      } else if (
        prior &&
        value &&
        typeof prior === 'object' &&
        typeof value === 'object'
      ) {
        for (const field of ['completed', 'checked', 'verified'])
          if (Array.isArray(value[field]))
            prior[field] = [
              ...new Set([...(prior[field] ?? []), ...value[field]]),
            ];
        if (value.answers)
          prior.answers = { ...value.answers, ...prior.answers };
        current[key] = JSON.stringify(prior);
      }
    }
    const entries = Object.entries(current);
    for (let i = 0; i < entries.length; i += 35) {
      const response = await fetch('/api/learner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: user.id,
          records: Object.fromEntries(entries.slice(i, i + 35)),
        }),
      });
      if (!response.ok)
        throw new Error('Browser progress could not be imported.');
    }
    replaceRecords(current);
    window.dispatchEvent(new Event('sonic-academy-progress'));
    setMessage('Browser progress imported into your account');
  }
  return (
    <Context.Provider
      value={{
        user,
        accountAvailable: available,
        ready,
        completed,
        bookmarks,
        activity,
        syncMessage: message,
        saveProfile,
        toggleBookmark,
        importGuest,
      }}
    >
      <fieldset
        className="academy-readiness"
        disabled={!ready}
        aria-busy={!ready}
      >
        <legend className="sr-only">Learning controls</legend>
        {children}
      </fieldset>
    </Context.Provider>
  );
}
export function useAcademy() {
  const context = useContext(Context);
  if (!context) throw new Error('AcademyProvider is required');
  return context;
}
