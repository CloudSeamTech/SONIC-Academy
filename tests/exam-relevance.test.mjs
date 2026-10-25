import test from 'node:test';
import assert from 'node:assert/strict';
import { examRelevance } from '../lib/exam-relevance.ts';
test('Exam notes distinguish Azure, Windows Server and Linux without inventing matches', () => {
  assert.match(examRelevance('lz-network').exam, /AZ-104/);
  assert.match(examRelevance('lab-04').exam, /AZ-802/);
  assert.match(examRelevance('guest-network-v2').exam, /EX200/);
  assert.equal(examRelevance('helpdesk-tickets'), undefined);
  assert.equal(examRelevance('mecm-01'), undefined);
  assert.equal(examRelevance('splunk-investigate'), undefined);
  assert.equal(examRelevance('alma-games'), undefined);
});
