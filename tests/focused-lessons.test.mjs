import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import catalog from '../content/migration/migration-lessons.generated.json' with { type: 'json' };
import alma from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { productionPracticeFor } from '../lib/lab-production-practice.ts';

test('every migration and AlmaLinux lesson has a production comparison, not an executable instruction', () => {
  for (const lesson of [...catalog.lessons, ...alma.lessons]) {
    const guidance = productionPracticeFor(lesson.id);
    assert.ok(guidance.length > 85, lesson.id);
    assert.match(guidance, /[.!]$/);
  }
  assert.match(productionPracticeFor('sql-05'), /restore tests/i);
  assert.match(productionPracticeFor('lab-04'), /system-state recovery/i);
  assert.match(
    productionPracticeFor('alma-wd-drive'),
    /never run destructive/i,
  );
});

test('every shared lesson reader puts pictures above its visual checklist and retains real checks', () => {
  const guided = readFileSync('app/migration/guided-lab.tsx', 'utf8');
  assert.ok(
    guided.indexOf('<InstructionScreenshots') <
      guided.indexOf('<VisualChecklist'),
  );
  assert.match(guided, /Check your result/);
  assert.match(guided, /productionPracticeFor\(lessonId\)/);
  assert.match(guided, /<section\s+className="guided-visuals"[^>]*>/);
  const linux = readFileSync('app/sonic-ui.tsx', 'utf8');
  assert.match(linux, /className="sonic-action-panel"/);
  assert.ok(
    linux.indexOf('<InstructionScreenshots') <
      linux.indexOf('<VisualChecklist'),
  );
  const courses = readFileSync('app/nessus/nessus-academy.tsx', 'utf8');
  assert.ok(
    courses.indexOf('<CourseScreenshot') < courses.indexOf('<VisualChecklist'),
  );
  assert.match(courses, /Check your result/);
  assert.match(courses, /I checked this result in my own lab/);
});
