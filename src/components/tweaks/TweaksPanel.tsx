import { useTweaks } from './TweaksContext';
import { TweakRadio, TweakSection, TweakSelect, TweakToggle, type SelectOption } from './controls';
import type { ClickFx, CursorStyle, HeroMode, Holo, TextFx, TransitionStyle, TransSpeed } from '../../types';

const HERO_MODES: SelectOption[] = [
  { value: 'dots', label: 'Proximity dots' },
  { value: 'weight', label: 'Variable weight' },
  { value: 'tilt', label: '3D tilt lines' },
  { value: 'magnet', label: 'Magnetic letters' },
  { value: 'off', label: 'None (static)' },
];
const CURSORS: SelectOption[] = [
  { value: 'ring', label: 'Ring' },
  { value: 'glow', label: 'Glow blob' },
  { value: 'crosshair', label: 'Crosshair' },
  { value: 'spotlight', label: 'Spotlight' },
];
const CLICK_FX: SelectOption[] = [
  { value: 'ripple', label: 'Ripple' },
  { value: 'particles', label: 'Particles' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'off', label: 'Off' },
];
const HOLO: SelectOption[] = [
  { value: 'off', label: 'Off' },
  { value: 'sheen', label: 'Cursor sheen' },
  { value: 'aurora', label: 'Aurora drift' },
  { value: 'mesh', label: 'Canvas mesh' },
];
const TEXT_FX: SelectOption[] = [
  { value: 'off', label: 'Off' },
  { value: 'chromatic', label: 'Chromatic aberration' },
  { value: 'holo', label: 'Holographic shine' },
  { value: 'glitch', label: 'Glitch on hover' },
  { value: 'scrollhue', label: 'Scroll hue-shift' },
];
const TRANSITIONS: SelectOption[] = [
  { value: 'wipe', label: 'Wipe (vertical)' },
  { value: 'slide', label: 'Slide (horizontal)' },
  { value: 'fade', label: 'Fade' },
];

export function TweaksPanel() {
  const { tweaks, setTweak, reset, open, setOpen } = useTweaks();
  if (!open) return null;

  return (
    <div className="twk-panel" role="dialog" aria-label="Tweaks">
      <div className="twk-hd">
        <b>Tweaks</b>
        <button className="twk-x" aria-label="Close tweaks" onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>
      <div className="twk-body">
        <TweakSection label="Hero interaction" />
        <TweakSelect label="Cursor effect" value={tweaks.heroMode} options={HERO_MODES} onChange={(v) => setTweak('heroMode', v as HeroMode)} />

        <TweakSection label="Cursor" />
        <TweakSelect label="Style" value={tweaks.cursor} options={CURSORS} onChange={(v) => setTweak('cursor', v as CursorStyle)} />
        <TweakToggle label="Cursor trail" value={tweaks.trail} onChange={(v) => setTweak('trail', v)} />

        <TweakSection label="Click effect" />
        <TweakSelect label="On click" value={tweaks.clickFx} options={CLICK_FX} onChange={(v) => setTweak('clickFx', v as ClickFx)} />

        <TweakSection label="Holographic" />
        <TweakSelect label="Color FX" value={tweaks.holo} options={HOLO} onChange={(v) => setTweak('holo', v as Holo)} />

        <TweakSection label="Text effect" />
        <TweakSelect label="Headings" value={tweaks.textFx} options={TEXT_FX} onChange={(v) => setTweak('textFx', v as TextFx)} />

        <TweakSection label="Page transition" />
        <TweakSelect label="Style" value={tweaks.transition} options={TRANSITIONS} onChange={(v) => setTweak('transition', v as TransitionStyle)} />
        <TweakRadio label="Speed" value={tweaks.transSpeed} options={['fast', 'normal', 'slow']} onChange={(v) => setTweak('transSpeed', v as TransSpeed)} />

        <TweakSection label="Atmosphere" />
        <TweakToggle label="SVG accents" value={tweaks.svgFx} onChange={(v) => setTweak('svgFx', v)} />
        <TweakToggle label="Film grain" value={tweaks.grain} onChange={(v) => setTweak('grain', v)} />

        <button className="twk-x" style={{ alignSelf: 'flex-start', width: 'auto', padding: '0 6px', marginTop: 4 }} onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
