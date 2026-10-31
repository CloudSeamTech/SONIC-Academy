import test from 'node:test';
import assert from 'node:assert/strict';
import { typingInstruction } from '../lib/typing-instruction.ts';

test('command instructions encourage typing', () => {
  assert.equal(
    typingInstruction('Please paste the command into the terminal.'),
    'Please type the command into the terminal.',
  );
  assert.equal(typingInstruction('Copy command'), 'Type the command');
});

test('file copying and technical symbols retain their meaning', () => {
  const text =
    'Copy a file with cp. Keep $HOME, #, > and /etc/nginx unchanged.';
  assert.equal(typingInstruction(text), text);
});

test('a former copy-and-paste sequence becomes one natural typing instruction', () => {
  assert.equal(
    typingInstruction(
      'Copy the three lines below, paste them, and press Enter. Each line is a separate question.',
    ),
    'Type the three lines below one at a time, pressing Enter after each input. Each line is a separate question.',
  );
});
