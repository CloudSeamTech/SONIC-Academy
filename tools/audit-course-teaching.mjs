import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
import { guidedCourses } from '../lib/guided-courses.ts';
import { migrationCurriculum } from '../app/migration-curriculum.ts';
import { parseGuidedLab } from '../lib/guided-lab.ts';
import { taskNavigation } from '../lib/task-navigation.ts';

const read = (path) => JSON.parse(fs.readFileSync(path, 'utf8'));
const legacy = read('content/screenshots/coverage.json').steps;
const reviews = read('content/teaching/course-reviews.json');
const required = [
  'directions',
  'links',
  'visuals',
  'success',
  'recovery',
  'browser',
];
const lessons = learningPathways.flatMap((course) =>
  pathwayLessons(course).map((lesson) => ({ ...lesson, subject: course.id })),
);
if (new Set(lessons.map((lesson) => lesson.id)).size !== lessons.length)
  throw new Error('Duplicate catalog lesson ID');
const rows = lessons.map((lesson) => {
  const structured = guidedCourses
    .flatMap((course) => course.lessons)
    .find((item) => item.id === lesson.id);
  const migration = migrationCurriculum.find((item) => item.id === lesson.id);
  const guide = migration ? parseGuidedLab(migration.body) : null;
  let steps;
  if (structured)
    steps = structured.steps.map((step, index) => ({
      id: `${lesson.id}:${index + 1}`,
      title: step.title,
      where: step.where,
      actions:
        taskNavigation[`${lesson.id}:${index + 1}`]?.actions ?? step.actions,
      command: step.command ?? '',
      expected: step.expected,
      recovery: step.guide?.failure ?? step.notes?.join(' ') ?? '',
      visual: step.screenshot.status,
      navigation: taskNavigation[`${lesson.id}:${index + 1}`] ?? null,
      sources:
        taskNavigation[`${lesson.id}:${index + 1}`]?.links?.map(
          (item) => item.url,
        ) ?? step.sources,
    }));
  else if (guide)
    steps = guide.steps.map((step, index) => ({
      id: `${migration.screenshotLessonId ?? lesson.id}:guided:${index + (migration.stepOffset ?? 0) + 1}`,
      title: step.title,
      where: step.where ?? guide.where,
      actions: [step.action],
      command: step.command,
      expected: step.expect,
      recovery: step.trouble,
      visual: step.screenshots.length
        ? 'reference-association-needs-review'
        : 'illustration-or-missing',
      sources: [],
    }));
  else
    steps = legacy
      .filter((step) => step.lessonId === lesson.id)
      .map((step) => ({
        id: step.stepId,
        title: step.title,
        where: step.where,
        actions: [step.actions],
        command: step.command,
        expected: step.expected,
        recovery: '',
        visual: step.status,
        sources: [],
      }));
  const signature = createHash('sha256')
    .update(JSON.stringify(steps))
    .digest('hex');
  const review = reviews[lesson.id];
  const complete = Boolean(
    review &&
    review.signature === signature &&
    review.reviewedOn &&
    required.every((key) => review.checks?.[key] === true),
  );
  return {
    id: lesson.id,
    subject: lesson.subject,
    title: lesson.title,
    href: lesson.href,
    status: complete
      ? 'reviewed'
      : review
        ? 'review-invalidated-or-incomplete'
        : 'needs-review',
    signature,
    steps: steps.length,
    authoredExactRoutes: steps.filter(
      (step) => taskNavigation[step.id]?.path?.length,
    ).length,
    captureNeeded: steps.filter((step) => step.visual === 'capture-needed')
      .length,
    missingEvidence: required.filter(
      (key) =>
        !review || review.signature !== signature || !review.checks?.[key],
    ),
    stepInventory: steps.map((step) => ({
      id: step.id,
      title: step.title,
      visual: step.visual,
    })),
  };
});
const known = new Set(rows.map((row) => row.id));
for (const id of Object.keys(reviews))
  if (!known.has(id)) throw new Error(`Orphan teaching review: ${id}`);
const report = {
  schemaVersion: 1,
  summary: {
    subjects: learningPathways.length,
    lessons: rows.length,
    reviewed: rows.filter((row) => row.status === 'reviewed').length,
    remaining: rows.filter((row) => row.status !== 'reviewed').length,
    lessonsWithoutStepInventory: rows
      .filter((row) => !row.steps)
      .map((row) => row.id),
  },
  lessons: rows,
};
fs.mkdirSync('docs/course-review', { recursive: true });
fs.writeFileSync(
  'docs/course-review/progress.json',
  JSON.stringify(report, null, 2) + '\n',
);
console.log(JSON.stringify(report.summary, null, 2));
if (report.summary.lessonsWithoutStepInventory.length) process.exitCode = 1;

if (process.argv.includes('--require-complete') && report.summary.remaining) {
  console.error(
    `Teaching review incomplete: ${report.summary.remaining} of ${report.summary.lessons} lessons remain.`,
  );
  process.exitCode = 1;
}
