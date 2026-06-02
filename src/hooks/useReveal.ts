import { useEffect } from 'react';

/** Adds `.in` to `.reveal` / `.line-mask` elements as they enter the viewport
 *  (CSS handles the actual transition). Re-runs whenever `key` changes — i.e.
 *  after each route swap — so freshly-rendered content animates in. */
export function useReveal(key: string): void {
  useEffect(() => {
    const root = document.getElementById('view') || document.body;
    const els = Array.from(
      root.querySelectorAll<HTMLElement>('.reveal:not(.in), .line-mask:not(.in)'),
    );
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    );
    els.forEach((el) => io.observe(el));

    // reveal anything already on screen immediately (timers cover throttled scroll)
    const raf = requestAnimationFrame(() => {
      const vh = window.innerHeight;
      els.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) {
          el.classList.add('in');
          io.unobserve(el);
        }
      });
    });
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [key]);
}
