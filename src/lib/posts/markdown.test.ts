import { describe, it, expect, beforeAll } from 'vitest';
import { createRenderer, type Renderer } from './markdown';

let r: Renderer;
beforeAll(async () => { r = await createRenderer(); });

describe('markdown renderer', () => {
  it('highlights fenced code with shiki inline styles', async () => {
    const html = await r.render('```ts\nconst x: number = 1;\n```');
    expect(html).toContain('class="shiki');
    expect(html).toMatch(/style="color:/);
  });
  it('renders headings and inline code', async () => {
    const html = await r.render('## Title\n\nuse `npm` here');
    expect(html).toContain('<h2');
    expect(html).toContain('<code>npm</code>');
  });
  it('opens external links safely', async () => {
    const html = await r.render('[x](https://example.com)');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });
  it('falls back to plaintext for unknown languages', async () => {
    const html = await r.render('```nonsense-lang\nhello\n```');
    expect(html).toContain('class="shiki');
  });
});
