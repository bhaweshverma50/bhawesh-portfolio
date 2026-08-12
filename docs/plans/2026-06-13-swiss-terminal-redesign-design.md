# Swiss Terminal redesign — design

Date: 2026-06-13
Branch: `redesign/swiss-terminal`

## Why

The portfolio read as "generic AI-generated": **Clash Display + General Sans**
(Fontshare) is the signature font pairing of trendy template portfolios; the
**acid-lime accent** + hairline `gap:1px` bordered-cell grids + uppercase-mono
eyebrows with `::before` dashes + `✳ ◇ ↗` glyph bullets are the stock
"brutalist dark portfolio" kit. A heavy FX/"Tweaks" system layered chromatic
aberration, glitch text, aurora, a canvas mesh, cursor trails, particles, etc.,
which both cheapened the work and caused flicker.

## Decisions (locked with the user)

1. **Typography / vibe → "Swiss Terminal."**
   - Display / headlines / brand: **Martian Mono** (used large, lowercase).
   - Body: **Inter Tight**.
   - Small labels / code / ticks: **Spline Sans Mono**.
   - Motif: monospace coordinates `[01]`, square node `▪`, bracket chips
     `[ tag ]`, leading caret `▸`, a blinking block caret `▮` after the hero's
     rotating word. Sharp corners (radius 2–4px), thin rules, real spacing.
2. **Accent → electric cobalt** `oklch(0.67 0.18 264)` on cool-dark ink
   (`#0a0b0f`). `--accent-ink` becomes near-white for fills. Per-route themes
   stay in the blue family (no rainbow).
3. **FX system → curate & fix.** Slim the Tweaks panel to: hero effect
   (dots | off), cursor (ring | minimal | off), film grain, motion master
   toggle, page transition (style + speed). Delete chromatic/glitch/holo/
   scrollhue text, glitch/particle click bursts, aurora/mesh/sheen, cursor
   trail/spotlight/crosshair, and the self-drawing SVG underline. Delete
   `FxLayer` and the global pointer→CSS-var writer entirely.
4. **Hero headline → rotate, de-janked.** Keep the rotating phrases but rewrite
   the scramble to be **ref/DOM-driven** (mutates one element's `textContent`
   via rAF) — no per-frame React `setState`, no re-splitting letters. Drop the
   per-letter hero modes (weight/tilt/magnet) that depended on `.ch` spans; keep
   the pointer-driven proximity-dots canvas as the sole hero ambient effect.

## Flicker root causes being fixed

- Hero scramble fired `setState` every animation frame (~40+ re-renders per
  phrase), re-creating the `.ch` spans that `useHero` animated → main flicker.
  → ref-driven `useRotatingText`, no char-splitting.
- Stacked `mix-blend-mode` + `filter: blur(70px)` fixed overlays (aurora, mesh,
  sheen, grain, cursor difference, trail screen) = expensive composited
  repaints. → all cut except static grain + subtle vignette.
- Global `pointermove` writing `--mx/--my/--holohue` on every move drove
  constant repaints for now-deleted FX. → removed.
- `motion: false` adds `body.motion-off` to pause the marquee, hero rotation,
  caret blink, and make reveals instant — a guaranteed still, flicker-free mode.

## Curated Tweaks shape

```ts
type HeroFx = 'dots' | 'off';
type CursorStyle = 'ring' | 'minimal' | 'off';
interface Tweaks {
  heroFx: HeroFx; cursor: CursorStyle; grain: boolean;
  motion: boolean; transition: 'wipe'|'slide'|'fade'; transSpeed: 'fast'|'normal'|'slow';
}
```

## Pattern redesigns (de-generic)

- **Marquee → terminal ticker:** small lowercase Spline Sans Mono, `/`
  separators, `●` accent prefix on "hot" items, slower/subtler. Reads like a
  status feed, not a fashion marquee.
- **Cards (facts/skills/metrics/repos/proj):** real spacing instead of the
  uniform `gap:1px`-on-line grid; subtle `--bg-2` surface, thin border, mono
  corner index/coordinate, hover lift + left accent bar.
- **Section heads / eyebrows:** `[01]` mono index + `▪ label` (square node)
  instead of the `::before` dash. Titles in Martian Mono at controlled size.
- **Buttons:** sharp 4px radius (not 100px pills), mono label, leading `▸`
  caret, accent fill on hover.
- **Tags:** sharp bracketed mono chips, lowercase.

## Verification

`npm run typecheck`, `npm test`, `npm run build`, then run the dev server and
screenshot home + an interior page; adversarial multi-dimensional review
(flicker/perf, anti-generic/visual coherence, a11y/contrast, responsive, build).
