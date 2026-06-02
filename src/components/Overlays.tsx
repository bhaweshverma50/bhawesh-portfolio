import { useRef } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useTweaks } from './tweaks/TweaksContext';

/** Fixed decorative overlays: film grain, vignette, scroll-progress bar. */
export function Overlays() {
  const { tweaks } = useTweaks();
  const progRef = useRef<HTMLDivElement>(null);
  useScrollProgress(progRef);
  return (
    <>
      <div className="grain" aria-hidden="true" style={{ display: tweaks.grain ? undefined : 'none' }} />
      <div className="vignette" aria-hidden="true" />
      <div className="progress" id="progress" aria-hidden="true" ref={progRef} />
    </>
  );
}
