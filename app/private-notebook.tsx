'use client';
import { useEffect, useRef, useState } from 'react';
import { useAcademy } from './academy-provider';
import { learningPathways, pathwayLessons } from './learning-pathways';
import {
  cleanNote,
  listNotebook,
  notebookOwner,
  putNotebook,
  validateNotebookImage,
  type NotebookEntry,
  type NotebookImage,
} from '../lib/private-notebook';
import './learning-lab-tools.css';
const lessons = learningPathways.flatMap(pathwayLessons);

function NoteImage({ image }: { image: NotebookImage }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const src = URL.createObjectURL(image.blob);
    setUrl(src);
    return () => URL.revokeObjectURL(src);
  }, [image.blob]);
  // Native image: this browser-only Blob must never enter a remote optimizer.
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt={`Saved evidence: ${image.name}`} loading="lazy" />
    </a>
  ) : null;
}
function Editor({
  owner,
  lessonId,
  profile,
}: {
  owner: string;
  lessonId?: string;
  profile: boolean;
}) {
  const [entries, setEntries] = useState<NotebookEntry[]>([]);
  const [target, setTarget] = useState(lessonId ?? '');
  const [editing, setEditing] = useState('');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState<NotebookImage[]>([]);
  const [trash, setTrash] = useState(false);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const titleInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let disposed = false;
    listNotebook(owner)
      .then((rows) => {
        if (!disposed) setEntries(rows);
      })
      .catch((error) => {
        if (!disposed) setNotice(error.message);
      });
    return () => {
      disposed = true;
    };
  }, [owner]);
  const refresh = async () => setEntries(await listNotebook(owner));
  const reset = () => {
    setEditing('');
    setTitle('');
    setText('');
    setImages([]);
  };
  const rows = entries.filter(
    (entry) =>
      Boolean(entry.trashed) === trash &&
      (!target || entry.lessonId === target),
  );
  return (
    <details
      className="private-notebook lesson-support"
      id="private-notebook"
      open={profile || undefined}
    >
      <summary>My private evidence notebook · notes and screenshots</summary>
      <p>
        Saved only in this browser for your current profile. Not uploaded or
        synced. Anyone with access to this browser profile may be able to read
        it; clearing browser data can remove it. Crop out passwords, private
        keys and tokens.
      </p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (
            !target ||
            busy ||
            (!title.trim() && !text.trim() && !images.length)
          )
            return;
          setBusy(true);
          setNotice('');
          try {
            const note = cleanNote(title, text);
            await putNotebook({
              id: editing || crypto.randomUUID(),
              owner,
              lessonId: target,
              title: note.title || 'Lab evidence',
              text: note.text,
              updatedAt: new Date().toISOString(),
              images,
            });
            await refresh();
            reset();
            setNotice('Evidence saved in this browser.');
          } catch (error) {
            setNotice((error as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <fieldset disabled={busy} className="notebook-editor-fields">
          {profile && (
            <label>
              Lab for this note
              <select
                value={target}
                onChange={(event) => {
                  setTarget(event.target.value);
                  reset();
                }}
              >
                <option value="">Choose a lab / show all saved notes</option>
                {learningPathways.map((course) => (
                  <optgroup key={course.id} label={course.title}>
                    {pathwayLessons(course).map((lesson) => (
                      <option value={lesson.id} key={lesson.id}>
                        {lesson.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
          )}
          <label>
            Evidence title
            <input
              ref={titleInput}
              maxLength={120}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="What did you prove?"
            />
          </label>
          <label>
            Result and recovery notes
            <textarea
              maxLength={12000}
              rows={5}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="What I changed · the result · checks I ran · how to recover"
            />
          </label>
          <label>
            Add screenshots · PNG, JPEG or WebP · 5 MB each, up to 6
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              disabled={busy}
              onChange={async (event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                if (files.length + images.length > 6) {
                  setNotice('Keep up to 6 screenshots in one note.');
                  return;
                }
                setBusy(true);
                setNotice('');
                try {
                  const added: NotebookImage[] = [];
                  for (const file of files) {
                    const type = await validateNotebookImage(file);
                    added.push({
                      id: crypto.randomUUID(),
                      name: file.name.slice(0, 120),
                      blob: new Blob([file], { type }),
                    });
                  }
                  setImages((current) => [...current, ...added]);
                } catch (error) {
                  setNotice((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            />
          </label>
          <div className="notebook-images">
            {images.map((image) => (
              <figure key={image.id}>
                <NoteImage image={image} />
                <figcaption>{image.name}</figcaption>
                <button
                  type="button"
                  onClick={() =>
                    setImages((current) =>
                      current.filter((item) => item.id !== image.id),
                    )
                  }
                >
                  Remove draft screenshot
                </button>
              </figure>
            ))}
          </div>
          <div className="lab-tool-actions">
            <button type="submit" disabled={busy || !target}>
              {busy ? 'Working…' : editing ? 'Save changes' : 'Save evidence'}
            </button>
            <button type="button" disabled={busy} onClick={reset}>
              New note
            </button>
          </div>
        </fieldset>
      </form>
      <div className="lab-tool-actions">
        <button
          type="button"
          aria-pressed={trash}
          onClick={() => setTrash((value) => !value)}
        >
          {trash ? 'Show active notes' : 'View recoverable trash'}
        </button>
        <button
          type="button"
          disabled={busy || !entries.length}
          onClick={async () => {
            setBusy(true);
            try {
              const output = [];
              const selectedEntries = entries.filter(
                (entry) =>
                  !entry.trashed && (!target || entry.lessonId === target),
              );
              const size = selectedEntries.reduce(
                (total, entry) =>
                  total +
                  entry.images.reduce((sum, image) => sum + image.blob.size, 0),
                0,
              );
              if (size > 40 * 1024 * 1024) {
                setNotice(
                  'This export exceeds 40 MB. Select a single lab or reduce its attachments, then retry.',
                );
                return;
              }
              for (const entry of selectedEntries) {
                const attachments = [];
                for (const image of entry.images) {
                  const bytes = new Uint8Array(await image.blob.arrayBuffer());
                  let binary = '';
                  for (const byte of bytes) binary += String.fromCharCode(byte);
                  attachments.push({
                    name: image.name,
                    type: image.blob.type,
                    base64: btoa(binary),
                  });
                }
                output.push({
                  lessonId: entry.lessonId,
                  title: entry.title,
                  text: entry.text,
                  updatedAt: entry.updatedAt,
                  screenshots: attachments,
                });
              }
              const url = URL.createObjectURL(
                new Blob(
                  [
                    JSON.stringify(
                      {
                        version: 1,
                        exportedAt: new Date().toISOString(),
                        notes: output,
                      },
                      null,
                      2,
                    ),
                  ],
                  { type: 'application/json' },
                ),
              );
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = 'cloudseam-private-notebook.json';
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
              setNotice(
                'Notebook export prepared for download. Keep this file private.',
              );
            } catch {
              setNotice(
                'The export could not be prepared. Your saved notes remain in this browser.',
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Export my notebook
        </button>
      </div>
      {rows.length === 0 && (
        <p>
          {trash
            ? 'No notes in recoverable trash for this lab.'
            : 'No saved evidence for this lab yet.'}
        </p>
      )}
      {rows.map((entry) => (
        <article className="notebook-entry" key={entry.id}>
          <h3>{entry.title}</h3>
          <p>
            <a
              href={
                lessons.find((lesson) => lesson.id === entry.lessonId)?.href ??
                '/'
              }
            >
              {lessons.find((lesson) => lesson.id === entry.lessonId)?.title ??
                entry.lessonId}
            </a>{' '}
            ·{' '}
            <time dateTime={entry.updatedAt}>
              {new Date(entry.updatedAt).toLocaleString()}
            </time>
          </p>
          <p className="notebook-text">{entry.text}</p>
          <div className="notebook-images">
            {entry.images.map((image) => (
              <figure key={image.id}>
                <NoteImage image={image} />
                <figcaption>{image.name}</figcaption>
              </figure>
            ))}
          </div>
          <div className="lab-tool-actions">
            {!trash && (
              <button
                type="button"
                onClick={() => {
                  setEditing(entry.id);
                  setTarget(entry.lessonId);
                  setTitle(entry.title);
                  setText(entry.text);
                  setImages(entry.images);
                  titleInput.current?.focus();
                  titleInput.current?.scrollIntoView({ block: 'center' });
                }}
              >
                Edit note
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await putNotebook({
                    ...entry,
                    trashed: !entry.trashed,
                    updatedAt: new Date().toISOString(),
                  });
                  await refresh();
                  if (editing === entry.id) reset();
                  setNotice(
                    entry.trashed
                      ? 'Note restored.'
                      : 'Note moved to recoverable trash.',
                  );
                } catch (error) {
                  setNotice((error as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {trash ? 'Restore note' : 'Move note to trash'}
            </button>
          </div>
        </article>
      ))}
      {notice && <p role="status">{notice}</p>}
    </details>
  );
}
export function PrivateNotebook({
  lessonId,
  profile = false,
}: {
  lessonId?: string;
  profile?: boolean;
}) {
  const academy = useAcademy();
  const owner = notebookOwner(academy.user?.id);
  return academy.ready ? (
    <Editor
      key={`${owner}:${lessonId ?? 'profile'}`}
      owner={owner}
      lessonId={lessonId}
      profile={profile}
    />
  ) : (
    <p>Loading private notebook…</p>
  );
}
