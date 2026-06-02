import { useEffect, type RefObject } from 'react';

/** Drives the top progress bar width, body.scrolled, and the --scrollhue var.
 *  Writes directly to the DOM (no re-renders). */
export function useScrollProgress(barRef: RefObject<HTMLElement>): void {
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const sh = h.scrollHeight - h.clientHeight || 1;
      const sy = window.scrollY || h.scrollTop || 0;
      if (barRef.current) barRef.current.style.width = Math.min(100, (sy / sh) * 100) + '%';
      document.body.classList.toggle('scrolled', sy > 24);
      h.style.setProperty('--scrollhue', Math.round((sy * 0.35) % 360) + 'deg');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [barRef]);
}
