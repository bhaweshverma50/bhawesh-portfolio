import { useEffect, useRef } from 'react';
import type { HeroFx } from '../types';

const accent = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#5a78f0';

/** Proximity-dots canvas behind the hero — the sole hero ambient effect.
 *  Pointer-driven and self-contained (it never touches the headline DOM, so it
 *  can't interact with the rotating word). `disabled` (mode 'off', the motion
 *  toggle, or OS reduced-motion) leaves the hero completely static. */
export function useHero(mode: HeroFx, disabled: boolean) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const canvas = heroEl.querySelector<HTMLCanvasElement>('#hero-canvas');
    if (!canvas) return;

    if (mode !== 'dots' || disabled) {
      canvas.style.display = 'none';
      return;
    }
    canvas.style.display = '';
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, dpr = 1, raf = 0;
    let dots: Array<{ x: number; y: number; bx: number; by: number }> = [];
    const mouse = { x: -9999, y: -9999 };
    const GAP = 40;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.ceil(w / GAP) + 1, rows = Math.ceil(h / GAP) + 1;
      for (let i = 0; i < cols; i++)
        for (let j = 0; j < rows; j++) dots.push({ x: i * GAP, y: j * GAP, bx: i * GAP, by: j * GAP });
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const ac = accent();
      for (const d of dots) {
        const dx = d.bx - mouse.x, dy = d.by - mouse.y, dist = Math.hypot(dx, dy), R = 150;
        let ox = 0, oy = 0, near = 0;
        if (dist < R) {
          const f = 1 - dist / R; near = f;
          const a = Math.atan2(dy, dx);
          ox = Math.cos(a) * f * 26; oy = Math.sin(a) * f * 26;
        }
        d.x += (d.bx + ox - d.x) * 0.12; d.y += (d.by + oy - d.y) * 0.12;
        const size = 1.1 + near * 2.4;
        if (near > 0.04) { ctx.fillStyle = ac; ctx.globalAlpha = 0.25 + near * 0.75; }
        else { ctx.fillStyle = '#e7e9f0'; ctx.globalAlpha = 0.08; }
        ctx.beginPath(); ctx.arc(d.x, d.y, size, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    let rt = 0;
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(build, 150); };

    heroEl.addEventListener('mousemove', onMove);
    heroEl.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);
    build(); draw();

    return () => {
      cancelAnimationFrame(raf);
      heroEl.removeEventListener('mousemove', onMove);
      heroEl.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [mode, disabled]);

  return heroRef;
}
