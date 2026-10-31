import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseMigrationContent } from '../lib/migration-content.ts';
import { migrationProgressKey } from '../lib/migration-progress.ts';
import { migrationStages } from '../app/migration-course.ts';

const catalog = JSON.parse(
  await readFile(
    new URL(
      '../content/migration/migration-lessons.generated.json',
      import.meta.url,
    ),
    'utf8',
  ),
);
const appSource = await readFile(
  new URL('../app/migration/migration-academy.tsx', import.meta.url),
  'utf8',
);
const terminalSource = await readFile(
  new URL('../app/lab-terminal/lab-terminal.tsx', import.meta.url),
  'utf8',
);
const existingCourse = await readFile(
  new URL('../app/course.ts', import.meta.url),
  'utf8',
);
const sourceWorkbook = await readFile(
  new URL(
    '../docs/sources/SONIC_MIGRATION_WORKBOOK_FULL_SOURCE_v3.md',
    import.meta.url,
  ),
  'utf8',
);
const migrationCourseSource = await readFile(
  new URL('../app/migration-course.ts', import.meta.url),
  'utf8',
);

test('all 44 retained workbook lessons plus the new upgrade lesson are published once in contract order', () => {
  assert.equal(catalog.lessons.length, 45);
  assert.equal(new Set(catalog.lessons.map((lesson) => lesson.id)).size, 45);
  assert.deepEqual(
    catalog.lessons.slice(0, 3).map((lesson) => lesson.code),
    ['LAB 00', 'LAB 01', 'LAB 02'],
  );
  assert.deepEqual(
    catalog.lessons.slice(-4).map((lesson) => lesson.code),
    ['LAB 18', 'LAB 19', 'LAB 20', 'FIELD-01'],
  );
  for (const prefix of ['SQL-', 'MECM-', 'MOVE-', 'AZ-', 'HA-']) {
    assert.ok(
      catalog.lessons.some((lesson) => lesson.code.startsWith(prefix)),
      `${prefix} content missing`,
    );
  }
});

test('every migration lesson retains source mapping, route, stage, surface and substantive source content', () => {
  for (const lesson of catalog.lessons) {
    assert.match(lesson.route, /^\/migration#lesson=/);
    assert.ok(lesson.stageId);
    assert.ok(lesson.surface);
    assert.ok(lesson.sourceStartLine > 0);
    assert.ok(lesson.sourceEndLine >= lesson.sourceStartLine);
    assert.ok(lesson.body.length > 250, `${lesson.code} is unexpectedly short`);
    assert.ok(
      sourceWorkbook.includes(`${lesson.code} / ${lesson.sourceLabel}`),
    );
    assert.ok(sourceWorkbook.includes(`# ${lesson.title}`));
  }
});

test('the renderer preserves exact commands, pass/fail teaching panes, checklists and tables', () => {
  const sql = catalog.lessons.find((lesson) => lesson.code === 'SQL-03');
  const blocks = parseMigrationContent(sql.body);
  assert.ok(
    blocks.some(
      (block) =>
        block.type === 'command' &&
        block.lines.some((line) => line.includes('Get-Service MSSQLSERVER')),
    ),
  );
  assert.ok(blocks.some((block) => block.type === 'checklist'));
  assert.ok(
    blocks.some(
      (block) => block.type === 'callout' && block.label === 'PASS CHECK',
    ),
  );
  const map = catalog.lessons.find((lesson) => lesson.code === 'LAB 01');
  assert.ok(
    parseMigrationContent(map.body).some((block) => block.type === 'table'),
  );
});

test('migration progress is independent from the unchanged RHEL/Wazuh progress key and IDs', async () => {
  assert.equal(migrationProgressKey, 'sonic-agency-azure-migration-v1');
  assert.match(existingCourse, /rexuser/);
  assert.match(
    await readFile(
      new URL('../lib/progress-store.ts', import.meta.url),
      'utf8',
    ),
    /wazuh-foundations-v2/,
  );
  assert.doesNotMatch(
    await readFile(
      new URL('../lib/progress-store.ts', import.meta.url),
      'utf8',
    ),
    /sonic-agency-azure-migration-v1/,
  );
});

test('Learn It and Do the Job use the same lesson IDs without duplicate lesson sources', () => {
  assert.match(appSource, /migrationLessons/);
  assert.match(appSource, /migrationTasks/);
  assert.match(appSource, /setMode\('learn'\)/);
  assert.match(appSource, /setMode\('job'\)/);
  assert.match(
    appSource,
    /parseMigrationContent\(referenceBody\(lesson\.body\)\)/,
  );
  assert.doesNotMatch(appSource, /const\s+(learnLessons|jobLessons)\s*=/);
});

test('hosted terminal says copy/help and cannot construct a non-loopback companion connection', () => {
  assert.match(terminalSource, /Hosted SONIC cannot execute commands/);
  assert.match(terminalSource, /PowerShell runs on your PC/);
  assert.match(terminalSource, /Set up to run/);
  assert.match(
    terminalSource,
    /companionWebSocketUrl\(window\.location\.hostname\)/,
  );
});

test('original curriculum naming and rexuser defaults remain present', () => {
  assert.match(existingCourse, /export const adminAccount = 'rexuser'/);
  assert.match(existingCourse, /Wazuh/);
});

test('every learner task opens an implemented Windows migration project', () => {
  const taskLessonIds = [
    ...migrationCourseSource.matchAll(/lessonId: '([^']+)'/g),
  ].map((match) => match[1]);
  const lessonIds = new Set(catalog.lessons.map((lesson) => lesson.id));
  assert.equal(taskLessonIds.length, 10);
  for (const lessonId of taskLessonIds) {
    assert.ok(
      lessonIds.has(lessonId),
      `${lessonId} points to a missing lesson`,
    );
  }
  assert.equal(
    (migrationCourseSource.match(/state: 'available'/g) ?? []).length,
    10,
  );
  assert.equal((migrationCourseSource.match(/machine: '/g) ?? []).length, 10);
});

test('large migration catalog is grouped into explicit beginner stages', () => {
  const stageIds = migrationStages.map((stage) => stage.id);
  assert.equal(stageIds.length, 10);
  assert.match(
    migrationCourseSource,
    /Start Here: See the Windows Migration Lab/,
  );
  assert.match(migrationCourseSource, /Build the Agency Windows Domain/);
  assert.match(migrationCourseSource, /Build SQL01/);
  assert.match(
    migrationCourseSource,
    /Build the MECM Configuration Manager Lab/,
  );
});

test('migration readers share the pathway console and keep direct lesson navigation', async () => {
  const shell = await readFile(
    new URL('../app/console-reader-shell.tsx', import.meta.url),
    'utf8',
  );
  assert.match(shell, /href=\{l.href\}/);
  assert.match(shell, /aria-label="Academy navigation"/);
  assert.match(appSource, /ConsoleReaderShell/);
  assert.match(appSource, /ProjectDirectory/);
  assert.match(appSource, /lessonSequenceFor\(lesson.id\)/);
  assert.doesNotMatch(appSource, /next\/link/);
});
