# Writing / Content Pipeline — Design

**Date:** 2026-06-02
**Status:** Approved
**Scope:** Replace the empty `posts.ts` stub with a real, automation-friendly writing system: markdown-in-repo authoring (canonical) + build-time auto-fetch from configured platforms, with rich content (headings, code, images) and cross-post links.

## Background / Why

The Writing section already exists end-to-end (`/blog` listing, `/post/:slug` detail, route, styling). It is **self-hiding**: `src/data/posts.ts` ships empty, `hasPosts()` returns `false`, so `Nav.tsx` omits the "Writing" link and `Blog.tsx` shows an empty-state message. The moment a post exists, the nav link and page light up automatically.

Current limits of the stub model:
- Body is `string[]` (plain paragraphs) — no headings, code, links, or images in a post.
- Hand-edited TypeScript — not automation-friendly, no external sync.

User intent (confirmed):
1. Author canonically as **markdown files pushed to the repo**.
2. **Auto-fetch** from configured external sources where technically possible.
3. Rich content: text, code blocks, **images**, everything.
4. Will publish on LinkedIn "and stuff" later.

## Source reality (decisions)

| Source | Auto-fetch | Mechanism |
|---|---|---|
| Markdown in repo | ✅ canonical | build-time parse of `content/posts/*.md` |
| dev.to | ✅ build now | public API `dev.to/api/articles?username=…` → `body_markdown`, CORS-open |
| Hashnode | ✅ stub | public GraphQL; enable by adding to `SOURCES` |
| Medium | ⚠️ stub | RSS only, no CORS, truncated — build-time only |
| LinkedIn | ❌ no fetch | no public RSS / read API without OAuth + partner approval; scraping violates ToS |

**Model:** the portfolio is the **canonical home**. Posts are authored here; LinkedIn/dev.to are distribution channels. Each post may carry `links:` cross-post buttons ("Also on LinkedIn ↗"). Platforms with real feeds (dev.to first) are additionally pulled in automatically.

## Architecture

Normalized `Post` fed by pluggable sources, merged at **build time** into one generated module. Build-time (not runtime fetch) chosen because the site is a client-only Vite SPA — keeps it fast, dodges Medium/CORS, SEO-correct. "Automation" = a CI hook that re-runs the build.

```
content/posts/*.md            ← author here (frontmatter + markdown + images)
public/posts/*                ← post images
src/data/sources.ts           ← export const SOURCES = [{ type:'devto', user:'bhaweshverma50' }]
scripts/build-posts.mjs       ← parse local md + fetch SOURCES → merge → sort date desc → write generated
src/data/posts.generated.ts   ← POSTS + POST_ORDER (COMMITTED — offline-safe snapshot)
src/data/posts.ts             ← re-exports generated + keeps hasPosts()
```

`prebuild`, `predev`, `pretest` all run `build-posts.mjs`. Committed `posts.generated.ts` guarantees a fresh checkout builds with no network and tests are deterministic.

## Content model

```markdown
content/posts/designing-rag.md
---
title: Designing a RAG pipeline that actually cites its sources
date: 2026-06-02          # ISO, sortable; displayed as "Jun 2026"
tag: Systems
summary: How to make retrieval answer with receipts.   # optional listing dek
cover: /posts/rag-cover.png                            # optional
draft: false                                           # optional → excluded from build
links:
  - { label: LinkedIn, url: https://linkedin.com/posts/… }
---
## body markdown…
```

- `slug` = filename. `read` = auto-computed from word count (~200 wpm).
- New `Post` shape (replaces `body: string[]`):
  `{ slug, title, date, displayDate, tag, summary?, cover?, links?, source, canonical?, html }`.

## Rendering & images

- Markdown → HTML at **build time** via `marked` + `shiki` (code highlighting emits inline-styled spans → zero highlighting JS shipped, no theme CSS to maintain).
- Rendered via existing `RichText` / `dangerouslySetInnerHTML`. Remote HTML sanitized with `sanitize-html`; local trusted.
- Local images in `public/posts/…`, referenced `/posts/x.png`; cover via frontmatter. Remote (dev.to) images kept as absolute URLs.
- Add `.post-body` CSS: `img` (full-width, rounded, caption from title attr), headings, blockquote, lists, code blocks — matching the site aesthetic.

## Sources & adapters

- **dev.to adapter (now):** list by username → each article's `body_markdown` → same md pipeline. Maps `cover_image`, `tags`, `canonical_url`, `published_at`. **Dedupe by canonical** so a cross-posted piece does not appear twice.
- **Hashnode / Medium:** stub adapters with `// TODO enable`, activated by adding to `SOURCES`.
- **LinkedIn:** `links:` entries only.

## Automation

`.github/workflows/sync-posts.yml`: cron (daily) + manual dispatch → runs `build-posts.mjs`, commits the diff if posts changed → triggers deploy. Deploy step left as a documented stub (host undecided).

## Testing

- **Unit:** frontmatter parse, slug-from-filename, read-time calc, dev.to JSON→Post mapping (mocked fetch), dedupe-by-canonical.
- **Sample:** ship one real local post (image + code block) so the section goes live and is testable.
- **E2E:** nav shows "Writing"; listing renders the post; detail shows cover + code block + cross-post link; existing empty-state test stays valid when posts/`SOURCES` are cleared.

## New dependencies (build-time)

`marked`, `shiki`, `gray-matter`, `sanitize-html`.

## Behavior change to flag

`Post.body: string[]` → `Post.html: string` — updates `src/types.ts` and `src/pages/PostDetail.tsx`.

## Out of scope (YAGNI)

- Runtime in-browser fetching (only if zero-rebuild sync is later required).
- Headless CMS.
- LinkedIn scraping.
- Tag filtering / search / pagination on the listing (revisit when post count warrants).
