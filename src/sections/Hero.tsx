import { useHero } from '../hooks/useHero';
import { useReducedMotion } from '../hooks/useMediaQuery';
import { useScramble } from '../hooks/useScramble';
import { useTweaks } from '../components/tweaks/TweaksContext';
import { HERO } from '../data/content';
import type { HeadlineLine } from '../types';

const splitChars = (text: string) =>
  Array.from(text).map((c, i) => (
    <span className="ch" key={i}>
      {c === ' ' ? ' ' : c}
    </span>
  ));

/** A headline line that loops through phrases with the scramble effect.
 *  Screen readers get the canonical first phrase via aria-label. */
function RotatingLine({ line, reduced }: { line: HeadlineLine; reduced: boolean }) {
  const display = useScramble([line.text, ...(line.rotate ?? [])], reduced);
  return (
    <span className={`ln line-mask${line.outline ? ' outline' : ''}`} aria-label={line.text}>
      <span aria-hidden="true">{splitChars(display)}</span>
    </span>
  );
}

export function Hero() {
  const { tweaks } = useTweaks();
  const reduced = useReducedMotion();
  const heroRef = useHero(tweaks.heroMode, reduced);

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
              <RotatingLine line={l} reduced={reduced} key={i} />
            ) : (
              <span className={`ln line-mask${l.outline ? ' outline' : ''}`} key={i}>
                <span>{splitChars(l.text)}</span>
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
