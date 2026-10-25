import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseGuidedLab } from '../lib/guided-lab.ts';
import catalog from '../content/migration/migration-lessons.generated.json' with { type: 'json' };
import alma from '../content/alma/desktop-lessons.json' with { type: 'json' };
import { guidedCourses } from '../lib/guided-courses.ts';
test('Per-step workspaces are kept out of commands and distinguish host, guest and Azure operations', () => {
  const upgrade = parseGuidedLab(
    catalog.lessons.find((l) => l.id === 'upgrade-01').body,
  );
  assert.match(upgrade.steps[4].where, /Your Windows host.*PowerShell/);
  assert.match(upgrade.steps[8].where, /APP02.*Azure.*PowerShell/);
  for (const lesson of catalog.lessons) {
    const guide = parseGuidedLab(lesson.body);
    for (const step of guide.steps) {
      assert.ok(step.where, lesson.id + ':' + step.title);
      assert.doesNotMatch(step.command, /\*\*WORKSPACE\*\*/);
      assert.doesNotMatch(step.expect, /The named action finishes/);
    }
  }
  assert.match(
    alma.lessons.find((l) => l.id === 'alma-install').guide.steps[0].where,
    /Windows.*PowerShell/,
  );
  assert.match(
    alma.lessons.find((l) => l.id === 'alma-install').guide.steps[3].where,
    /installer/,
  );
  assert.match(
    alma.lessons.find((l) => l.id === 'alma-files').guide.steps[0].where,
    /GNOME Files/,
  );
});
test('Teaching examples use reserved private domains without changing the public support identity', () => {
  const teaching = JSON.stringify([catalog, alma, ...guidedCourses]);
  assert.doesNotMatch(teaching, /cloudseam\.tech/i);
  assert.match(teaching, /lab\.example\.test/);
  const setup = catalog.lessons.find((l) => l.id === 'mecm-02').body;
  assert.match(setup, /DC=lab,DC=example,DC=test/);
  assert.match(
    readFileSync('app/support/page.tsx', 'utf8'),
    /support@cloudseam\.tech/,
  );
  const security = guidedCourses.find((c) => c.id === 'budget-cloud-security');
  assert.match(
    JSON.stringify(security),
    /cannot be verified as a public Entra domain/,
  );
});
