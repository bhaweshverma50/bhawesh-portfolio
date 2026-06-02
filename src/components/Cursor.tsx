import { useEffect, useRef } from 'react';
import { useIsTouch } from '../hooks/useMediaQuery';
import { useTweaks } from './tweaks/TweaksContext';

const CURSORS = ['ring', 'glow', 'crosshair', 'spotlight'] as const;
const HOT = 'a,button,.feat-item,.repo,.post,.skill-cat,.btn,.fact,.proj-card';

/** Custom dot + trailing ring cursor (desktop only). */
export function Cursor() {
  const isTouch = useIsTouch();
  const { tweaks } = useTweaks();
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  // reflect the chosen cursor style as a body class (CSS keys off body.cur-*)
  useEffect(() => {
    CURSORS.forEach((c) => document.body.classList.remove('cur-' + c));
    document.body.classList.add('cur-' + tweaks.cursor);
  }, [tweaks.cursor]);

  useEffect(() => {
    if (isTouch) return;
    const dot = dotRef.current, ring = ringRef.current;
    if (!dot || !ring) return;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my, raf = 0;
    const follow = () => {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      raf = Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1 ? requestAnimationFrame(follow) : 0;
    };
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      if (!raf) raf = requestAnimationFrame(follow);
    };
    const onOver = (e: Event) => { if ((e.target as Element)?.closest?.(HOT)) document.body.classList.add('cursor-hover'); };
    const onOut = (e: Event) => { if ((e.target as Element)?.closest?.(HOT)) document.body.classList.remove('cursor-hover'); };
    const onDown = () => document.body.classList.remove('cursor-hover');
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseout', onOut);
    window.addEventListener('pointerdown', onDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseout', onOut);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [isTouch]);

  if (isTouch) return null;
  return (
    <>
      <div className="cursor" id="cursor" aria-hidden="true" ref={dotRef} />
      <div className="cursor-ring" id="cursorRing" aria-hidden="true" ref={ringRef} />
    </>
  );
}
