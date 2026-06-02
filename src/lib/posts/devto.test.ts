import { describe, it, expect } from 'vitest';
import { mapDevtoArticle, type DevtoArticle } from './devto';

const fakeRenderer = { render: async (md: string) => `<p>${md}</p><script>x</script>` };

const article = {
  id: 1, title: 'Hello dev.to', slug: 'hello-devto',
  url: 'https://dev.to/u/hello-devto', canonical_url: 'https://dev.to/u/hello-devto',
  description: 'A summary', published_at: '2026-05-01T10:00:00Z',
  tag_list: ['ai', 'systems'], cover_image: 'https://img/cover.png',
  reading_time_minutes: 7, body_markdown: 'remote body',
};

describe('mapDevtoArticle', () => {
  it('normalizes a dev.to article and sanitizes the body', async () => {
    const p = await mapDevtoArticle(article as DevtoArticle, fakeRenderer);
    expect(p.source).toBe('devto');
    expect(p.tag).toBe('ai');
    expect(p.read).toBe('7 min');
    expect(p.displayDate).toBe('May 2026');
    expect(p.canonical).toBe('https://dev.to/u/hello-devto');
    expect(p.links).toEqual([{ label: 'dev.to', url: 'https://dev.to/u/hello-devto' }]);
    expect(p.html).toContain('remote body');
    expect(p.html).not.toContain('<script');
  });
});
