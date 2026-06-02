import matter from 'gray-matter';
import type { Post, PostLink } from '../../types';
import { readingTime } from './readingTime';
import type { Renderer } from './markdown';

export function displayDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export interface ParsedLocal {
  post?: Post;
  draft: boolean;
}

/** Parse one local markdown file (trusted: NOT sanitized). */
export async function parseLocalPost(filename: string, raw: string, renderer: Renderer): Promise<ParsedLocal> {
  const { data, content } = matter(raw);
  if (data.draft) return { draft: true };

  const slug = filename.replace(/\.md$/, '');
  const date = String(data.date ?? '');
  const post: Post = {
    slug,
    title: String(data.title ?? slug),
    date,
    displayDate: displayDate(date),
    read: readingTime(content),
    tag: String(data.tag ?? 'Note'),
    summary: data.summary ? String(data.summary) : undefined,
    cover: data.cover ? String(data.cover) : undefined,
    links: Array.isArray(data.links) ? (data.links as PostLink[]) : undefined,
    source: 'local',
    html: await renderer.render(content),
  };
  return { post, draft: false };
}
