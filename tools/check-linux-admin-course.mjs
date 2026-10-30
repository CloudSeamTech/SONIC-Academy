import assert from 'node:assert/strict';
import fs from 'node:fs';
import course from '../content/linux-admin/course.json' with { type: 'json' };
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || 'playwright'
);
const base = process.env.REVIEW_URL || 'http://localhost:3011';
const dir = process.env.REVIEW_ARTIFACTS || '/tmp/sonic-daily-review';
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
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
    await p.goto(base + '/linux-admin#lesson=' + id, {
      waitUntil: 'networkidle',
    });
    await p.locator('.nessus-lesson').waitFor();
    await p.waitForFunction(
      () => !document.querySelector('.academy-readiness')?.disabled,
    );
  }
  let count = 0;
  for (const lesson of course.lessons) {
    await open(lesson.id);
    assert.equal(await p.locator('.nessus-course-switcher a').count(), 1);
    assert.ok(
      (await p.locator('.alma-header').textContent()).includes(lesson.title),
    );
    for (let i = 0; i < lesson.steps.length; i++) {
      await p.locator('.guided-step-picker select').selectOption(String(i));
      const step = p.locator('.guided-step');
      assert.equal(
        await step.locator('pre code').first().textContent(),
        lesson.steps[i].command,
      );
      const img = step.locator('.guided-visuals img').first();
      await img.scrollIntoViewIfNeeded();
      await img.evaluate((e) => e.decode());
      assert.ok(
        (await img.getAttribute('src')).includes(
          lesson.steps[i].screenshot.assetId,
        ),
      );
      assert.equal(
        await step.locator('.guided-visuals').evaluate((e) => {
          const button = [...e.parentElement.querySelectorAll('button')].find(
            (b) => /next step/i.test(b.textContent),
          );
          return (
            !button ||
            Boolean(
              e.compareDocumentPosition(button) &
              Node.DOCUMENT_POSITION_FOLLOWING,
            )
          );
        }),
        true,
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
    console.log('PASS lesson', lesson.id);
  }
  await open('daily-space');
  const choices = p.locator('.admin-decision button');
  await choices.nth(0).click();
  assert.match(
    await p.locator('.admin-decision [role=status]').textContent(),
    /Pause/,
  );
  await choices.nth(1).click();
  assert.match(
    await p.locator('.admin-decision [role=status]').textContent(),
    /Good choice/,
  );
  await open('daily-start');
  const lesson = course.lessons[0];
  const verify = p.getByRole('button', {
    name: 'Verify lesson complete',
    exact: true,
  });
  assert.ok(await verify.isDisabled());
  for (let i = 0; i < lesson.steps.length; i++) {
    await p.locator('.guided-step-picker select').selectOption(String(i));
    await p.locator('.guided-step .guided-check input').check();
  }
  await p.locator('.nessus-exercise .guided-check input').check();
  for (let i = 0; i < lesson.quiz.length; i++)
    await p
      .locator('.nessus-quiz fieldset')
      .nth(i)
      .locator('input')
      .nth(lesson.quiz[i].answer)
      .check();
  await p
    .getByRole('button', { name: 'Check my answers', exact: true })
    .click();
  await verify.click();
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForFunction(
    () => !document.querySelector('.academy-readiness')?.disabled,
  );
  assert.match(
    await p
      .locator('[aria-label="Daily administrator practice"]')
      .textContent(),
    /1 of 20/,
  );
  await p.locator('.guided-visuals img').first().scrollIntoViewIfNeeded();
  await p.locator('.guided-visuals img').first().click();
  await p.locator('dialog[open]').waitFor();
  await p.getByRole('button', { name: 'Close picture ×', exact: true }).click();
  for (const width of [320, 390, 768, 1440, 1920]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const id of [
      'daily-start',
      'daily-space',
      'daily-lvm',
      'daily-final',
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
    console.log('PASS width', width);
  }
  // Disposable test-browser self-report fixture; never changes an actual learner account.
  await p.evaluate((c) => {
    const data = { version: 1, checked: [], verified: [], answers: {} };
    for (const l of c.lessons) {
      data.checked.push(
        ...l.steps.map((_, i) => `${l.id}:step:${i}`),
        `${l.id}:exercise`,
      );
      data.answers[l.id] = l.quiz.map((q) => q.answer);
      data.verified.push(l.id);
    }
    localStorage.setItem('sonic-academy-nessus-v1', JSON.stringify(data));
  }, course);
  await p.reload({ waitUntil: 'networkidle' });
  await open('daily-final');
  await p
    .getByRole('heading', {
      name: 'Course complete · self-verified',
      exact: true,
    })
    .waitFor();
  await p
    .getByRole('heading', { name: 'Final assessment', exact: true })
    .waitFor();
  await p.setViewportSize({ width: 1440, height: 1100 });
  await open('daily-space');
  await p.locator('.guided-visuals img').first().scrollIntoViewIfNeeded();
  await p.screenshot({ path: dir + '/daily-space-desktop.png' });
  await p.setViewportSize({ width: 390, height: 844 });
  await open('daily-lvm');
  await p.locator('.guided-step').scrollIntoViewIfNeeded();
  await p.screenshot({ path: dir + '/daily-lvm-mobile.png' });
  assert.deepEqual(errors, []);
  console.log(
    'PASS',
    count,
    'steps, image loading/zoom, step ordering, decisions, progress persistence, completion, five widths, zero page errors',
  );
} finally {
  await browser.close();
}
