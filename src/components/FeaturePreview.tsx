import { useEffect, useRef } from 'react';
import { useIsTouch } from '../hooks/useMediaQuery';

/** The little image-placeholder preview that follows the cursor when hovering
 *  any element with a [data-preview] attribute (featured items, project cards). */
export function FeaturePreview() {
  const isTouch = useIsTouch();
  const boxRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isTouch) return;
    const box = boxRef.current, label = labelRef.current, img = imgRef.current;
    if (!box || !label || !img) return;
    let px = 0, py = 0, tx = 0, ty = 0, raf = 0, shown = false;
    const move = () => {
      px += (tx - px) * 0.12; py += (ty - py) * 0.12;
      box.style.left = px + 'px'; box.style.top = py + 'px';
      raf = shown ? requestAnimationFrame(move) : 0;
    };
    const onMove = (e: MouseEvent) => { tx = e.clientX; ty = e.clientY; if (!raf && shown) raf = requestAnimationFrame(move); };
    const onOver = (e: Event) => {
      const t = (e.target as Element)?.closest?.('[data-preview]') as HTMLElement | null;
      if (t) {
        shown = true; box.classList.add('show'); label.textContent = t.dataset.preview || 'project';
        const src = t.dataset.previewImg;
        if (src) { box.classList.add('has-img'); if (img.src !== src) img.src = src; }
        else { box.classList.remove('has-img'); img.removeAttribute('src'); }
        if (!raf) raf = requestAnimationFrame(move);
      }
    };
    const onOut = (e: Event) => {
      const me = e as MouseEvent;
      const t = (me.target as Element)?.closest?.('[data-preview]') as HTMLElement | null;
      const to = me.relatedTarget as Element | null;
      if (t && (!to || !t.contains(to))) { shown = false; box.classList.remove('show'); }
    };
    const onDown = () => { shown = false; box.classList.remove('show'); };
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
    <div className="feat-preview" id="featPreview" aria-hidden="true" ref={boxRef}>
      <img ref={imgRef} alt="" />
      <div className="ph" ref={labelRef}>project preview</div>
    </div>
  );
}
