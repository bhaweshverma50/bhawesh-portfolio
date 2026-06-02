import { useEffect, useRef } from 'react';
import { useIsTouch } from '../hooks/useMediaQuery';
import { useTweaks } from './tweaks/TweaksContext';
import type { ClickFx } from '../types';

const el = (tag: string, cls?: string) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
};
const accent = () => 'var(--accent)';

/** Cursor sheen / spotlight / crosshair, cursor trail, click bursts, holo mesh.
 *  Ported from fx.js — all effects are pointer-driven, so a static page is unaffected. */
export function FxLayer() {
  const isTouch = useIsTouch();
  const { tweaks } = useTweaks();
  const meshRef = useRef<HTMLCanvasElement>(null);
  const holoRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  const trailOn = useRef(tweaks.trail);
  const clickFx = useRef<ClickFx>(tweaks.clickFx);
  trailOn.current = tweaks.trail && !isTouch;
  clickFx.current = tweaks.clickFx;

  // ---- pointer tracking → CSS vars + crosshair + trail ----
  useEffect(() => {
    if (isTouch) return;
    const root = document.documentElement;
    const pool = trailRef.current ? Array.from(trailRef.current.children) as HTMLElement[] : [];
    let pi = 0, lastTrail = 0;
    const onMove = (e: PointerEvent) => {
      const mx = e.clientX, my = e.clientY;
      root.style.setProperty('--mx', mx + 'px');
      root.style.setProperty('--my', my + 'px');
      if (crossRef.current) { crossRef.current.style.left = mx + 'px'; crossRef.current.style.top = my + 'px'; }
      root.style.setProperty('--holohue', String(Math.round((mx / window.innerWidth) * 320 + 170)));
      if (trailOn.current && pool.length) {
        const now = performance.now();
        if (now - lastTrail >= 22) {
          lastTrail = now;
          pi = (pi + 1) % pool.length;
          const d = pool[pi];
          d.style.left = mx + 'px'; d.style.top = my + 'px';
          d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
        }
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [isTouch]);

  // ---- click bursts ----
  useEffect(() => {
    if (isTouch) return;
    const ripple = (x: number, y: number) => {
      const r = el('div', 'ripple');
      r.style.left = x + 'px'; r.style.top = y + 'px';
      document.body.appendChild(r);
      window.setTimeout(() => r.remove(), 760);
    };
    const particles = (x: number, y: number) => {
      for (let i = 0; i < 16; i++) {
        const s = el('div', 'spark');
        const size = 3 + Math.random() * 4;
        s.style.width = size + 'px'; s.style.height = size + 'px';
        s.style.left = x + 'px'; s.style.top = y + 'px';
        s.style.background = Math.random() < 0.5 ? accent() : `hsl(${Math.floor(Math.random() * 360)} 92% 62%)`;
        document.body.appendChild(s);
        const ang = Math.random() * Math.PI * 2, dist = 38 + Math.random() * 96;
        const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist;
        s.animate(
          [{ transform: 'translate(-50%,-50%) translate(0,0) scale(1)', opacity: 1 },
           { transform: `translate(-50%,-50%) translate(${dx}px,${dy}px) scale(0.25)`, opacity: 0 }],
          { duration: 600 + Math.random() * 350, easing: 'cubic-bezier(0.16,1,0.3,1)' },
        ).onfinish = () => s.remove();
      }
    };
    const glitch = (x: number, y: number) => {
      const cols = ['var(--accent)', '#00e9ff', '#ff2bd1', '#e8e6e1'];
      for (let i = 0; i < cols.length; i++) {
        const b = el('div', 'glitch-bar');
        const wdt = 70 + Math.random() * 170;
        b.style.width = wdt + 'px'; b.style.background = cols[i];
        b.style.left = (x - wdt / 2 + (Math.random() - 0.5) * 30) + 'px';
        b.style.top = (y - 14 + i * 8) + 'px';
        document.body.appendChild(b);
        b.animate(
          [{ transform: 'translateX(0)', opacity: 0.95 },
           { transform: `translateX(${(Math.random() - 0.5) * 80}px)`, opacity: 0 }],
          { duration: 280 + i * 70, easing: 'steps(5)' },
        ).onfinish = () => b.remove();
      }
    };
    const onDown = (e: PointerEvent) => {
      const fx = clickFx.current;
      if (fx === 'ripple') ripple(e.clientX, e.clientY);
      else if (fx === 'particles') particles(e.clientX, e.clientY);
      else if (fx === 'glitch') glitch(e.clientX, e.clientY);
    };
    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, [isTouch]);

  // ---- holo overlay class + canvas mesh ----
  useEffect(() => {
    const holo = holoRef.current;
    if (holo) holo.className = 'holo' + (tweaks.holo === 'sheen' || tweaks.holo === 'aurora' ? ' ' + tweaks.holo : '');
    if (tweaks.holo !== 'mesh') return;
    const canvas = meshRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, raf = 0, t = 0;
    const size = () => { w = canvas.width = Math.ceil(window.innerWidth / 2); h = canvas.height = Math.ceil(window.innerHeight / 2); };
    size();
    const blobs = [0, 1, 2, 3, 4].map((i) => ({ hue: i * 64, ph: Math.random() * 6.28, sp: 0.35 + Math.random() * 0.5 }));
    const frame = () => {
      t += 0.006;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.filter = 'blur(24px)';
      const R = Math.min(w, h) * 0.52;
      for (const b of blobs) {
        const x = w * (0.5 + 0.42 * Math.sin(t * b.sp + b.ph));
        const y = h * (0.5 + 0.42 * Math.cos(t * b.sp * 1.25 + b.ph * 1.7));
        const hue = (b.hue + t * 42) % 360;
        const g = ctx.createRadialGradient(x, y, 0, x, y, R);
        g.addColorStop(0, `hsla(${hue}, 92%, 60%, 0.55)`);
        g.addColorStop(1, `hsla(${hue}, 92%, 60%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
      }
      ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };
    window.addEventListener('resize', size);
    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); ctx.clearRect(0, 0, w, h); };
  }, [tweaks.holo]);

  return (
    <>
      <canvas id="holo-mesh" aria-hidden="true" ref={meshRef} />
      <div className="holo" aria-hidden="true" ref={holoRef} />
      <div className="spotlight" aria-hidden="true" />
      <div className="cross" aria-hidden="true" ref={crossRef}><i /></div>
      <div ref={trailRef} aria-hidden="true">
        {Array.from({ length: 22 }).map((_, i) => (
          <div className="trail-dot" key={i} />
        ))}
      </div>
    </>
  );
}
