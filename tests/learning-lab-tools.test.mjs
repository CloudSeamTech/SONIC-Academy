import test from 'node:test';
import assert from 'node:assert/strict';
import {
  learningModules,
  questionsForModule,
  gradeQuestions,
  questionSignature,
  assessmentKey,
  referenceFor,
  retainPracticeAttempts,
} from '../lib/learning-modules.ts';
import { learningPathways, pathwayLessons } from '../app/learning-pathways.ts';
import { nodesForCourse, mapKey, readMap } from '../lib/lab-maps.ts';
import {
  cleanNote,
  notebookOwner,
  validateNotebookImage,
} from '../lib/private-notebook.ts';
import { isProgressKey } from '../lib/academy-tracking.ts';

test('every existing module has ten complete questions and a real end lesson, without losing a lab', () => {
  assert.equal(learningModules.length, 79);
  assert.equal(new Set(learningModules.map((module) => module.id)).size, 79);
  assert.deepEqual(
    learningModules
      .flatMap((module) => module.lessons.map((lesson) => lesson.id))
      .sort(),
    learningPathways
      .flatMap(pathwayLessons)
      .map((lesson) => lesson.id)
      .sort(),
  );
  for (const module of learningModules) {
    const questions = questionsForModule(module.id);
    assert.equal(questions.length, 10, module.id);
    assert.equal(
      new Set(questions.map((question) => question.question.toLowerCase()))
        .size,
      10,
      module.id,
    );
    assert.equal(module.last.id, module.lessons.at(-1).id);
    for (const question of questions) {
      assert.ok(
        question.options.length >= 2 && question.options.length <= 5,
        question.id,
      );
      assert.equal(
        new Set(question.options).size,
        question.options.length,
        question.id,
      );
      assert.ok(
        Number.isInteger(question.answer) &&
          question.answer >= 0 &&
          question.answer < question.options.length,
      );
      assert.ok(question.explanation.length >= 35, question.id);
      assert.match(question.source, /^https:\/\//);
      assert.ok(question.objective.length > 8);
    }
    assert.ok(
      new Set(questions.map((question) => question.answer)).size > 1,
      module.id,
    );
  }
});
test('grading rejects unanswered holes and invalid choices, preserves exact scoring and version identity', () => {
  const questions = questionsForModule(learningModules[0].id);
  const perfect = questions.map((question) => question.answer);
  assert.deepEqual(gradeQuestions(questions, perfect), {
    correct: 10,
    total: 10,
    passed: true,
  });
  const eight = perfect.map((answer, i) =>
    i < 2 ? (answer + 1) % questions[i].options.length : answer,
  );
  assert.deepEqual(gradeQuestions(questions, eight), {
    correct: 8,
    total: 10,
    passed: true,
  });
  const sparse = [];
  const history = retainPracticeAttempts(questions, [
    { answers: perfect, at: 'first' },
    ...Array.from({ length: 25 }, (_, i) => ({
      answers: eight,
      at: String(i),
    })),
  ]);
  assert.equal(history.length, 20);
  assert.equal(gradeQuestions(questions, history[0].answers).correct, 10);
  assert.equal(history.at(-1).at, '24');
  sparse[9] = 0;
  assert.equal(gradeQuestions(questions, sparse), null);
  assert.equal(gradeQuestions(questions, [-1, ...perfect.slice(1)]), null);
  assert.equal(gradeQuestions(questions, [999, ...perfect.slice(1)]), null);
  assert.equal(gradeQuestions(questions, perfect.slice(1)), null);
  assert.equal(
    questionSignature(questions),
    questionSignature(questionsForModule(learningModules[0].id)),
  );
  assert.notEqual(
    questionSignature(questions),
    questionSignature(
      questions.map((q, i) =>
        i ? q : { ...q, answer: (q.answer + 1) % q.options.length },
      ),
    ),
  );
  assert.match(referenceFor('windows').title, /AZ-802/);
  assert.match(referenceFor('linux').title, /RHEL 10/);
  const broadModule = questionsForModule('vsphere:vsphere-basics');
  assert.ok(
    broadModule.some((question) => question.id.startsWith('vsphere-capstone:')),
  );
  assert.ok(
    new Set(
      broadModule
        .filter((question) => question.id.includes(':knowledge:'))
        .map((question) => question.id.split(':')[0]),
    ).size >= 5,
  );
});
test('notes, maps and test records have separate profile scope and never join public progress synchronization', () => {
  assert.notEqual(notebookOwner(), notebookOwner('a'));
  assert.notEqual(notebookOwner('a'), notebookOwner('b'));
  for (const key of [
    mapKey('a', 'linux'),
    assessmentKey('a', 'linux:one'),
    'sonic-private-notebook-v1',
  ])
    assert.equal(isProgressKey(key), false, key);
  assert.notEqual(mapKey('a', 'linux'), mapKey('b', 'linux'));
  assert.notEqual(assessmentKey('a', 'one'), assessmentKey('a', 'two'));
  assert.deepEqual(cleanNote('  proof  ', '  checked  '), {
    title: 'proof',
    text: 'checked',
  });
  assert.equal(
    cleanNote('a'.repeat(1000), 'b'.repeat(20000)).text.length,
    12000,
  );
});
test('all courses have explicit planned lab roles and malformed map storage is bounded', () => {
  for (const course of learningPathways) {
    const nodes = nodesForCourse(course.id);
    assert.ok(nodes.length >= 2 && nodes.length <= 4);
    assert.equal(new Set(nodes.map((node) => node.id)).size, nodes.length);
    assert.ok(nodes.every((node) => node.role && node.workspace && node.terms));
  }
  assert.deepEqual(readMap('{broken'), {});
  assert.deepEqual(readMap('{"version":2,"nodes":{}}'), {});
  const map = readMap(
    JSON.stringify({
      version: 1,
      nodes: { linux: { hostname: 'x'.repeat(500), ipv4: '', password: 'no' } },
    }),
  );
  assert.equal(map.linux.hostname.length, 120);
  assert.equal('password' in map.linux, false);
  assert.equal(
    nodesForCourse('nessus-linux').find((node) => node.id === 'scanner').checks,
    '',
  );
});
test('private screenshot attachments accept recognized raster headers and reject scripts and oversized files', async () => {
  const png = new Blob(
    [
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9ZQmcAAAAASUVORK5CYII=',
        'base64',
      ),
    ],
    { type: 'image/png' },
  );
  assert.equal(await validateNotebookImage(png), 'image/png');
  await assert.rejects(
    validateNotebookImage(
      new Blob(['<svg onload="alert(1)"></svg>'], { type: 'image/png' }),
    ),
    /not a supported/,
  );
  await assert.rejects(
    validateNotebookImage(new Blob([new Uint8Array(6 * 1024 * 1024)])),
    /smaller than 5 MB/,
  );
});
