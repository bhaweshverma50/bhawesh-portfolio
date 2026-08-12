import { useTweaks } from './TweaksContext';
import { useIsTouch } from '../../hooks/useMediaQuery';
import { TweakRadio, TweakSection, TweakSelect, TweakToggle, type SelectOption } from './controls';
import type { CursorStyle, HeroFx, TransitionStyle, TransSpeed } from '../../types';

const HERO_FX: SelectOption[] = [
  { value: 'dots', label: 'Proximity dots' },
  { value: 'off', label: 'None (static)' },
];
const CURSORS: SelectOption[] = [
  { value: 'ring', label: 'Ring + dot' },
  { value: 'minimal', label: 'Minimal dot' },
  { value: 'off', label: 'System cursor' },
];
const TRANSITIONS: SelectOption[] = [
  { value: 'wipe', label: 'Wipe (vertical)' },
  { value: 'slide', label: 'Slide (horizontal)' },
  { value: 'fade', label: 'Fade' },
];

export function TweaksPanel() {
  const { tweaks, setTweak, reset, open, setOpen } = useTweaks();
  const isTouch = useIsTouch();
  if (!open || isTouch) return null;

  return (
    <div className="twk-panel" role="dialog" aria-label="Tweaks">
      <div className="twk-hd">
        <b>Tweaks</b>
        <button className="twk-x" aria-label="Close tweaks" onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>
      <div className="twk-body">
        <TweakSection label="Hero" />
        <TweakSelect label="Background effect" value={tweaks.heroFx} options={HERO_FX} onChange={(v) => setTweak('heroFx', v as HeroFx)} />

        <TweakSection label="Cursor" />
        <TweakSelect label="Style" value={tweaks.cursor} options={CURSORS} onChange={(v) => setTweak('cursor', v as CursorStyle)} />

        <TweakSection label="Page transition" />
        <TweakSelect label="Style" value={tweaks.transition} options={TRANSITIONS} onChange={(v) => setTweak('transition', v as TransitionStyle)} />
        <TweakRadio label="Speed" value={tweaks.transSpeed} options={['fast', 'normal', 'slow']} onChange={(v) => setTweak('transSpeed', v as TransSpeed)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="Motion" value={tweaks.motion} onChange={(v) => setTweak('motion', v)} />
        <TweakToggle label="Film grain" value={tweaks.grain} onChange={(v) => setTweak('grain', v)} />

        <button className="twk-x" style={{ alignSelf: 'flex-start', width: 'auto', padding: '0 6px', marginTop: 4 }} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
