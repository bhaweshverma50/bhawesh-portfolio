import { useEffect, useState, type MouseEvent } from 'react';

const RAIL = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'featured', label: 'Featured work' },
  { id: 'cta', label: 'Get in touch' },
];

/** Right-edge section index (home only). Smooth-scrolls and tracks the active section. */
export function SectionRail() {
  const [active, setActive] = useState('hero');
  useEffect(() => {
    const onScroll = () => {
      const mid = window.innerHeight * 0.42;
      let act = 'hero';
      for (const r of RAIL) {
        const el = document.getElementById(r.id);
        if (el && el.getBoundingClientRect().top <= mid) act = r.id;
      }
      setActive(act);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 56;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  };

  return (
    <nav className="rail" id="rail" aria-label="Section navigation">
      {RAIL.map((r) => (
        <a
          key={r.id}
          href={`#${r.id}`}
          className={active === r.id ? 'active' : undefined}
          aria-label={r.label}
          aria-current={active === r.id ? 'true' : undefined}
          onClick={go(r.id)}
        />
      ))}
    </nav>
  );
}
