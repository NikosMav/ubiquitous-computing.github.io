import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

// Choosing the whole journey scrolls smoothly to the story's start; wait for it to land.
async function openWholeJourney(page) {
  await page.locator('#story-skip-quiz').click();
  await expect
    .poll(() =>
      page.evaluate(() => document.querySelector('#intro-animation').getBoundingClientRect().top),
    )
    .toBeLessThan(200);
}

const desktop = (info) =>
  test.skip(info.project.name !== 'desktop', 'Pinned desktop scenes are covered at 1440px.');

test('original desktop scenes, disclosures and seven-step scroll sequence work', async ({
  page,
}, info) => {
  desktop(info);
  await page.setViewportSize({ width: 1440, height: 900 });
  const failures = [],
    errors = [];
  page.on('response', (response) => {
    if (response.url().startsWith('http://localhost') && response.status() >= 400)
      failures.push(response.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.main-heading')).toBeVisible();
  // The quiz is the entrance: the chapters stay closed until it is answered or declined.
  await expect(page.locator('#the-content')).toBeHidden();
  await expect(page.locator('html')).toHaveClass(/story-gated/);
  await expect(page.locator('.main-heading')).toBeInViewport();
  await openWholeJourney(page);
  await expect(page.locator('#the-content')).toBeVisible();
  await expect(page.locator('#newbie-section')).toBeHidden();
  await expect(page.locator('.intro-video video')).toHaveCount(1);
  await expect(page.locator('.cta_component .cta_img-photo')).toHaveCount(7);
  // The motion switch is gone: the story always runs its animations.
  await expect(page.locator('#motion-toggle')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveClass(/story-compact/);
  for (let i = 0; i < 8; i++) {
    for (const kind of ['theory', 'app']) {
      const id = `story-${kind}-${i}`;
      await page.locator(`[data-story-toggle="${id}"][data-story-open="true"]`).first().click();
      await expect(page.locator('#' + id)).toBeVisible();
      const close = page.locator(`[data-story-toggle="${id}"][data-story-open="false"]`).first();
      await expect(close).toBeFocused();
      await close.click();
      await expect(page.locator('#' + id)).toBeHidden();
    }
  }
  // Scroll to actual trigger geometry so the restored animation engine selects each scene.
  const triggers = page.locator('[tr-scroll-toggle="trigger"]');
  await expect(triggers).toHaveCount(7);
  for (const index of [0, 3, 6]) {
    await triggers
      .nth(index)
      .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 20));
    await expect(page.locator('[tr-scroll-toggle="number-current"]')).toHaveText(String(index + 1));
    await expect(page.locator('.cta_img-list > .is-active')).toHaveCount(1);
  }
  expect(failures).toEqual([]);
  expect(errors).toEqual([]);
});

test('breadcrumb follows the scroll position and links back to each level', async ({
  page,
}, info) => {
  desktop(info);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await openWholeJourney(page);
  const crumbs = page.locator('[data-uc-crumbs]');
  await page
    .locator('#mobile-fp')
    .evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY + 50));
  await expect(crumbs).toContainText('Πρώτο Κύμα');
  await expect(crumbs.locator('[aria-current]')).toHaveText('01. Φορητές Συσκευές');
  // The bar sits top-left, above the scenes.
  const box = await page.locator('.uc-crumbs').boundingBox();
  expect(box.y).toBeLessThan(40);
  expect(box.x).toBeLessThan(260);
  await crumbs.getByRole('link', { name: 'Πρώτο Κύμα' }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          document.querySelector('[data-section-name="Πρώτο Κύμα"]').getBoundingClientRect().top,
        ),
      ),
    )
    .toBeLessThan(120);
});

test('a first-wave lab opens in place and awards progress', async ({ page }, info) => {
  desktop(info);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await openWholeJourney(page);
  await page.locator('[data-story-toggle="story-app-2"][data-story-open="true"]').first().click();
  const lab = page.locator('#story-app-2 .lab');
  await expect(lab).toBeVisible();
  await lab.getByRole('button', { name: 'Στον αναγνώστη' }).first().click();
  await lab.getByRole('button', { name: 'Σάρωση' }).click();
  await expect(lab.locator('.lab-mission.is-done')).toHaveCount(1);
  await expect(page.locator('[data-uc-xp]')).toBeVisible();
});

for (const [score, level] of [
  [0, 'newbie'],
  [5, 'moderate'],
  [8, 'advanced'],
]) {
  test(`original quiz preserves the ${level} route and can restore all chapters`, async ({
    page,
  }, info) => {
    desktop(info);
    await page.setViewportSize({ width: 1440, height: 900 });
    const bank = JSON.parse(await readFile('intro-questions.json', 'utf8'));
    await page.goto('/');
    await expect(page.locator('#the-content')).toBeHidden();
    await page.locator('#start-quiz-btn').click();
    for (let i = 0; i < 8; i++) {
      await expect(page.locator('#quiz-question')).toContainText(`${i + 1} / 8`);
      const title = await page.locator('#quiz-question').textContent();
      const question = bank.find((q) => title.endsWith(q.question));
      const answer = question.answer ?? question.correctAnswer;
      const choice = i < score ? answer : question.options.find((option) => option !== answer);
      await page
        .locator('#quiz-options')
        .getByRole('button', { name: choice, exact: true })
        .click();
      await expect(page.locator('#quiz-result')).not.toBeEmpty();
      await page.locator('#story-next-question').click();
    }
    await expect(page.locator('#' + level + '-section')).toBeVisible();
    await expect(page.locator('#quiz-question')).toContainText(`${score}/8`);
    await expect(page.locator('.profile-step')).toBeVisible();
    await expect(page.locator('#the-content')).toBeVisible();
    if (level !== 'newbie') await expect(page.locator('#istoria')).toBeHidden();
    await page.locator('#' + level + '-section .story-show-all').click();
    await expect(page.locator('#istoria')).toBeVisible();
    await expect(page.locator('#dy')).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('uc-progress-v1')));
    expect(saved.quizzes.intro.level).toBe(level);
    // A returning visitor keeps the route instead of meeting the gate again.
    await page.reload();
    await expect(page.locator('#the-content')).toBeVisible();
    await expect(page.locator('.quiz-welcome')).toBeVisible();
  });
}

test('deep links pass through the quiz gate', async ({ page }, info) => {
  desktop(info);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/#smart-car');
  await expect(page.locator('#the-content')).toBeVisible();
  await expect
    .poll(
      () => page.evaluate(() => document.querySelector('#smart-car').getBoundingClientRect().top),
      {
        timeout: 15000,
      },
    )
    .toBeLessThan(120);
});

test('the story has a phone layout without horizontal scrolling', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'Phone layout.');
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.main-heading')).toBeVisible();
  await expect(page.locator('.uc-menu')).toBeVisible();
  await openWholeJourney(page);

  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Pinned desktop sequences give way to readable linear versions.
  await expect(page.locator('.cta_component')).toBeHidden();
  const scenes = page.locator('.story-scenes-linear figure');
  await expect(scenes).toHaveCount(7);
  await scenes.first().scrollIntoViewIfNeeded();
  await expect(scenes.first()).toBeVisible();
  // Chapter choice cards keep their buttons inside the card.
  const card = page.locator('[data-story-toggle="story-theory-0"][data-story-open="true"]').first();
  await card.scrollIntoViewIfNeeded();
  const button = await card.boundingBox();
  expect(button.x).toBeGreaterThanOrEqual(0);
  expect(button.x + button.width).toBeLessThanOrEqual(await page.evaluate(() => innerWidth));
  await page.locator('.uc-menu').click();
  await expect(page.locator('#uc-nav').getByRole('link', { name: 'Εργαστήριο' })).toBeVisible();
  expect(errors).toEqual([]);
});
