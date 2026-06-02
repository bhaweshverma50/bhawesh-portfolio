# Bhawesh — Portfolio (React + TypeScript)

A port of the hand-built portfolio to **Vite + React 18 + TypeScript**. The visual
design is unchanged (the original hand-written CSS is reused verbatim); all behaviour —
custom cursor, WebGL-ish hero, page-transition wipe, scroll reveals, and the Tweaks
panel — is implemented as typed React components and hooks.

## Quick start

```bash
npm install
npm run dev        # local dev server (http://localhost:5173) with HMR
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Type-check and build the production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run unit + component tests (Vitest + Testing Library) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run Playwright end-to-end smoke tests (builds + previews first) |
| `npm run test:e2e:install` | Download the Chromium browser for Playwright (first run only) |

## Configure your details

**Nothing is hardcoded in components** — all identity, copy, and data live in config/data files:

| File | What it holds |
| --- | --- |
| `src/config/site.ts` | Name, role, email, phone, location, résumé URL, and `SOCIALS` (GitHub/LinkedIn/X/…). **Blank socials are hidden** — no dead links. |
| `src/data/content.ts` | All page copy: hero, about, facts, marquee, **experience**, **skills**, **education**, **awards**, and the work/blog/CTA/contact intros. |
| `src/data/projects.ts` | Every project (title, tagline, stack, body, metrics, optional `repo`/`demo` links, `featured` flag). Order = display order; "next project" cycles automatically. |
| `src/data/posts.ts` | Blog essays. **Empty by default** — add one and the "Writing" nav link + page appear automatically. |
| `src/config/themes.ts` | Per-route accent colours. |

Edit text/data in those files and the UI updates — no component changes needed.
The **Download Résumé** button serves `public/Bhawesh-Verma-Resume.pdf` (swap the file or change `SITE.resumeUrl`).

When deploying, update the absolute URLs (`canonical`, Open Graph, JSON-LD) in
`index.html` from `https://bhawesh.dev` to your real domain.

## Project structure

```
src/
  config/      site + theme configuration
  data/        projects, posts, marketing content
  hooks/       useClock, useReveal, useScrollProgress, useHero, useMediaQuery
  components/  Cursor, FxLayer, Nav, Overlays, Marquee, … + tweaks/
  sections/    Hero, About, Featured, CTA (home)
  pages/       Home, Work, Blog, Contact, ProjectDetail, PostDetail, NotFound
  App.tsx      chrome + hash router + page-transition orchestration
```

## The Tweaks panel

Open it with the floating **Tweaks** dial (bottom-right), the footer link, or
**Shift + T**. Choices persist to `localStorage`. Because it's a normal bundled
React component now, it opens reliably whether you're on a dev server, a static
host, or even `file://` — no runtime fetching of source.
