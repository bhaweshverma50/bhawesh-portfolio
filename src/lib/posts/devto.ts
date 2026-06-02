import type { Post } from '../../types';
import { readingTime } from './readingTime';
import { displayDate } from './local';
import { sanitizeRemote } from './sanitize';
import type { Renderer } from './markdown';

export interface DevtoArticle {
  id: number;
  title: string;
  slug: string;
  url: string;
  canonical_url: string | null;
  description: string;
  published_at: string;
  tag_list: string[];
  cover_image: string | null;
  reading_time_minutes: number;
  body_markdown: string;
}

const BASE = 'https://dev.to/api';
const ACCEPT = 'application/vnd.forem.api-v1+json';
const PER_PAGE = 100;
const MAX_PAGES = 50; // safety cap (~5000 posts) so a misbehaving API can't loop forever

/** Pure: normalize one dev.to article into a Post (body sanitized — remote/untrusted). */
export async function mapDevtoArticle(a: DevtoArticle, renderer: Renderer): Promise<Post> {
  return {
    slug: a.slug,
    title: a.title,
    date: a.published_at,
    displayDate: displayDate(a.published_at),
    read: a.reading_time_minutes ? `${a.reading_time_minutes} min` : readingTime(a.body_markdown ?? ''),
    tag: a.tag_list?.[0] ?? 'Note',
    summary: a.description || undefined,
    cover: a.cover_image || undefined,
    links: [{ label: 'dev.to', url: a.url }],
    source: 'devto',
    canonical: a.canonical_url || a.url,
    html: sanitizeRemote(await renderer.render(a.body_markdown ?? '')),
  };
}

async function getJson<T>(url: string, retries = 2): Promise<T> {
  const res = await fetch(url, { headers: { Accept: ACCEPT } });
  if (res.status === 429 && retries > 0) {
    const wait = Number(res.headers.get('retry-after')) * 1000 || 1500;
    await new Promise((r) => setTimeout(r, wait));
    return getJson<T>(url, retries - 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json() as Promise<T>;
}

/** Fetch all published dev.to posts for a username (list omits body → fetch each by id). */
export async function fetchDevtoPosts(username: string, renderer: Renderer): Promise<Post[]> {
  const summaries: { id: number }[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await getJson<{ id: number }[]>(
      `${BASE}/articles?username=${encodeURIComponent(username)}&per_page=${PER_PAGE}&page=${page}`,
    );
    summaries.push(...batch);
    if (batch.length < PER_PAGE) break;
  }
  const out: Post[] = [];
  for (const s of summaries) {
    const full = await getJson<DevtoArticle>(`${BASE}/articles/${s.id}`);
    out.push(await mapDevtoArticle(full, renderer));
  }
  return out;
}
