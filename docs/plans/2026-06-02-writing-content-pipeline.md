# Writing / Content Pipeline — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the empty `posts.ts` stub with a real writing system — canonical markdown-in-repo authoring (rich: headings, code with syntax highlighting, images) plus build-time auto-fetch from configured platforms (dev.to first), merged into one committed, type-checked generated module that lights up the existing `/blog` + `/post/:slug` pages and the nav link automatically.

**Architecture:** A pure, unit-tested pipeline (`src/lib/posts/*`) turns local `.md` files and remote articles into a normalized `Post[]`. A `tsx`-run build script (`scripts/build-posts.ts`) orchestrates fs + fetch, then code-generates `src/data/posts.generated.ts` (committed, so builds/tests are offline-safe). The app only ever imports the generated data — the heavyweight markdown/highlighter deps stay build-time (`devDependencies`), never in the browser bundle.

**Tech Stack:** Vite 5 + React 18 + TS 5.6 (existing). New build-time deps: `marked@^18`, `marked-shiki@^1.2.1`, `shiki@^4`, `gray-matter@^4`, `sanitize-html@^2` (+ `@types/sanitize-html`), `tsx@^4`. Tests: Vitest (existing, jsdom) + Playwright E2E (existing).

---

## Environment preamble (this machine)

`node`/`npm`/`npx` are **not on PATH** by default in this shell, and `ls`/`cat` are aliased to `eza`/`bat` (not installed). At the start of every working shell:

```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"   # node v22.14.0 + npm + npx
node -v && npm -v                                            # verify: v22.14.0 / 10.x
```

After this, the normal `npm run …` scripts work. Use `/bin/ls` instead of `ls`, and the Read tool instead of `cat`. The repo is **not yet a git repo** — Task 1 initializes it so the per-task commits in this plan work.

## Key facts the implementation must respect (from API verification)

- **dev.to**: `GET /api/articles?username=…` is paginated and **omits the body**. Must fetch each article via `GET /api/articles/{id}` to get `body_markdown`. `tag_list` is an **array**, `tags` is a CSV string. Public reads need no key; send `Accept: application/vnd.forem.api-v1+json`. Serialize requests (429-safe).
- **shiki@4** (`createHighlighter({themes,langs})`, then sync `highlighter.codeToHtml`): emits **inline-styled** `<pre class="shiki github-dark" style="…"><code><span class="line"><span style="color:…">`. **No theme CSS needed.** ESM-only. Preload langs or unknown langs throw — guard with a fallback to `text`.
- **marked@18** + **marked-shiki@1.2.1**: ESM-only. marked-shiki registers an **async** code renderer → `marked.parse()` returns a **Promise you must `await`**. `headerIds`/`mangle`/`sanitize` were removed in v8; renderer methods take a **single token object** (`link({href,title,tokens})`). marked does **not** sanitize.
- **gray-matter@4**: CommonJS → in ESM use **default import** `import matter from 'gray-matter'` (never `import *`). Returns `{ data, content }`; `data` is `{}` when no frontmatter.
- **sanitize-html@2**: CommonJS → default import. **`allowedStyles` must list `color`/`background-color`** or shiki's inline colors get stripped. Relative `/posts/…` URLs are preserved automatically. Never allow `script`/`style` *tags*.

## Design decisions (locked)

- **Canonical = local markdown.** The user has **no dev.to/Hashnode/Medium account yet**, so `SOURCES` ships with the dev.to entry **commented out** (a TODO with the handle to fill in). The sample local post is what makes the section go live today. LinkedIn = `links:` cross-post buttons only (no fetch — no public read API).
- **Generated file is committed** and deterministically serialized (sorted by `date` desc, tie-break `slug`) so diffs are clean and offline builds/tests work.
- **Build hooks:** `predev` → local-only (fast, offline); `prebuild` → full (local + remote). **No `pretest` fetch** (tests use the committed generated file).
- Remote fetch failures are caught and logged, never fail the build.

---

## Task 1: Initialize git + install dependencies

**Files:**
- Create: `.gitignore` (if absent)
- Modify: `package.json` (deps added by npm)

**Step 1 — Init git and a sane ignore (run from `portfolio-react/`):**
```bash
export PATH="$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"
git init
```
Create `.gitignore` (Write tool) if it doesn't already exist:
```gitignore
node_modules
dist
*.local
.DS_Store
playwright-report
test-results
```
> Note: do **not** ignore `src/data/posts.generated.ts`, `content/`, or `public/posts/` — those are committed.

**Step 2 — Install build-time deps:**
```bash
npm install -D marked@^18 marked-shiki@^1.2.1 shiki@^4 gray-matter@^4 sanitize-html@^2 @types/sanitize-html@^2 tsx@^4
```
Expected: added to `devDependencies`, no peer-dep errors (marked-shiki peers: `marked>=7`, `shiki>=1`).

**Step 3 — Verify the toolchain still builds clean:**
```bash
npm run typecheck
```
Expected: exits 0 (no app code changed yet).

**Step 4 — Commit:**
```bash
git add -A
git commit -m "chore: init git, add content-pipeline build deps"
```

---

## Task 2: Extend the `Post` type and render existing pages against it

This changes `Post` (`body: string[]` → `html: string`, plus new fields) and updates the two consumers so the app keeps compiling. `POSTS` is currently `{}`, so the empty record stays valid.

**Files:**
- Modify: `src/types.ts:36-43`
- Modify: `src/pages/PostDetail.tsx`
- Modify: `src/pages/Blog.tsx:22-33`

**Step 1 — Replace the `Post` interface** (`src/types.ts`):
```ts
export interface PostLink {
  label: string;
  url: string;
}

export interface Post {
  slug: string;
  title: string;
  /** ISO date, used for sorting (e.g. "2026-06-02") */
  date: string;
  /** human label shown in the UI (e.g. "Jun 2026") */
  displayDate: string;
  /** reading estimate, e.g. "6 min" */
  read: string;
  tag: string;
  /** optional one-line dek on the listing */
  summary?: string;
  /** optional cover image URL (local "/posts/…" or absolute) */
  cover?: string;
  /** optional cross-post buttons (LinkedIn, dev.to, …) */
  links?: PostLink[];
  /** where this post came from */
  source: 'local' | 'devto' | 'hashnode' | 'medium';
  /** canonical URL (used to dedupe cross-posted pieces) */
  canonical?: string;
  /** prerendered, sanitized HTML body */
  html: string;
}
```

**Step 2 — Rewrite `src/pages/PostDetail.tsx`** (renders `html`, optional cover `<img>`, cross-post links; drops the `Placeholder` import):
```tsx
import { Link, useParams } from 'react-router-dom';
import { POSTS } from '../data/posts';
import { TitleUnderline } from '../components/TitleUnderline';
import { NotFound } from './NotFound';

export function PostDetail() {
  const { slug } = useParams();
  const p = slug ? POSTS[slug] : undefined;
  if (!p) return <NotFound label="Post not found" />;

  return (
    <article className="post-detail" data-screen-label={`Post · ${p.title}`}>
      <div className="wrap narrow">
        <Link className="back" to="/blog">
          ← All writing
        </Link>
        <header className="post-head">
          <span className="eyebrow">
            {p.tag} · {p.read} read
          </span>
          <h1 className="post-title reveal">{p.title}</h1>
          <TitleUnderline />
          <div className="post-byline reveal reveal-d1">Bhawesh · {p.displayDate}</div>
        </header>
        {p.cover && (
          <div className="post-cover reveal reveal-d1">
            <img src={p.cover} alt={`Cover for “${p.title}”`} loading="lazy" />
          </div>
        )}
        <div className="post-body reveal" dangerouslySetInnerHTML={{ __html: p.html }} />
        {p.links && p.links.length > 0 && (
          <div className="post-links reveal">
            {p.links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
        <Link className="back big" to="/blog">
          ← Back to writing
        </Link>
      </div>
    </article>
  );
}
```

**Step 3 — Update the listing in `src/pages/Blog.tsx`** (use `displayDate`, add optional summary):
```tsx
<Link className="post" to={`/post/${p.slug}`} key={p.slug}>
  <span className="pdate">
    {p.displayDate} · {p.tag}
  </span>
  <span className="ptitle">
    {p.title}
    {p.summary && <span className="psum">{p.summary}</span>}
  </span>
  <span className="pread">{p.read} →</span>
</Link>
```

**Step 4 — Typecheck:**
```bash
npm run typecheck
```
Expected: exits 0 (`POSTS = {}` still satisfies `Record<string, Post>`).

**Step 5 — Commit:**
```bash
git add -A && git commit -m "feat(types): rich Post model (html body, cover, links, source)"
```

---

## Task 3: Reading-time utility (TDD)

**Files:**
- Create: `src/lib/posts/readingTime.ts`
- Test: `src/lib/posts/readingTime.test.ts`

**Step 1 — Failing test:**
```ts
import { describe, it, expect } from 'vitest';
import { readingTime } from './readingTime';

describe('readingTime', () => {
  it('floors at 1 minute for short/empty input', () => {
    expect(readingTime('')).toBe('1 min');
    expect(readingTime('a few words here')).toBe('1 min');
  });
  it('estimates ~200 wpm', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(words)).toBe('2 min');
  });
  it('ignores fenced code and image markup', () => {
    const md = '```ts\n' + Array.from({ length: 400 }, () => 'x').join('\n') + '\n```\nhello world';
    expect(readingTime(md)).toBe('1 min');
  });
});
```

**Step 2 — Run, expect FAIL:** `npx vitest run src/lib/posts/readingTime.test.ts` → "Cannot find module './readingTime'".

**Step 3 — Implement:**
```ts
const WORDS_PER_MIN = 200;

/** Rough reading-time estimate from markdown, ignoring code fences + image syntax. */
export function readingTime(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / WORDS_PER_MIN));
  return `${mins} min`;
}
```

**Step 4 — Run, expect PASS.** **Step 5 — Commit:** `feat(posts): reading-time util`.

---

## Task 4: Markdown renderer — marked + shiki (TDD)

**Files:**
- Create: `src/lib/posts/markdown.ts`
- Test: `src/lib/posts/markdown.test.ts`

**Step 1 — Failing test** (renderer is async; one shared instance):
```ts
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
```

**Step 2 — Run, expect FAIL** (module missing).

**Step 3 — Implement:**
```ts
import { Marked } from 'marked';
import markedShiki from 'marked-shiki';
import { createHighlighter, type Highlighter } from 'shiki';

const THEME = 'github-dark';
const LANGS = [
  'ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'sh', 'html', 'css',
  'python', 'go', 'rust', 'sql', 'yaml', 'md', 'diff', 'swift', 'dart',
];

export interface Renderer {
  render(markdown: string): Promise<string>;
}

/** Build a reusable markdown→HTML renderer. shiki highlights at build time
 *  (inline styles, no client JS). Create ONCE and reuse across files. */
export async function createRenderer(): Promise<Renderer> {
  const highlighter: Highlighter = await createHighlighter({ themes: [THEME], langs: LANGS });
  const loaded = new Set(highlighter.getLoadedLanguages());

  const marked = new Marked()
    .use({
      gfm: true,
      renderer: {
        link(this: { parser: { parseInline: (t: unknown) => string } }, { href, title, tokens }) {
          const text = this.parser.parseInline(tokens);
          const t = title ? ` title="${title}"` : '';
          const external = /^https?:\/\//i.test(href);
          const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${href}"${t}${attrs}>${text}</a>`;
        },
      },
    })
    .use(
      markedShiki({
        highlight(code: string, lang: string) {
          const language = lang && loaded.has(lang) ? lang : 'text';
          return highlighter.codeToHtml(code, { lang: language, theme: THEME });
        },
      }),
    );

  return { render: (md: string) => marked.parse(md) as Promise<string> };
}
```
> If `getLoadedLanguages()` types complain, `loaded` membership is just a guard; `'text'` is always valid in shiki.

**Step 4 — Run, expect PASS** (first run downloads nothing — grammars ship with shiki; may take ~1–2s).

**Step 5 — Commit:** `feat(posts): marked+shiki markdown renderer`.

---

## Task 5: Remote HTML sanitizer (TDD)

**Files:**
- Create: `src/lib/posts/sanitize.ts`
- Test: `src/lib/posts/sanitize.test.ts`

**Step 1 — Failing test:**
```ts
import { describe, it, expect } from 'vitest';
import { sanitizeRemote } from './sanitize';

describe('sanitizeRemote', () => {
  it('keeps shiki inline color styles', () => {
    const out = sanitizeRemote('<pre class="shiki" style="background-color:#24292e"><code><span style="color:#F97583">const</span></code></pre>');
    expect(out).toContain('style="color:#F97583"');
  });
  it('strips script tags', () => {
    expect(sanitizeRemote('<p>ok</p><script>alert(1)</script>')).not.toContain('<script');
  });
  it('preserves relative image paths and adds rel to external links', () => {
    const out = sanitizeRemote('<img src="/posts/x.svg"><a href="https://e.com">e</a>');
    expect(out).toContain('src="/posts/x.svg"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });
});
```

**Step 2 — Run, expect FAIL.**

**Step 3 — Implement** (verified config):
```ts
import sanitizeHtml from 'sanitize-html';

const HEX_RGB_VAR = [/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, /^rgba?\(/, /^var\(--/];

/** Sanitize HTML produced by marked+shiki for REMOTE (untrusted) markdown. */
export function sanitizeRemote(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'strong', 'em', 'b', 'i', 's', 'del', 'code',
      'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'img',
      'pre', 'span', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      span: ['style', 'class'],
      pre: ['style', 'class', 'tabindex'],
      code: ['style', 'class'],
      '*': ['class'],
    },
    allowedStyles: {
      '*': {
        color: HEX_RGB_VAR,
        'background-color': HEX_RGB_VAR,
        'font-style': [/^italic$/, /^normal$/],
        'font-weight': [/^bold$/, /^\d{3}$/, /^normal$/],
        'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { a: ['http', 'https', 'mailto', 'tel'], img: ['http', 'https'] },
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '');
        return {
          tagName,
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' } : attribs,
        };
      },
    },
  });
}
```

**Step 4 — Run, expect PASS.** **Step 5 — Commit:** `feat(posts): remote HTML sanitizer`.

---

## Task 6: Local markdown parser (TDD)

**Files:**
- Create: `src/lib/posts/local.ts`
- Test: `src/lib/posts/local.test.ts`

**Step 1 — Failing test** (uses a fake renderer so the test is fast/deterministic):
```ts
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
```

**Step 2 — Run, expect FAIL.**

**Step 3 — Implement:**
```ts
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
```

**Step 4 — Run, expect PASS.** **Step 5 — Commit:** `feat(posts): local markdown parser`.

---

## Task 7: dev.to adapter (TDD on the pure mapper)

**Files:**
- Create: `src/lib/posts/devto.ts`
- Test: `src/lib/posts/devto.test.ts`

**Step 1 — Failing test** (test the pure mapper; the network fetch is covered by the integration run):
```ts
import { describe, it, expect } from 'vitest';
import { mapDevtoArticle } from './devto';

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
    const p = await mapDevtoArticle(article, fakeRenderer);
    expect(p.source).toBe('devto');
    expect(p.tag).toBe('ai');
    expect(p.read).toBe('7 min');
    expect(p.displayDate).toBe('May 2026');
    expect(p.canonical).toBe('https://dev.to/u/hello-devto');
    expect(p.links).toEqual([{ label: 'dev.to', url: 'https://dev.to/u/hello-devto' }]);
    expect(p.html).toContain('remote body');
    expect(p.html).not.toContain('<script'); // sanitized
  });
});
```

**Step 2 — Run, expect FAIL.**

**Step 3 — Implement:**
```ts
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

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: ACCEPT } });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json() as Promise<T>;
}

/** Fetch all published dev.to posts for a username (list omits body → fetch each by id). */
export async function fetchDevtoPosts(username: string, renderer: Renderer): Promise<Post[]> {
  const summaries: { id: number }[] = [];
  for (let page = 1; ; page++) {
    const batch = await getJson<{ id: number }[]>(
      `${BASE}/articles?username=${encodeURIComponent(username)}&per_page=100&page=${page}`,
    );
    summaries.push(...batch);
    if (batch.length < 100) break;
  }
  const out: Post[] = [];
  for (const s of summaries) {
    const full = await getJson<DevtoArticle>(`${BASE}/articles/${s.id}`);
    out.push(await mapDevtoArticle(full, renderer));
  }
  return out;
}
```

**Step 4 — Run, expect PASS.** **Step 5 — Commit:** `feat(posts): dev.to adapter`.

---

## Task 8: Merge + dedupe + deterministic codegen (TDD)

**Files:**
- Create: `src/lib/posts/merge.ts`
- Create: `src/lib/posts/codegen.ts`
- Test: `src/lib/posts/merge.test.ts`

**Step 1 — Failing test:**
```ts
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
    expect(order).toEqual(['a', 'b']);      // remote 'a' deduped out, sorted desc
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
```

**Step 2 — Run, expect FAIL.**

**Step 3 — Implement `merge.ts`:**
```ts
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
```

**Step 4 — Implement `codegen.ts`** (JSON.stringify → safe, escaped TS; no template literals so no backtick issues):
```ts
import type { Post } from '../../types';

/** Serialize merged posts into a committed, type-checked TS module. */
export function serializeGenerated(posts: Record<string, Post>, order: string[]): string {
  return (
    `// AUTO-GENERATED by scripts/build-posts.ts — do not edit by hand.\n` +
    `import type { Post } from '../types';\n\n` +
    `export const GENERATED_POSTS: Record<string, Post> = ${JSON.stringify(posts, null, 2)};\n\n` +
    `export const GENERATED_ORDER: string[] = ${JSON.stringify(order, null, 2)};\n`
  );
}
```

**Step 5 — Run, expect PASS.** **Step 6 — Commit:** `feat(posts): merge/dedupe + codegen`.

---

## Task 9: Sources config

**Files:**
- Create: `src/data/sources.ts`

**Step 1 — Implement** (dev.to commented out until the user has an account):
```ts
/* Auto-fetch sources for the writing section. The portfolio is the canonical
   home; these mirror posts you publish elsewhere. Uncomment + set your handle
   once you start publishing. LinkedIn has no public read API — use a post's
   `links:` frontmatter to add an "Also on LinkedIn ↗" button instead. */

export type Source =
  | { type: 'devto'; user: string }
  | { type: 'hashnode'; host: string }
  | { type: 'medium'; user: string };

export const SOURCES: Source[] = [
  // { type: 'devto', user: 'your-devto-username' },
  // { type: 'hashnode', host: 'yourblog.hashnode.dev' },  // adapter: TODO
  // { type: 'medium', user: 'yourhandle' },               // adapter: TODO (RSS, build-time)
];
```

**Step 2 — Typecheck + Commit:** `npm run typecheck` → 0; `feat(posts): sources config`.

---

## Task 10: Build script (orchestrator) + npm wiring

**Files:**
- Create: `scripts/build-posts.ts`
- Modify: `package.json` (scripts)

**Step 1 — Implement `scripts/build-posts.ts`** (run via `tsx`; imports the shared TS pipeline):
```ts
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRenderer } from '../src/lib/posts/markdown';
import { parseLocalPost } from '../src/lib/posts/local';
import { fetchDevtoPosts } from '../src/lib/posts/devto';
import { mergePosts } from '../src/lib/posts/merge';
import { serializeGenerated } from '../src/lib/posts/codegen';
import { SOURCES } from '../src/data/sources';
import type { Post } from '../src/types';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = join(root, 'content/posts');
const OUT = join(root, 'src/data/posts.generated.ts');
const localOnly = process.argv.includes('--local-only');

async function main() {
  const renderer = await createRenderer();
  const lists: Post[][] = [];

  // Local markdown (canonical, trusted)
  const local: Post[] = [];
  if (existsSync(POSTS_DIR)) {
    const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));
    for (const f of files) {
      const { post } = await parseLocalPost(f, await readFile(join(POSTS_DIR, f), 'utf8'), renderer);
      if (post) local.push(post);
    }
  }
  lists.push(local);
  console.log(`[posts] local: ${local.length}`);

  // Remote sources (best-effort — never fail the build)
  if (!localOnly) {
    for (const s of SOURCES) {
      try {
        if (s.type === 'devto') {
          const r = await fetchDevtoPosts(s.user, renderer);
          lists.push(r);
          console.log(`[posts] devto(${s.user}): ${r.length}`);
        }
        // hashnode / medium adapters: TODO
      } catch (err) {
        console.warn(`[posts] ${s.type} fetch failed — skipping:`, (err as Error).message);
      }
    }
  }

  const { posts, order } = mergePosts(lists);
  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, serializeGenerated(posts, order), 'utf8');
  console.log(`[posts] wrote ${order.length} post(s) -> ${OUT}${localOnly ? ' (local-only)' : ''}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

**Step 2 — Wire `package.json` scripts:**
```jsonc
"posts": "tsx scripts/build-posts.ts",
"posts:local": "tsx scripts/build-posts.ts --local-only",
"predev": "npm run posts:local",
"prebuild": "npm run posts",
"dev": "vite",
"build": "tsc --noEmit && vite build",
// …existing scripts unchanged…
```
> `prebuild` runs before `build` automatically (npm lifecycle). `predev` before `dev`. No `pretest` (tests use the committed generated file).

**Step 3 — Generate the initial (empty) module + verify it compiles:**
```bash
npm run posts:local        # no content yet → empty generated file
npm run typecheck          # generated file + posts.ts (next task) compile
```
Expected: `[posts] wrote 0 post(s)`, then commit after Task 11 wires `posts.ts`.

**Step 4 — Commit:** `feat(posts): build script + npm wiring`.

---

## Task 11: Point `posts.ts` at the generated module

**Files:**
- Modify: `src/data/posts.ts`

**Step 1 — Replace contents:**
```ts
import type { Post } from '../types';
import { GENERATED_POSTS, GENERATED_ORDER } from './posts.generated';

/* Posts are generated at build time from content/posts/*.md and any configured
   remote SOURCES. To add a post: drop a markdown file in content/posts/ and run
   `npm run posts` (auto-runs on dev/build). The "Writing" nav link + page light
   up automatically when at least one post exists. */

export const POSTS: Record<string, Post> = GENERATED_POSTS;
export const POST_ORDER: string[] = GENERATED_ORDER;
export const hasPosts = (): boolean => POST_ORDER.length > 0;
```

**Step 2 — Typecheck:** `npm run typecheck` → 0.

**Step 3 — Run existing unit tests** (Nav.test may assume no Writing link while posts are empty — should still pass with 0 posts): `npm test`. If it asserts the link is absent, leave as-is for now (still 0 posts); Task 13 reconciles it once a sample exists.

**Step 4 — Commit:** `feat(posts): source posts from generated module`.

---

## Task 12: First real post + images + CSS

**Files:**
- Create: `content/posts/<slug>.md` (one real post)
- Create: `public/posts/<slug>-cover.svg` and one in-body SVG (valid `<img>` sources; SVG avoids needing a binary asset)
- Modify: `src/index.css` (append a `.post-body` content block)

**Step 1 — Write the post** `content/posts/citations-or-it-didnt-happen.md` (real, on-brand; edit freely):
```markdown
---
title: "Citations or it didn't happen: grounding RAG answers"
date: 2026-06-02
tag: Systems
summary: A retrieval pipeline that can't point at its sources is just a confident guess.
cover: /posts/citations-cover.svg
links:
  - { label: LinkedIn, url: https://linkedin.com/in/bhaweshverma50 }
---

Most RAG demos answer fluently and cite nothing. That's fine for a demo and
dangerous in production: a fluent answer with no provenance is indistinguishable
from a hallucination until it costs you.

## The shape that works

Three moves turn a chatbot into something you can audit:

1. **Chunk with identity.** Every chunk carries a stable id, a source URI, and a
   span offset — not just text.
2. **Retrieve, then bind.** The generation step receives chunks *and* must emit
   inline markers that map back to those ids.
3. **Verify before you ship the token.** A lightweight pass drops any claim whose
   marker doesn't resolve to retrieved context.

![Retrieval to citation flow](/posts/citations-flow.svg "retrieve → bind → verify")

## Binding answers to sources

The trick is making the model's output structurally checkable:

```ts
type Cited = { text: string; sources: string[] };

function verify(answer: Cited[], retrieved: Set<string>): Cited[] {
  return answer.filter((claim) =>
    claim.sources.length > 0 && claim.sources.every((s) => retrieved.has(s)),
  );
}
```

If a sentence can't name a retrieved chunk, it doesn't get to be in the answer.
Boring, strict, and it's the difference between a toy and a tool.

> Provenance isn't a feature you add later. It's the data model you start with.
```

**Step 2 — Create the two SVG assets** (Write tool). `public/posts/citations-cover.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 600" role="img" aria-label="Citations cover">
  <rect width="1200" height="600" fill="#0e0e10"/>
  <rect x="1" y="1" width="1198" height="598" fill="none" stroke="#2a2a30"/>
  <text x="80" y="300" font-family="Georgia, serif" font-size="84" fill="#e8e6e1">citations,</text>
  <text x="80" y="400" font-family="Georgia, serif" font-size="84" fill="#7c6cff">or it didn't happen.</text>
  <text x="80" y="500" font-family="monospace" font-size="22" fill="#6a6a72">RAG · provenance · verification</text>
</svg>
```
`public/posts/citations-flow.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 240" role="img" aria-label="retrieve to bind to verify">
  <rect width="1000" height="240" fill="#141417"/>
  <g font-family="monospace" font-size="22" fill="#e8e6e1" text-anchor="middle">
    <rect x="60"  y="90" width="220" height="60" rx="10" fill="none" stroke="#7c6cff"/><text x="170" y="128">retrieve</text>
    <rect x="390" y="90" width="220" height="60" rx="10" fill="none" stroke="#7c6cff"/><text x="500" y="128">bind</text>
    <rect x="720" y="90" width="220" height="60" rx="10" fill="none" stroke="#7c6cff"/><text x="830" y="128">verify</text>
    <text x="335" y="128" fill="#6a6a72">→</text><text x="665" y="128" fill="#6a6a72">→</text>
  </g>
</svg>
```

**Step 3 — Append `.post-body` styles to `src/index.css`** (after the existing `.post-body p` rule near line 592):
```css
/* --- rich post body (markdown + shiki output) --- */
.post-body > * { min-width: 0; }
.post-body :is(h2, h3, h4) { font-family: var(--display); font-weight: 600; letter-spacing: -0.02em; line-height: 1.18; }
.post-body h2 { font-size: clamp(1.5rem, 3.4vw, 2.1rem); }
.post-body h3 { font-size: clamp(1.25rem, 2.6vw, 1.6rem); }
.post-body :not(pre) > code { font-family: var(--mono); font-size: 0.88em; background: rgba(255,255,255,0.07); border: 1px solid var(--line); border-radius: 6px; padding: 0.12em 0.4em; }
.post-body pre.shiki { font-family: var(--mono); font-size: 14px; line-height: 1.6; padding: 20px 22px; border: 1px solid var(--line); border-radius: 12px; overflow-x: auto; tab-size: 2; max-width: 100%; }
.post-body pre.shiki code { background: none; border: 0; padding: 0; }
.post-body img { display: block; width: 100%; height: auto; border: 1px solid var(--line); border-radius: 12px; }
.post-body ul, .post-body ol { padding-left: 1.3em; display: flex; flex-direction: column; gap: 8px; color: rgba(232,230,225,0.82); }
.post-body li { line-height: 1.7; }
.post-body blockquote { margin: 0; padding-left: 22px; border-left: 2px solid var(--accent); color: var(--muted); font-style: italic; }
.post-body a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
.post-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.post .psum { display: block; font-family: var(--sans); font-size: 14px; font-weight: 400; letter-spacing: 0; color: var(--faint); margin-top: 6px; }
.post-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 34px; }
.post-links a { font-family: var(--mono); font-size: 12px; letter-spacing: 0.04em; text-transform: uppercase; padding: 10px 16px; border: 1px solid var(--line); border-radius: 999px; color: var(--muted); transition: color .3s, border-color .3s; }
.post-links a:hover { color: var(--accent); border-color: var(--accent); }
```
> Verify the var names against the top of `src/index.css` (`--display`, `--mono`, `--sans`, `--line`, `--accent`, `--muted`, `--faint`). Adjust any that differ.

**Step 4 — Generate + verify:**
```bash
npm run posts          # SOURCES empty → local only; writes 1 post
npm run typecheck      # generated file with the real post compiles
```
Expected: `[posts] wrote 1 post(s)`.

**Step 5 — Commit:** `feat(posts): first post + assets + post-body styles`.

---

## Task 13: Tests — reconcile Nav, add Writing E2E

**Files:**
- Read/Modify: `src/components/Nav.test.tsx`
- Modify: `src/e2e/smoke.spec.ts`

**Step 1 — Read `Nav.test.tsx`.** Now that a post exists, `hasPosts()` is `true`, so the "Writing" link renders. Update any assertion that expected it absent; add/keep one that asserts it's present. (If the test mocks `../data/posts`, point the mock at a non-empty `POST_ORDER`.)

**Step 2 — Add an E2E** to `src/e2e/smoke.spec.ts` (before the 404 test):
```ts
test('the Writing section is live with a rich post', async ({ page }) => {
  await page.goto('/#/blog');
  const posts = page.locator('.writing .post');
  await expect(posts.first()).toBeVisible();

  await posts.first().click();
  await expect(page.locator('.post-title')).toBeVisible();
  await expect(page.locator('.post-body pre.shiki')).toBeVisible();      // highlighted code
  await expect(page.locator('.post-cover img')).toBeVisible();           // cover image
  await expect(page.locator('.post-links a', { hasText: /linkedin/i })).toHaveAttribute('target', '_blank');
});

test('the Writing nav link appears once posts exist', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.nav-links a', { hasText: 'Writing' })).toBeVisible();
});
```

**Step 3 — Run unit tests:** `npm test` → all pass. **Step 4 — Commit:** `test(posts): nav + writing E2E`.

---

## Task 14: Full verification

**Step 1 — Typecheck + unit + build:**
```bash
npm run typecheck && npm test && npm run build
```
Expected: tsc 0; all vitest pass; `prebuild` runs the post generator then vite build succeeds. Confirm the bundle does **not** contain shiki/marked (they're build-time only): the generated module is plain data.

**Step 2 — E2E** (preview server + Playwright):
```bash
npm run build && npm run preview -- --port 4173 --strictPort &   # or rely on playwright webServer
npm run test:e2e
```
Expected: all specs pass, including the two new Writing tests and the existing empty-state-compatible specs.

**Step 3 — Visual smoke** (optional but recommended): open `/#/blog` and `/#/post/citations-or-it-didnt-happen`, confirm the cover, highlighted code block, in-body diagram, and LinkedIn cross-post button render and match the site's aesthetic.

**Step 4 — Commit** any fixups: `chore(posts): verification pass`.

---

## Task 15: Auto-sync automation (GitHub Action)

**Files:**
- Create: `.github/workflows/sync-posts.yml`

**Step 1 — Implement** (cron + manual; regenerates and commits if remote posts changed; deploy left as a documented stub):
```yaml
name: Sync writing
on:
  schedule: [{ cron: '0 6 * * *' }]   # daily 06:00 UTC
  workflow_dispatch: {}
jobs:
  sync:
    runs-on: ubuntu-latest
    permissions: { contents: write }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run posts                 # local + remote SOURCES → posts.generated.ts
      - name: Commit if changed
        run: |
          if ! git diff --quiet -- src/data/posts.generated.ts; then
            git config user.name "posts-bot"
            git config user.email "bot@users.noreply.github.com"
            git add src/data/posts.generated.ts
            git commit -m "chore(posts): sync from remote sources"
            git push
          else
            echo "No changes."
          fi
      # TODO: trigger your deploy here (Pages / Vercel / Netlify) once chosen.
```
> Only meaningful once `SOURCES` has a real handle AND the repo has a remote. Until then it's a no-op (local-only posts don't change between runs).

**Step 2 — Commit:** `ci(posts): scheduled remote-sync workflow`.

---

## Task 16: Docs + memory

**Files:**
- Modify: `README.md` (or create a short `docs/WRITING.md`)
- Modify: `~/.claude/projects/-Users-bhawesh-verma-Downloads-Portfolio-5/memory/project-react-port.md`

**Step 1 — Document the authoring workflow:**
> **Add a post:** create `content/posts/<slug>.md` with frontmatter (`title`, `date`, `tag`, optional `summary`/`cover`/`links`), write markdown (code fences + `/posts/...` images supported), then `npm run posts` (auto-runs on `dev`/`build`). Commit the `.md`, its images, and the regenerated `src/data/posts.generated.ts`.
> **Mirror an external platform:** uncomment your handle in `src/data/sources.ts` (`devto` ready; hashnode/medium are adapter stubs). **LinkedIn**: add a `links:` entry per post (no public read API to fetch from).

**Step 2 — Update memory** with the pipeline (files, `npm run posts`, sources config, LinkedIn caveat). **Step 3 — Commit:** `docs(posts): authoring + sync guide`.

---

## Done criteria

- `npm run typecheck && npm test && npm run build && npm run test:e2e` all green.
- `/blog` lists the sample post; `/post/<slug>` shows cover + shiki-highlighted code + in-body image + LinkedIn button; "Writing" nav link visible.
- Adding a `.md` to `content/posts/` and running `npm run posts` makes it appear; clearing posts hides the nav link again (existing empty-state behavior preserved).
- Browser bundle contains no `shiki`/`marked` (build-time only).
