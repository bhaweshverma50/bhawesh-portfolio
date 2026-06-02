import type { Post } from '../../types';

const rank = (p: Post): number => (p.source === 'local' ? 0 : 1);
const canonKey = (p: Post): string => (p.canonical ? p.canonical.replace(/\/$/, '') : `slug:${p.slug}`);

/** Flatten source lists, dedupe (local wins on canonical/slug clash), sort by date desc. */
export function mergePosts(lists: Post[][]): { posts: Record<string, Post>; order: string[] } {
  const byCanon = new Map<string, Post>();
  for (const p of lists.flat()) {
    const k = canonKey(p);
    const cur = byCanon.get(k);
    if (!cur || rank(p) < rank(cur)) byCanon.set(k, p);
  }
  const bySlug = new Map<string, Post>();
  for (const p of byCanon.values()) {
    const cur = bySlug.get(p.slug);
    if (!cur || rank(p) < rank(cur)) bySlug.set(p.slug, p);
  }
  const sorted = [...bySlug.values()].sort(
    (a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug),
  );
  const posts: Record<string, Post> = {};
  for (const p of sorted) posts[p.slug] = p;
  return { posts, order: sorted.map((p) => p.slug) };
}
