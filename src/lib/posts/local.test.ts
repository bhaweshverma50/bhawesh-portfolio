import { describe, it, expect } from 'vitest';
import { parseLocalPost } from './local';

const fakeRenderer = { render: async (md: string) => `<p>${md.trim()}</p>` };

const raw = `---
title: Designing a RAG pipeline
date: 2026-06-02
tag: Systems
summary: Receipts for retrieval.
cover: /posts/rag.svg
links:
  - { label: LinkedIn, url: https://linkedin.com/x }
---
Body text here.`;

describe('parseLocalPost', () => {
  it('maps frontmatter + body into a Post', async () => {
    const { post } = await parseLocalPost('designing-rag.md', raw, fakeRenderer);
    expect(post).toBeDefined();
    expect(post!.slug).toBe('designing-rag');
    expect(post!.title).toBe('Designing a RAG pipeline');
    // unquoted YAML `date: 2026-06-02` parses to a Date — must normalize to a
    // timezone-independent ISO day, NOT a locale-stamped Date string.
    expect(post!.date).toBe('2026-06-02');
    expect(post!.displayDate).toBe('Jun 2026');
    expect(post!.source).toBe('local');
    expect(post!.cover).toBe('/posts/rag.svg');
    expect(post!.links).toEqual([{ label: 'LinkedIn', url: 'https://linkedin.com/x' }]);
    expect(post!.html).toContain('Body text here.');
  });
  it('skips drafts', async () => {
    const { post, draft } = await parseLocalPost('d.md', '---\ntitle: x\ndraft: true\n---\nhi', fakeRenderer);
    expect(draft).toBe(true);
    expect(post).toBeUndefined();
  });
});
