import test from 'node:test';
import assert from 'node:assert/strict';
import { readLabNotebook, dmzNotebookKey } from '../lib/lab-notebook.ts';
import { isProgressKey, parseCompleted } from '../lib/academy-tracking.ts';
test('Notebook accepts bounded text, preserves separate lesson notes and earns no completion credit', () => {
  const raw = JSON.stringify({ version: 1, fields: { 'iis-name': 'MY-IIS', 'rules': 'PROXY → IIS:443', invalid: 123, huge: 'a'.repeat(2001), 'bad/key': 'ignored' }, notes: { 'dmz-plan': 'My plan', 'dmz-iis': 'My IIS result' } });
  const notes = readLabNotebook(raw);
  assert.deepEqual(notes.fields, { 'iis-name': 'MY-IIS', rules: 'PROXY → IIS:443' });
  assert.equal(notes.notes['dmz-iis'], 'My IIS result');
  assert.equal(isProgressKey(dmzNotebookKey), true);
  assert.equal(isProgressKey('sonic-academy-notebook-v1:unknown'), false);
  assert.deepEqual(parseCompleted({ [dmzNotebookKey]: raw }), []);
  assert.deepEqual(readLabNotebook('broken'), { version: 1, fields: {}, notes: {} });
  assert.deepEqual(readLabNotebook('{"version":99}'), { version: 1, fields: {}, notes: {} });
});
