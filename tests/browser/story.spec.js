import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'The original presentation is designed for desktop.');
  await page.setViewportSize({ width: 1440, height: 900 });
});

test('original desktop scenes, disclosures and seven-step scroll sequence work', async ({
  page,
}) => {
  const failures = [],
    errors = [];
  page.on('response', (response) => {
    if (response.url().startsWith('http://localhost') && response.status() >= 400)
      failures.push(response.url());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.locator('.main-heading')).toBeVisible();
  await expect(page.locator('#the-content')).toBeVisible();
  await expect(page.locator('#newbie-section')).toBeHidden();
  await expect(page.locator('.intro-video video')).toHaveCount(1);
  await expect(page.locator('.cta_img-photo')).toHaveCount(7);
  await expect(page.locator('.main-heading')).toBeInViewport();
  for (let i = 0; i < 8; i++) {
    for (const kind of ['theory', 'app']) {
      const id = `story-${kind}-${i}`;
      await page.locator(`[data-story-toggle="${id}"][data-story-open="true"]`).click();
      await expect(page.locator('#' + id)).toBeVisible();
      const close = page.locator(`[data-story-toggle="${id}"][data-story-open="false"]`);
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

for (const [score, level] of [
  [0, 'newbie'],
  [5, 'moderate'],
  [8, 'advanced'],
]) {
  test(`original quiz preserves the ${level} route and can restore all chapters`, async ({
    page,
  }) => {
    const bank = JSON.parse(await readFile('intro-questions.json', 'utf8'));
    await page.goto('/');
    await page.locator('#start-quiz-btn').click();
    for (let i = 0; i < 8; i++) {
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
    if (level !== 'newbie') await expect(page.locator('#istoria')).toBeHidden();
    await page.locator('#' + level + '-section .story-show-all').click();
    await expect(page.locator('#istoria')).toBeVisible();
    await expect(page.locator('#dy')).toBeVisible();
  });
}

test('reduced motion provides every scenario scene and plain view links back', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/story-compact/);
  await expect(page.locator('.cta_component')).toBeHidden();
  await expect(page.locator('.story-compact-scenes figure')).toHaveCount(7);
  await page.locator('.story-toolbar').getByRole('link', { name: 'Απλή προβολή' }).click();
  await expect(page).toHaveURL(/guide.html$/);
  await page.getByRole('link', { name: 'Scrollytelling', exact: true }).click();
  await expect(page.locator('.main-heading')).toBeVisible();
});
