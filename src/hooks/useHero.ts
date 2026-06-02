import { useEffect, useRef } from 'react';
import type { HeroMode } from '../types';

const accent = () =>
  getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b6ff3a';

type Teardown = () => void;

/** Attaches one of the cursor-driven hero interaction modes to the hero section.
 *  Ported 1:1 from the original setupHero(): dots(canvas) · weight · tilt · magnet. */
export function useHero(mode: HeroMode, reduced: boolean) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const heroEl = heroRef.current;
    if (!heroEl) return;
    const h1 = heroEl.querySelector<HTMLElement>('h1');
    const canvas = heroEl.querySelector<HTMLCanvasElement>('#hero-canvas');
    const letters = h1 ? Array.from(h1.querySelectorAll<HTMLElement>('.ch')) : [];

    const resetHero = () => {
      if (canvas) canvas.style.display = 'none';
      if (h1) {
        h1.classList.remove('mode-weight', 'mode-tilt', 'mode-magnet');
        h1.style.perspective = '';
        h1.querySelectorAll<HTMLElement>('.ln').forEach((l) => (l.style.transform = ''));
        letters.forEach((ch) => {
          ch.style.transform = '';
          ch.style.fontVariationSettings = '';
        });
      }
    };

    const initDots = (): Teardown => {
      if (!canvas) return () => {};
      canvas.style.display = '';
      const ctx = canvas.getContext('2d');
      if (!ctx) return () => {};
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
        for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) dots.push({ x: i * GAP, y: j * GAP, bx: i * GAP, by: j * GAP });
      };
      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        const ac = accent();
        for (const d of dots) {
          const dx = d.bx - mouse.x, dy = d.by - mouse.y, dist = Math.hypot(dx, dy), R = 150;
          let ox = 0, oy = 0, near = 0;
          if (dist < R) { const f = 1 - dist / R; near = f; const a = Math.atan2(dy, dx); ox = Math.cos(a) * f * 26; oy = Math.sin(a) * f * 26; }
          d.x += (d.bx + ox - d.x) * 0.12; d.y += (d.by + oy - d.y) * 0.12;
          const size = 1.1 + near * 2.4;
          if (near > 0.04) { ctx.fillStyle = ac; ctx.globalAlpha = 0.25 + near * 0.75; }
          else { ctx.fillStyle = '#e8e6e1'; ctx.globalAlpha = 0.1; }
          ctx.beginPath(); ctx.arc(d.x, d.y, size, 0, 6.283); ctx.fill();
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      };
      const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; };
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
    };

    const initWeight = (): Teardown => {
      if (!h1) return () => {};
      h1.classList.add('mode-weight');
      let raf = 0, mx = -9999, my = -9999;
      const st = letters.map(() => ({ w: 420, t: 420 }));
      const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
      const onLeave = () => { mx = -9999; my = -9999; };
      const loop = () => {
        for (let i = 0; i < letters.length; i++) {
          const r = letters[i].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const d = Math.hypot(cx - mx, cy - my), f = Math.max(0, 1 - d / 320);
          st[i].t = 320 + f * f * 580; st[i].w += (st[i].t - st[i].w) * 0.18;
          const wd = 90 + (st[i].w - 320) / 580 * 35;
          letters[i].style.fontVariationSettings = `'wght' ${st[i].w.toFixed(0)}, 'wdth' ${wd.toFixed(0)}`;
        }
        raf = requestAnimationFrame(loop);
      };
      heroEl.addEventListener('mousemove', onMove);
      heroEl.addEventListener('mouseleave', onLeave);
      loop();
      return () => { cancelAnimationFrame(raf); heroEl.removeEventListener('mousemove', onMove); heroEl.removeEventListener('mouseleave', onLeave); };
    };

    const initTilt = (): Teardown => {
      if (!h1) return () => {};
      h1.classList.add('mode-tilt'); h1.style.perspective = '900px';
      const lns = Array.from(h1.querySelectorAll<HTMLElement>('.ln'));
      let raf = 0, tx = 0.5, ty = 0.5, cx = 0.5, cy = 0.5;
      const onMove = (e: MouseEvent) => { const r = heroEl.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width; ty = (e.clientY - r.top) / r.height; };
      const onLeave = () => { tx = 0.5; ty = 0.5; };
      const loop = () => {
        cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
        const ry = (cx - 0.5) * 26, rx = (0.5 - cy) * 18;
        lns.forEach((l, i) => { const dp = 1 + i * 0.18; l.style.transform = `rotateX(${(rx * dp).toFixed(2)}deg) rotateY(${(ry * dp).toFixed(2)}deg) translateZ(${i * 12}px)`; });
        raf = requestAnimationFrame(loop);
      };
      heroEl.addEventListener('mousemove', onMove);
      heroEl.addEventListener('mouseleave', onLeave);
      loop();
      return () => { cancelAnimationFrame(raf); heroEl.removeEventListener('mousemove', onMove); heroEl.removeEventListener('mouseleave', onLeave); };
    };

    const initMagnet = (): Teardown => {
      if (!h1) return () => {};
      h1.classList.add('mode-magnet');
      let raf = 0, mx = -9999, my = -9999;
      const st = letters.map(() => ({ x: 0, y: 0 }));
      const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
      const onLeave = () => { mx = -9999; my = -9999; };
      const loop = () => {
        for (let i = 0; i < letters.length; i++) {
          const r = letters[i].getBoundingClientRect();
          const cx = r.left + r.width / 2 - st[i].x, cy = r.top + r.height / 2 - st[i].y;
          const dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 220), push = f * 46;
          st[i].x += ((dx / d) * push - st[i].x) * 0.16; st[i].y += ((dy / d) * push - st[i].y) * 0.16;
          letters[i].style.transform = `translate(${st[i].x.toFixed(1)}px, ${st[i].y.toFixed(1)}px)`;
        }
        raf = requestAnimationFrame(loop);
      };
      heroEl.addEventListener('mousemove', onMove);
      heroEl.addEventListener('mouseleave', onLeave);
      loop();
      return () => { cancelAnimationFrame(raf); heroEl.removeEventListener('mousemove', onMove); heroEl.removeEventListener('mouseleave', onLeave); };
    };

    resetHero();
    if (reduced) return; // honour reduced-motion: leave the hero static

    const MODES: Record<HeroMode, () => Teardown> = {
      dots: initDots, weight: initWeight, tilt: initTilt, magnet: initMagnet, off: () => () => {},
    };
    const run = MODES[mode] ?? initDots;
    const teardown = run();
    return () => { teardown(); resetHero(); };
  }, [mode, reduced]);

  return heroRef;
}
