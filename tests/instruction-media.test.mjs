import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { reviewedInstructionCapture } from '../lib/instruction-media.ts';
import { parseGuidedLab } from '../lib/guided-lab.ts';
import { explainStep } from '../lib/step-coaching.ts';
import coverage from '../content/screenshots/coverage.json' with { type: 'json' };
test('missing, wrong-step, stale, unreviewed and generic-card media cannot fill an application screenshot slot', () => {
  const step = coverage.steps[0];
  const capture = {
    stepId: step.stepId,
    instructionHash: step.instructionHash,
    src: '/lab-screenshots/captures/workstation-example.png',
    platform: 'VMware Workstation Pro — reviewed test fixture',
    provenance: 'Test fixture, not a genuine capture',
    reviewed: true,
  };
  assert.equal(reviewedInstructionCapture(step.stepId, []), undefined);
  assert.equal(
    reviewedInstructionCapture(step.stepId, [{ ...capture, reviewed: false }]),
    undefined,
  );
  assert.equal(
    reviewedInstructionCapture(step.stepId, [
      { ...capture, instructionHash: 'stale' },
    ]),
    undefined,
  );
  assert.equal(
    reviewedInstructionCapture('another-step', [capture]),
    undefined,
  );
  assert.equal(
    reviewedInstructionCapture(step.stepId, [
      { ...capture, src: '/step-pictures/generic.svg' },
    ]),
    undefined,
  );
  assert.equal(reviewedInstructionCapture(step.stepId, [capture]), capture);
});
test('Windows VM wizard steps orient the learner to the real page, fields and next page', () => {
  const catalog = JSON.parse(
    fs.readFileSync(
      'content/migration/migration-lessons.generated.json',
      'utf8',
    ),
  );
  let checked = 0;
  for (const lesson of catalog.lessons) {
    const guide = parseGuidedLab(lesson.body);
    if (!guide) continue;
    for (const step of guide.steps) {
      if (step.title === 'Create a new virtual disk') {
        assert.match(step.action, /Specify Disk Capacity/);
        assert.match(step.action, /Ctrl\+A/);
        assert.ok(
          step.action.indexOf('Allocate all disk space now') <
            step.action.indexOf('Click Next'),
        );
        assert.match(step.expect, /Ready to Create Virtual Machine/);
        checked++;
      }
      if (step.title === 'Choose Typical')
        assert.doesNotMatch(step.action, /reference image/);
    }
  }
  assert.ok(checked >= 5);
});
test('a Windows selection is not mistaken for a SQL SELECT query', () => {
  const note = explainStep({
    lessonId: 'lab-04',
    title: 'Choose the Server 2019 guest profile',
    action: 'Select Microsoft Windows from the list.',
    expected: 'Windows Server 2019 is selected.',
  });
  assert.doesNotMatch(note.reason, /database|schema|query behavior/i);
  assert.match(note.reason, /guest profile|virtual hardware/i);
});
