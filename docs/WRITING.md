# Writing / content pipeline

The portfolio is the **canonical home** for your writing. Posts are generated at
build time from local markdown (and, optionally, mirrored from platforms that
expose a public feed). The "Writing" nav link and `/blog` page appear
automatically once at least one post exists.

## Add a post

1. Create `content/posts/<slug>.md`. The filename (minus `.md`) becomes the URL slug.
2. Frontmatter:
   ```yaml
   ---
   title: "Your title"
   date: 2026-06-02            # ISO; shown as "Jun 2026", used for sorting
   tag: Systems               # single category label
   summary: One-line dek for the listing.   # optional
   cover: /posts/your-cover.svg             # optional; file lives in public/posts/
   links:                                   # optional cross-post buttons
     - { label: LinkedIn, url: https://linkedin.com/in/you/... }
   ---
   ```
3. Write the body in Markdown: headings, **bold**, `inline code`, lists, blockquotes,
   fenced code blocks (syntax-highlighted at build time by shiki — no client JS), and
   images. Put images in `public/posts/` and reference them as `/posts/<file>`.
4. Run `npm run posts` (auto-runs on `npm run dev` / `npm run build`). This regenerates
   `src/data/posts.generated.ts`.
5. Commit the `.md`, its images, and the regenerated `src/data/posts.generated.ts`.

`read` time is computed automatically from the word count — you don't set it.
Mark a post `draft: true` in frontmatter to exclude it from the build.

## Mirror an external platform (optional)

Edit `src/data/sources.ts` and uncomment your handle:

```ts
export const SOURCES: Source[] = [
  { type: 'devto', user: 'your-devto-username' },  // ready
  // { type: 'hashnode', host: 'you.hashnode.dev' }, // adapter: TODO
  // { type: 'medium', user: 'you' },                // adapter: TODO (RSS, build-time)
];
```

- **dev.to** is fully wired: `npm run posts` fetches your published articles (each
  article's full markdown), normalizes + sanitizes them, and dedupes anything that's
  a cross-post of a local piece (matched by canonical URL — local wins).
- **Hashnode / Medium** are stubs — wire up their adapters in `src/lib/posts/` when needed.
- **LinkedIn** has no public read API, so it can't be auto-fetched. Add an
  `links:` entry per post to render an "Also on LinkedIn ↗" button instead.

## Automation

`.github/workflows/sync-posts.yml` runs `npm run posts` on a daily cron (and on manual
dispatch), commits `src/data/posts.generated.ts` if remote posts changed, and pushes —
so new dev.to/Hashnode posts appear without touching the repo. Wire your deploy trigger
into the workflow's final step once a host is chosen. (It's a no-op until `SOURCES` has a
real handle and the repo has a remote.)

## How it works (internals)

- `src/lib/posts/` — pure, unit-tested pipeline: `readingTime`, `markdown` (marked + shiki),
  `sanitize` (remote HTML), `local` (gray-matter frontmatter), `devto` (adapter), `merge`
  (dedupe + sort), `codegen` (emit the generated module).
- `scripts/build-posts.ts` — run via `tsx`; reads local md + fetches sources, merges, writes
  `src/data/posts.generated.ts` (committed, so builds/tests work offline and are deterministic).
- The markdown/highlighter deps are **build-time only** — they never ship to the browser bundle.
