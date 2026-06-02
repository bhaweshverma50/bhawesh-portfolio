import { useTweaks } from './TweaksContext';

export function TweaksFab() {
  const { toggle } = useTweaks();
  return (
    <button
      type="button"
      className="tweaks-fab"
      onClick={toggle}
      aria-label="Open the Tweaks panel to remix this site"
      title="Tweaks — remix the vibe (Shift + T)"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="3" y1="8" x2="9" y2="8" />
        <circle cx="13" cy="8" r="2.5" />
        <line x1="15.5" y1="8" x2="21" y2="8" />
        <line x1="3" y1="16" x2="11" y2="16" />
        <circle cx="15" cy="16" r="2.5" />
        <line x1="17.5" y1="16" x2="21" y2="16" />
      </svg>
      <span>Tweaks</span>
    </button>
  );
}
