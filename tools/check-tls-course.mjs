import assert from 'node:assert/strict';
import fs from 'node:fs';
import course from '../content/tls/course.json' with { type: 'json' };
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const base = process.env.REVIEW_URL || 'http://localhost:3011';
const dir = process.env.REVIEW_ARTIFACTS || '/tmp/sonic-tls-review';
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox'],
});
try {
  const p = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    ignoreHTTPSErrors: true,
    reducedMotion: 'reduce',
  });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  async function open(id) {
    await p.goto(base + '/tls#lesson=' + id, { waitUntil: 'networkidle' });
    await p.locator('.nessus-lesson').waitFor();
    await p.waitForFunction(
      () => !document.querySelector('.academy-readiness')?.disabled,
    );
  }
  await open('tls-basics');
  assert.equal(await p.locator('.nessus-course-switcher a').count(), 1);
  await p.getByRole('button', { name: 'Trusted root', exact: true }).click();
  assert(
    (await p.locator('.tls-interactive').textContent()).includes(
      'client must already trust',
    ),
  );
  await p.getByRole('button', { name: /2\. Firewall/ }).click();
  assert(
    (await p.locator('.tls-interactive').textContent()).includes(
      'not a complete enterprise firewall',
    ),
  );
  await open('tls-find');
  await p.locator('.tls-interactive select').selectOption('test');
  await p.locator('#tls-command-answer').fill('sudo nginx -T');
  await p
    .getByRole('button', { name: 'Check my command', exact: true })
    .click();
  assert(
    (await p.locator('.tls-interactive [role=status]').textContent()).includes(
      'Try again',
    ),
  );
  await p.locator('#tls-command-answer').fill('sudo nginx -t');
  await p
    .getByRole('button', { name: 'Check my command', exact: true })
    .click();
  assert(
    (await p.locator('.tls-interactive [role=status]').textContent()).includes(
      'Correct command',
    ),
  );
  await open('tls-troubleshoot');
  const { tlsScenarios } = await import('../lib/tls-lab.ts');
  for (const scenario of tlsScenarios) {
    await p.locator('.tls-interactive select').selectOption(scenario.id);
    await p
      .locator('.tls-interactive input[type=radio]')
      .nth(scenario.answer)
      .check();
    await p
      .getByRole('button', { name: 'Check my next action', exact: true })
      .click();
    assert(
      (
        await p.locator('.tls-interactive [role=status]').textContent()
      ).startsWith('Correct.'),
    );
  }
  console.log(
    'PASS architecture/chain, exact-case command rehearsal and all 12 failure simulations',
  );
  let count = 0;
  for (const lesson of course.lessons) {
    await open(lesson.id);
    for (let i = 0; i < lesson.steps.length; i++) {
      await p.locator('.guided-step-picker select').selectOption(String(i));
      const step = p.locator('.guided-step');
      await step
        .getByRole('heading', { name: 'What we’re doing', exact: true })
        .waitFor();
      await step
        .getByRole('heading', { name: 'If this fails', exact: true })
        .waitFor();
      const img = step.locator('.guided-visuals img').first();
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((e) => e.decode());
      assert((await img.getAttribute('src')).startsWith('/tls-lab/screens/'));
      assert(
        await img.evaluate((e) =>
          Boolean(
            e.compareDocumentPosition(
              e.closest('.guided-step').querySelector('.guided-pagination'),
            ) & Node.DOCUMENT_POSITION_FOLLOWING,
          ),
        ),
      );
      const literal = step.locator('pre code').first();
      if (await literal.count())
        assert.equal(
          await literal.evaluate((e) => getComputedStyle(e).textTransform),
          'none',
        );
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        lesson.id + ':' + i,
      );
      count++;
    }
    console.log('PASS steps', lesson.id, lesson.steps.length);
  }
  await open('tls-basics');
  const first = course.lessons.find((l) => l.id === 'tls-basics');
  const verify = p.getByRole('button', {
    name: 'Verify lesson complete',
    exact: true,
  });
  assert(await verify.isDisabled());
  for (let i = 0; i < first.steps.length; i++) {
    await p.locator('.guided-step-picker select').selectOption(String(i));
    await p.locator('.guided-step .guided-check input').check();
  }
  await p.locator('.nessus-exercise .guided-check input').check();
  for (let q = 0; q < first.quiz.length; q++)
    await p
      .locator('.nessus-quiz fieldset')
      .nth(q)
      .locator('input')
      .nth(first.quiz[q].answer)
      .check();
  await p
    .getByRole('button', { name: 'Check my answers', exact: true })
    .click();
  await verify.click();
  assert(
    (await p.locator('.tls-course-progress').textContent()).includes('1 of 13'),
  );
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForFunction(
    () => !document.querySelector('.academy-readiness')?.disabled,
  );
  assert(
    (await p.locator('.tls-course-progress').textContent()).includes('1 of 13'),
  );
  await open('tls-final');
  assert(
    await p
      .getByRole('heading', { name: 'Final assessment', exact: true })
      .count(),
  );
  assert.equal(await p.locator('.nessus-quiz fieldset').count(), 7);
  console.log(
    'PASS quiz/step/exercise gates, saved progress after reload and final assessment',
  );
  for (const width of [320, 390, 768, 1440, 1920]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const id of [
      'tls-basics',
      'tls-install',
      'tls-troubleshoot',
      'tls-final',
    ]) {
      await open(id);
      assert.equal(
        await p.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
        width + ':' + id,
      );
    }
    console.log('PASS TLS width', width);
  }
  // Test the completion display with a disposable local self-report fixture, never a user account upgrade.
  await p.evaluate((c) => {
    const current = JSON.parse(
      localStorage.getItem('sonic-academy-nessus-v1') ||
        '{"version":1,"checked":[],"verified":[],"answers":{}}',
    );
    for (const l of c.lessons) {
      for (let i = 0; i < l.steps.length; i++)
        current.checked.push(`${l.id}:step:${i}`);
      current.checked.push(`${l.id}:exercise`);
      current.answers[l.id] = l.quiz.map((q) => q.answer);
      current.verified.push(l.id);
    }
    localStorage.setItem('sonic-academy-nessus-v1', JSON.stringify(current));
  }, course);
  await p.reload({ waitUntil: 'networkidle' });
  await p
    .getByRole('heading', {
      name: 'Course complete · self-verified',
      exact: true,
    })
    .waitFor();
  assert(
    (await p.locator('.tls-course-progress').textContent()).includes(
      '13 of 13',
    ),
  );
  await p.setViewportSize({ width: 1440, height: 1100 });
  await open('tls-install');
  await p.locator('.guided-step-picker select').selectOption('7');
  await p.locator('.guided-step').scrollIntoViewIfNeeded();
  await p.screenshot({ path: dir + '/tls-install-desktop.png' });
  await p.locator('.guided-visuals img').first().click();
  await p.locator('dialog[open]').waitFor();
  await p
    .locator('dialog[open]')
    .getByRole('button', { name: 'Close picture ×', exact: true })
    .click();
  await p.setViewportSize({ width: 390, height: 900 });
  await open('tls-troubleshoot');
  await p.locator('.tls-interactive').scrollIntoViewIfNeeded();
  await p.screenshot({ path: dir + '/tls-troubleshoot-mobile.png' });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      lessons: course.lessons.length,
      steps: count,
      simulations: 12,
      quizQuestions: course.lessons.reduce((n, l) => n + l.quiz.length, 0),
      errors,
      pass: true,
    }),
  );
} finally {
  await browser.close();
}
