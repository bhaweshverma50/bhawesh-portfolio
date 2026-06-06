import { test, expect, type ConsoleMessage } from '@playwright/test';
import { SITE, SOCIALS } from '../config/site';

function watchErrors(page: import('@playwright/test').Page) {
  const errors: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

test('home renders with the right title and no console errors', async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto('/');
  await expect(page).toHaveTitle(SITE.title);
  await expect(page.locator('.hero h1')).toBeVisible();
  await expect(page.locator('.tweaks-fab')).toBeVisible();
  expect(errors, errors.join('\n')).toEqual([]);
});

test('routes update the document title', async ({ page }) => {
  await page.goto('/#/work');
  await expect(page.locator('.page-hero h1')).toHaveText('Work');
  await expect(page).toHaveTitle(`Work | ${SITE.firstName}`);

  await page.goto('/#/contact');
  await expect(page).toHaveTitle(`Contact | ${SITE.firstName}`);

  await page.goto('/#/project/validatyr');
  await expect(page.locator('.detail-title')).toHaveText('Validatyr');
  await expect(page).toHaveTitle(`Validatyr | ${SITE.firstName}`);
});

test('the Tweaks panel opens from the dial', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.twk-panel')).toHaveCount(0);
  await page.getByRole('button', { name: /open the tweaks panel/i }).click();
  await expect(page.locator('.twk-panel')).toBeVisible();
  await expect(page.locator('.twk-panel select, .twk-panel .twk-toggle').first()).toBeVisible();
});

test('contact email links use the configured mailto and the form gives feedback', async ({ page }) => {
  await page.goto('/#/contact');
  const sayHello = page.locator('.contact h2 a').first();
  await expect(sayHello).toHaveAttribute('href', `mailto:${SITE.email}`);

  await page.locator('#cf-message').fill('Loved the work, want to collaborate.');
  await page.getByRole('button', { name: /send message/i }).click();
  await expect(page.locator('.cform-status')).toContainText(/opening your email app/i);
});

test('configured social links render and open in a new tab', async ({ page }) => {
  await page.goto('/#/contact');
  const configured = SOCIALS.filter((s) => s.url);
  await expect(page.locator('.contact-links a')).toHaveCount(configured.length);
  const gh = page.locator('.contact-links a', { hasText: 'GitHub' });
  await expect(gh).toHaveAttribute('target', '_blank');
  await expect(gh).toHaveAttribute('href', /github\.com/);
});

test('a project detail page shows real content + links', async ({ page }) => {
  await page.goto('/#/project/beyond-bmi');
  await expect(page.locator('.detail-title')).toHaveText('BeyondBMI');
  // BeyondBMI has both a live demo and a repo configured
  await expect(page.getByRole('link', { name: /live demo/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /view source/i })).toBeVisible();
});

test('the Open Source section lists real repos linking to GitHub', async ({ page }) => {
  await page.goto('/#/work');
  const repos = page.locator('[data-screen-label="Open Source"] .repo');
  await expect(repos.first()).toBeVisible();
  await expect(repos).toHaveCount(6);
  await expect(page.locator('[data-screen-label="Open Source"] .repo', { hasText: 'storage-ai' })).toHaveAttribute(
    'href',
    /github\.com\/bhaweshverma50\/storage-ai/,
  );
});

test('the Writing listing renders posts', async ({ page }) => {
  await page.goto('/#/blog');
  await expect(page.locator('.writing .post').first()).toBeVisible();
});

test('a rich post renders highlighted code, cover, and cross-post links', async ({ page }) => {
  // Navigate to the known sample slug directly so assertions don't depend on
  // which post happens to sort first (a coverless/code-less post could break a
  // "click the first row" approach).
  await page.goto('/#/post/citations-or-it-didnt-happen');
  await expect(page.locator('.post-title')).toBeVisible();
  await expect(page.locator('.post-body pre.shiki')).toBeVisible();      // highlighted code
  await expect(page.locator('.post-cover img')).toBeVisible();           // cover image
  await expect(page.locator('.post-links a', { hasText: /linkedin/i })).toHaveAttribute('target', '_blank');
});

test('the Writing nav link appears once posts exist', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nav-links a', { hasText: 'Writing' })).toBeVisible();
});

test('an unknown route shows a 404', async ({ page }) => {
  await page.goto('/#/does-not-exist');
  await expect(page.locator('.page-hero h1')).toHaveText('Page not found');
});
