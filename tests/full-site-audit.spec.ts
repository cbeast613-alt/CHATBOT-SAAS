import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE = 'https://chatbot-saas-plum.vercel.app';

// ─── NAVIGATION & LINKS ───────────────────────────────────────────────────────

test('navbar: all links resolve without 404', async ({ page }) => {
  await page.goto(BASE);
  const navLinks = await page.locator('nav a').all();
  for (const link of navLinks) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#')) continue;
    const url = href.startsWith('http') ? href : BASE + href;
    const res = await page.request.get(url);
    expect(res.status(), `NAV LINK BROKEN: ${url}`).toBe(200);
  }
});

test('footer: all links resolve without 404', async ({ page }) => {
  await page.goto(BASE);
  const footerLinks = await page.locator('footer a').all();
  for (const link of footerLinks) {
    const href = await link.getAttribute('href');
    if (!href || href === '#' || href.startsWith('mailto') || href.startsWith('tel')) {
      if (href === '#') {
        throw new Error(`BROKEN FOOTER LINK: href="#" found — text: "${await link.textContent()}"`);
      }
      continue;
    }
    const url = href.startsWith('http') ? href : BASE + href;
    const res = await page.request.get(url);
    expect(res.status(), `FOOTER LINK BROKEN: ${url}`).toBe(200);
  }
});

test('every internal href="#something" has a matching id on the page', async ({ page }) => {
  await page.goto(BASE);
  const anchorLinks = await page.locator('a[href^="#"]').all();
  for (const link of anchorLinks) {
    const href = await link.getAttribute('href');
    if (!href || href === '#') continue;
    const id = href.slice(1);
    const target = page.locator(`#${id}`);
    const count = await target.count();
    expect(count, `ANCHOR BROKEN: href="${href}" — no element with id="${id}" exists`).toBeGreaterThan(0);
  }
});

// ─── LEGAL PAGES ─────────────────────────────────────────────────────────────

test('legal pages: /privacy loads with real content', async ({ page }) => {
  const res = await page.goto(`${BASE}/privacy`);
  expect(res?.status(), '/privacy returned 404').toBe(200);
  const body = await page.textContent('body');
  expect(body?.length, '/privacy page has no content').toBeGreaterThan(500);
  expect(body, '/privacy missing "data" keyword').toContain('data');
});

test('legal pages: /terms loads with refund policy', async ({ page }) => {
  const res = await page.goto(`${BASE}/terms`);
  expect(res?.status(), '/terms returned 404').toBe(200);
  const body = await page.textContent('body');
  expect(body?.length, '/terms page has no content').toBeGreaterThan(500);
  const hasRefund = body?.toLowerCase().includes('refund') || body?.toLowerCase().includes('cancel');
  expect(hasRefund, '/terms missing refund or cancellation policy').toBe(true);
});

test('legal pages: /gdpr loads with real content', async ({ page }) => {
  const res = await page.goto(`${BASE}/gdpr`);
  expect(res?.status(), '/gdpr returned 404').toBe(200);
  const body = await page.textContent('body');
  expect(body?.length, '/gdpr page has no content').toBeGreaterThan(300);
});

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────

test('contact page: /contact loads with a form', async ({ page }) => {
  const res = await page.goto(`${BASE}/contact`);
  expect(res?.status(), '/contact returned 404').toBe(200);
  const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  const emailField = page.locator('input[type="email"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();
  await expect(nameField, 'Contact form missing name field').toBeVisible();
  await expect(emailField, 'Contact form missing email field').toBeVisible();
  await expect(submitBtn, 'Contact form missing submit button').toBeVisible();
});

test('contact form: shows error on empty submit', async ({ page }) => {
  await page.goto(`${BASE}/contact`);
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(500);
  const body = await page.textContent('body');
  const hasError = body?.toLowerCase().includes('required') ||
                   body?.toLowerCase().includes('error') ||
                   body?.toLowerCase().includes('invalid') ||
                   body?.toLowerCase().includes('please');
  expect(hasError, 'Contact form does not show any validation error on empty submit').toBe(true);
});

test('contact form: shows error on invalid email', async ({ page }) => {
  await page.goto(`${BASE}/contact`);
  const emailField = page.locator('input[type="email"]').first();
  await emailField.fill('notanemail');
  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForTimeout(500);
  const isInvalid = await emailField.evaluate((el: HTMLInputElement) => !el.validity.valid);
  expect(isInvalid, 'Email field accepts invalid email format').toBe(true);
});

// ─── AUTH PAGE ─────────────────────────────────────────────────────────────────

test('auth page: forgot password link exists', async ({ page }) => {
  await page.goto(`${BASE}/auth`);
  const forgotLink = page.locator('a[href*="forgot"], a:has-text("forgot"), a:has-text("Forgot")').first();
  await expect(forgotLink, 'No forgot password link found on /auth').toBeVisible();
});

test('auth page: back to home link exists', async ({ page }) => {
  await page.goto(`${BASE}/auth`);
  const backLink = page.locator('a[href="/"], a:has-text("home"), a:has-text("Home"), a:has-text("Back")').first();
  await expect(backLink, 'No back-to-home link on /auth page').toBeVisible();
});

test('auth page: login form shows error on empty submit', async ({ page }) => {
  await page.goto(`${BASE}/auth`);
  const loginBtn = page.locator('button:has-text("Log in"), button:has-text("Login"), button[type="submit"]').first();
  await loginBtn.click();
  await page.waitForTimeout(800);
  const body = await page.textContent('body');
  const hasError = body?.toLowerCase().includes('required') ||
                   body?.toLowerCase().includes('error') ||
                   body?.toLowerCase().includes('invalid') ||
                   body?.toLowerCase().includes('please fill');
  expect(hasError, 'Login form accepts empty submit without showing an error').toBe(true);
});

test('forgot password page: loads and has email field', async ({ page }) => {
  const res = await page.goto(`${BASE}/auth/forgot-password`);
  expect(res?.status(), '/auth/forgot-password returned 404').toBe(200);
  const emailField = page.locator('input[type="email"]').first();
  await expect(emailField, 'Forgot password page missing email field').toBeVisible();
});

// ─── HOMEPAGE SECTIONS ────────────────────────────────────────────────────────

test('homepage: #faq section exists and FAQ nav link scrolls to it', async ({ page }) => {
  await page.goto(BASE);
  const faqSection = page.locator('#faq');
  await expect(faqSection, 'No element with id="faq" on homepage').toBeAttached();
  const faqNavLink = page.locator('nav a[href="#faq"]').first();
  await faqNavLink.click();
  await page.waitForTimeout(600);
  const isVisible = await faqSection.isVisible();
  expect(isVisible, 'FAQ section exists but is not visible after clicking FAQ nav link').toBe(true);
});

test('homepage: #demo section exists OR demo button is removed', async ({ page }) => {
  await page.goto(BASE);
  const demoBtn = page.locator('a[href="#demo"], button:has-text("demo"), a:has-text("demo")').first();
  const demoBtnExists = await demoBtn.count() > 0;
  if (demoBtnExists) {
    const demoSection = page.locator('#demo');
    const demoSectionExists = await demoSection.count() > 0;
    expect(demoSectionExists, 'Demo button exists but there is no #demo section on the page — broken anchor link').toBe(true);
  }
});

test('homepage: asterisk footnote visible below pricing', async ({ page }) => {
  await page.goto(BASE);
  const unlimitedText = page.locator('text=Unlimited Messages*').first();
  await expect(unlimitedText, '"Unlimited Messages*" text not found on pricing').toBeAttached();
  const footnote = page.locator('text=/\\*.*message|fair use|subject to/i').first();
  await expect(footnote, 'No footnote found explaining the * on Unlimited Messages').toBeAttached();
});

test('homepage: refund/cancellation notice visible on pricing section', async ({ page }) => {
  await page.goto(BASE);
  const refundText = page.locator('text=/refund|cancel anytime|money.back/i').first();
  await expect(refundText, 'No refund or cancellation notice visible on pricing page').toBeAttached();
});

test('homepage: platform badges are readable (not jammed together)', async ({ page }) => {
  await page.goto(BASE);
  const body = await page.textContent('body');
  const jammed = body?.includes('SHOPIFYWOOWORDPRESSWIX') || body?.includes('ShopifyWooWordPressWix');
  expect(jammed, 'Platform names are still jammed together without spaces').toBe(false);
});

test('footer: contact email link is visible', async ({ page }) => {
  await page.goto(BASE);
  const emailLink = page.locator('a[href^="mailto"]').first();
  await expect(emailLink, 'No mailto: link found in footer').toBeVisible();
  const href = await emailLink.getAttribute('href');
  expect(href, 'mailto link is empty or malformed').toMatch(/mailto:.+@.+\..+/);
});

test('footer: social media links exist and are not placeholder', async ({ page }) => {
  await page.goto(BASE);
  const socialLinks = await page.locator('footer a[href*="twitter"], footer a[href*="linkedin"], footer a[href*="instagram"], footer a[href*="x.com"]').all();
  expect(socialLinks.length, 'No social media links found in footer').toBeGreaterThan(0);
  for (const link of socialLinks) {
    const href = await link.getAttribute('href');
    const isPlaceholder = href?.includes('[your') || href?.includes('yourhandle') || href?.includes('yourusername');
    expect(isPlaceholder, `Social link is still a placeholder: ${href}`).toBe(false);
  }
});

// ─── SEO & META ───────────────────────────────────────────────────────────────

test('SEO: homepage has unique descriptive title', async ({ page }) => {
  await page.goto(BASE);
  const title = await page.title();
  expect(title.length, 'Homepage title is too short').toBeGreaterThan(20);
  expect(title, 'Homepage title is just "ChatBot SaaS" — needs to be more descriptive').not.toBe('ChatBot SaaS');
});

test('SEO: each page has a different title', async ({ page }) => {
  const pages = ['/', '/privacy', '/terms', '/contact', '/auth'];
  const titles: string[] = [];
  for (const path of pages) {
    try {
      await page.goto(BASE + path);
      titles.push(await page.title());
    } catch { titles.push(''); }
  }
  const uniqueTitles = new Set(titles.filter(Boolean));
  expect(uniqueTitles.size, `Only ${uniqueTitles.size} unique page titles for ${pages.length} pages — some pages share titles`).toBe(titles.filter(Boolean).length);
});

test('SEO: Open Graph tags present on homepage', async ({ page }) => {
  await page.goto(BASE);
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(ogTitle, 'og:title meta tag missing or empty').toBeTruthy();
  expect(ogDesc, 'og:description meta tag missing or empty').toBeTruthy();
  expect(ogImage, 'og:image meta tag missing — WhatsApp previews will be blank').toBeTruthy();
});

test('SEO: meta description is between 120–160 characters', async ({ page }) => {
  await page.goto(BASE);
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc, 'meta description is missing').toBeTruthy();
  expect(desc!.length, `meta description too short: "${desc}" (${desc?.length} chars)`).toBeGreaterThan(120);
  expect(desc!.length, `meta description too long: ${desc?.length} chars — Google truncates at 160`).toBeLessThan(165);
});

test('SEO: sitemap.xml returns valid XML', async ({ page }) => {
  const res = await page.request.get(`${BASE}/sitemap.xml`);
  expect(res.status(), '/sitemap.xml returned 404 — not created').toBe(200);
  const body = await res.text();
  expect(body, 'sitemap.xml is empty').toContain('<urlset');
  expect(body, 'sitemap.xml has no URLs').toContain('<url>');
});

// ─── CONSOLE ERRORS ──────────────────────────────────────────────────────────

test('no console errors on homepage', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(BASE);
  await page.waitForTimeout(2000);
  expect(errors, `Console errors found on homepage:\n${errors.join('\n')}`).toHaveLength(0);
});

test('no console errors on /auth page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(`${BASE}/auth`);
  await page.waitForTimeout(2000);
  expect(errors, `Console errors on /auth:\n${errors.join('\n')}`).toHaveLength(0);
});

test('no console errors on /contact page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(`${BASE}/contact`);
  await page.waitForTimeout(2000);
  expect(errors, `Console errors on /contact:\n${errors.join('\n')}`).toHaveLength(0);
});

// ─── MOBILE LAYOUT ────────────────────────────────────────────────────────────

test('mobile (iPhone SE 375px): no horizontal scroll on homepage', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE);
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyWidth, `Horizontal scroll on mobile: body is ${bodyWidth}px wide on 375px screen`).toBeLessThanOrEqual(375);
});

test('mobile: navbar is usable (hamburger menu or links visible)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE);
  const hamburger = page.locator('[aria-label*="menu" i], button:has-text("☰"), .hamburger, [data-testid="menu"]').first();
  const navLinks = page.locator('nav a');
  const hamburgerVisible = await hamburger.isVisible().catch(() => false);
  const navLinksVisible = await navLinks.first().isVisible().catch(() => false);
  expect(hamburgerVisible || navLinksVisible, 'On mobile (375px), neither hamburger menu nor nav links are visible').toBe(true);
});

test('mobile: all CTA buttons are at least 44px tall (touch target)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto(BASE);
  const buttons = await page.locator('a:has-text("Get Started"), a:has-text("Start Free Trial"), button[type="submit"]').all();
  for (const btn of buttons) {
    const box = await btn.boundingBox();
    if (!box) continue;
    expect(box.height, `Button "${await btn.textContent()}" is only ${box.height}px tall — too small for touch (min 44px)`).toBeGreaterThanOrEqual(44);
  }
});

// ─── ACCESSIBILITY ────────────────────────────────────────────────────────────

test('accessibility: no critical violations on homepage', async ({ page }) => {
  await page.goto(BASE);
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  const critical = results.violations.filter(v => v.impact === 'critical');
  expect(critical, `Accessibility violations:\n${critical.map(v => `${v.impact}: ${v.description} — ${v.nodes[0]?.html}`).join('\n')}`).toHaveLength(0);
});

test('accessibility: all images have alt text', async ({ page }) => {
  await page.goto(BASE);
  const imgsWithoutAlt = await page.locator('img:not([alt])').count();
  expect(imgsWithoutAlt, `${imgsWithoutAlt} images found with no alt attribute`).toBe(0);
});
