import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { labs } from '../../js/catalog.js';

const routes = [
  'guide.html',
  'reading.html',
  'lab.html',
  'journey.html',
  'intro_quiz.html',
  'knowledge_quiz.html',
  'face_recognition.html',
  'hand_gestures.html',
  'pose_detection.html',
  ...Object.values(labs)
    .map((lab) => lab.page)
    .filter((page) => page.startsWith('lab-')),
];
for (const route of routes) {
  test(`${route}: accessible, no overflow or failed local resources`, async ({ page }) => {
    const errors = [],
      failures = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.url().startsWith('http://localhost') && response.status() >= 400)
        failures.push(response.url());
    });
    await page.goto('/' + route);
    await expect(page.locator('h1')).toBeVisible();
    if (route.includes('quiz')) await expect(page.locator('fieldset')).toBeVisible();
    if (route.startsWith('lab-')) await expect(page.locator('.lab-missions')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    expect(
      (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
        .violations,
    ).toEqual([]);
    expect(errors).toEqual([]);
    expect(failures).toEqual([]);
  });
}

test('reading and native disclosures work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8000/guide.html');
  await page.locator('summary').filter({ hasText: 'Ασύρματη επικοινωνία' }).click();
  await expect(page.getByText('Το Bluetooth συνδέει', { exact: false })).toBeVisible();
  await page.locator('#uc-nav').getByRole('link', { name: 'Κεφάλαια', exact: true }).click();
  await expect(page.locator('#future')).toContainText('Άλεξ');
  await context.close();
});

for (const [route, bankFile, count] of [
  ['intro_quiz.html', 'intro-questions.json', 8],
  ['knowledge_quiz.html', 'questions.json', 10],
]) {
  test(`${route}: complete, download and restart`, async ({ page }) => {
    const bank = JSON.parse(await readFile(bankFile, 'utf8'));
    await page.goto('/' + route);
    for (let i = 0; i < count; i++) {
      await expect(page.locator('#quiz-status')).toHaveText(`Ερώτηση ${i + 1} από ${count}`);
      const title = await page.locator('legend').textContent();
      const question = bank.find((q) => q.question === title);
      await page
        .getByRole('radio', { name: question.answer ?? question.correctAnswer, exact: true })
        .check();
      await page.getByRole('button', { name: 'Έλεγχος απάντησης' }).click();
      await expect(page.locator('.feedback')).toContainText('Σωστά!');
      await expect(page.getByRole('radio').first()).toBeDisabled();
      await page
        .getByRole('button', { name: i + 1 === count ? 'Δες το αποτέλεσμα' : 'Επόμενη ερώτηση' })
        .click();
    }
    await expect(page.locator('.quiz-result h2')).toHaveText(`${count} / ${count}`);
    if (route.startsWith('intro'))
      await expect(page.getByRole('link', { name: 'Ξεκίνα με τις εφαρμογές' })).toHaveAttribute(
        'href',
        'reading.html#mobile-fp',
      );
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Αποθήκευση αποτελέσματος' }).click();
    expect((await download).suggestedFilename()).toBe('ubiquitous-computing-quiz.txt');
    await page.getByRole('button', { name: 'Δοκίμασε ξανά' }).click();
    await expect(page.locator('#quiz-status')).toHaveText(`Ερώτηση 1 από ${count}`);
  });
}

test('quiz request failure provides retry', async ({ page }) => {
  await page.route('**/questions.json', (route) => route.abort());
  await page.goto('/knowledge_quiz.html');
  await expect(page.locator('#quiz-status')).toContainText('δεν φορτώθηκαν');
  await page.unroute('**/questions.json');
  await page.getByRole('button', { name: 'Νέα προσπάθεια' }).click();
  await expect(page.locator('fieldset')).toBeVisible();
});

test('camera denial is recoverable and does not download a model', async ({ page }) => {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Denied for test', 'NotAllowedError');
    };
  });
  await page.goto('/pose_detection.html');
  await page.getByRole('button', { name: 'Έναρξη κάμερας' }).click();
  await expect(page.locator('#camera-status')).toContainText('Δεν δόθηκε πρόσβαση');
  await expect(page.locator('#start-camera')).toBeEnabled();
  expect(requests.some((url) => url.includes('mediapipe-models') || url.includes('/vendor/'))).toBe(
    false,
  );
});

test('cancel pending permission releases a late-arriving stream', async ({ page }) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () =>
      new Promise((resolve) => {
        window.resolveCamera = resolve;
      });
  });
  await page.goto('/pose_detection.html');
  await page.locator('#start-camera').click();
  await page.locator('#stop-camera').click();
  await page.evaluate(() => {
    window.trackStopped = false;
    window.resolveCamera({
      getTracks: () => [
        {
          stop: () => {
            window.trackStopped = true;
          },
        },
      ],
    });
  });
  await expect.poll(() => page.evaluate(() => window.trackStopped)).toBe(true);
  await expect(page.locator('#start-camera')).toBeEnabled();
});

// Real model loading/inference with synthetic frames; never uses a physical camera.
for (const route of ['face_recognition.html', 'hand_gestures.html', 'pose_detection.html']) {
  test(`${route}: real worker/model starts, processes frames and stops`, async ({ page }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, 0, 640, 480);
        const stream = canvas.captureStream(10);
        window.testStream = stream;
        window.frameTimer = setInterval(() => ctx.fillRect(0, 0, 640, 480), 100);
        return stream;
      };
    });
    await page.goto('/' + route);
    await page.locator('#start-camera').click();
    await expect(page.locator('#camera-status')).toContainText('Το πείραμα λειτουργεί', {
      timeout: 65000,
    });
    await expect(page.locator('#detection-summary')).not.toBeEmpty({ timeout: 15000 });
    await page.locator('#stop-camera').click();
    expect(
      await page.evaluate(() =>
        window.testStream.getTracks().every((track) => track.readyState === 'ended'),
      ),
    ).toBe(true);
    await expect(page.locator('#start-camera')).toBeEnabled();
    await page.evaluate(() => clearInterval(window.frameTimer));
  });
}
