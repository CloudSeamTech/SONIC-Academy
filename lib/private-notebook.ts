export type NotebookImage = { id: string; name: string; blob: Blob };
export type NotebookEntry = {
  id: string;
  owner: string;
  lessonId: string;
  title: string;
  text: string;
  updatedAt: string;
  images: NotebookImage[];
  trashed?: boolean;
};
export const notebookOwner = (owner?: string) =>
  owner ? `account:${owner}` : 'guest';
export function cleanNote(title: string, text: string) {
  return {
    title: title.trim().slice(0, 120),
    text: text.trim().slice(0, 12000),
  };
}
export async function validateNotebookImage(file: Blob) {
  if (file.size > 5 * 1024 * 1024 || file.size < 12)
    throw new Error('Choose a PNG, JPEG or WebP screenshot smaller than 5 MB.');
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png =
    bytes[0] === 137 &&
    bytes[1] === 80 &&
    bytes[2] === 78 &&
    bytes[3] === 71 &&
    bytes[4] === 13 &&
    bytes[5] === 10 &&
    bytes[6] === 26 &&
    bytes[7] === 10;
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  if (!png && !jpeg && !webp)
    throw new Error(
      'This file is not a supported PNG, JPEG or WebP image. SVG and renamed text files are not accepted.',
    );
  return png ? 'image/png' : jpeg ? 'image/jpeg' : 'image/webp';
}
function openNotebook(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not support the private notebook.'));
      return;
    }
    const request = indexedDB.open('sonic-private-notebook-v1', 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('entries'))
        request.result
          .createObjectStore('entries', { keyPath: 'id' })
          .createIndex('owner', 'owner');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        new Error(
          'Browser storage could not open. Your note has not been saved.',
        ),
      );
    request.onblocked = () =>
      reject(
        new Error('Close older academy tabs and retry opening the notebook.'),
      );
  });
}
export async function listNotebook(owner: string): Promise<NotebookEntry[]> {
  const db = await openNotebook();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const request = tx
      .objectStore('entries')
      .index('owner')
      .getAll(IDBKeyRange.only(owner));
    request.onsuccess = () =>
      resolve(
        (request.result as NotebookEntry[])
          .filter((entry) => entry.owner === owner)
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      );
    request.onerror = () => reject(new Error('Saved notes could not be read.'));
    tx.oncomplete = () => db.close();
    tx.onabort = () => db.close();
  });
}
export async function putNotebook(entry: NotebookEntry) {
  const db = await openNotebook();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    tx.objectStore('entries').put(entry);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(
        new Error(
          'Browser storage is full or unavailable. Your draft is still shown; nothing was uploaded.',
        ),
      );
    };
  });
}
