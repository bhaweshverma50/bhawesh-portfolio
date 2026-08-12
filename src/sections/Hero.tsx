import { useRef } from 'react';
import { useHero } from '../hooks/useHero';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useRotatingText } from '../hooks/useRotatingText';
import { useTweaks } from '../components/tweaks/TweaksContext';
import { HERO } from '../data/content';
import type { HeadlineLine } from '../types';

/** A headline line whose word cycles through phrases with a decode/scramble
 *  effect. The scramble is ref-driven (writes textContent directly) so it never
 *  re-renders React or re-creates nodes. A canonical aria-label keeps the line
 *  legible to screen readers; a blinking block caret trails the live word. */
function RotatingLine({ line, enabled }: { line: HeadlineLine; enabled: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const phrases = [line.text, ...(line.rotate ?? [])];
  useRotatingText(ref, phrases, enabled);
  return (
    <span className={`ln line-mask${line.outline ? ' outline' : ''}`}>
      <span>
        {/* canonical text for assistive tech (the animated copy is aria-hidden,
            so screen readers never hear the scramble gibberish) */}
        <span className="sr-only">{line.text}</span>
        <span aria-hidden="true">
          <span ref={ref}>{line.text}</span>
          <span className="caret" />
        </span>
      </span>
    </span>
  );
}

export function Hero() {
  const { tweaks } = useTweaks();
  const reduced = useReducedMotion();
  const ambient = reduced || !tweaks.motion;
  const heroRef = useHero(tweaks.heroFx, ambient);

  return (
    <section className="hero" id="hero" data-screen-label="Hero" ref={heroRef}>
      <canvas id="hero-canvas" />
      <div className="wrap hero-top">
        <div className="hero-meta">
          <b>{HERO.metaRole}</b>
          <br />
          {HERO.metaLine}
        </div>
        <div className="hero-status">
          <span className="pulse" /> {HERO.status}
        </div>
      </div>
      <div className="wrap">
        <h1>
          {HERO.headline.map((l, i) =>
            l.rotate?.length ? (
              <RotatingLine line={l} enabled={!ambient} key={i} />
            ) : (
              <span className={`ln line-mask${l.outline ? ' outline' : ''}`} key={i}>
                <span>{l.text}</span>
              </span>
            ),
          )}
        </h1>
        <div className="hero-sub">
          <p>{HERO.sub}</p>
          <div className="scroll-cue">
            <span className="bar" /> {HERO.scrollCue}
          </div>
        </div>
      </div>
    </section>
  );
}
