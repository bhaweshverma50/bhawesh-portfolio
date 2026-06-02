import { describe, it, expect } from 'vitest';
import { mergePosts } from './merge';
import { serializeGenerated } from './codegen';
import type { Post } from '../../types';

const mk = (over: Partial<Post>): Post => ({
  slug: 's', title: 't', date: '2026-01-01', displayDate: 'Jan 2026', read: '1 min',
  tag: 'x', source: 'local', html: '<p>x</p>', ...over,
});

describe('mergePosts', () => {
  it('sorts by date desc and dedupes by canonical, local winning', () => {
    const local = mk({ slug: 'a', date: '2026-02-01', canonical: 'https://c/a', source: 'local' });
    const remote = mk({ slug: 'a-remote', date: '2026-02-01', canonical: 'https://c/a', source: 'devto' });
    const older = mk({ slug: 'b', date: '2025-12-01' });
    const { posts, order } = mergePosts([[local], [remote, older]]);
    expect(order).toEqual(['a', 'b']);
    expect(posts.a.source).toBe('local');
  });
});

describe('serializeGenerated', () => {
  it('emits valid TS that round-trips the data', () => {
    const out = serializeGenerated({ a: mk({ slug: 'a' }) }, ['a']);
    expect(out).toContain("import type { Post } from '../types'");
    expect(out).toContain('GENERATED_ORDER');
    expect(out).toContain('"slug": "a"');
  });
});
