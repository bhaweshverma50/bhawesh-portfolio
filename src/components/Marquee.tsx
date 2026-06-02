import { MARQUEE } from '../data/content';

/** Infinite skills marquee. Items are duplicated so the -50% loop is seamless. */
export function Marquee() {
  const items = [...MARQUEE, ...MARQUEE];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track" id="marquee">
        {items.map((m, i) => (
          <span key={i} className={m.hot ? 'hot' : undefined}>
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
