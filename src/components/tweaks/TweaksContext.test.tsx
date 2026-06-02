import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TweaksProvider, useTweaks } from './TweaksContext';

function Probe() {
  const { tweaks, setTweak, open, toggle } = useTweaks();
  return (
    <div>
      <span data-testid="hero">{tweaks.heroMode}</span>
      <span data-testid="open">{open ? 'open' : 'closed'}</span>
      <button onClick={() => setTweak('heroMode', 'magnet')}>set</button>
      <button onClick={toggle}>toggle</button>
    </div>
  );
}

describe('TweaksProvider', () => {
  beforeEach(() => localStorage.clear());

  it('exposes defaults and updates + persists a tweak', async () => {
    const user = userEvent.setup();
    render(
      <TweaksProvider>
        <Probe />
      </TweaksProvider>,
    );
    expect(screen.getByTestId('hero')).toHaveTextContent('dots');
    await user.click(screen.getByText('set'));
    expect(screen.getByTestId('hero')).toHaveTextContent('magnet');
    expect(localStorage.getItem('bhawesh-tweaks')).toContain('magnet');
  });

  it('toggles the panel open state', async () => {
    const user = userEvent.setup();
    render(
      <TweaksProvider>
        <Probe />
      </TweaksProvider>,
    );
    expect(screen.getByTestId('open')).toHaveTextContent('closed');
    await user.click(screen.getByText('toggle'));
    expect(screen.getByTestId('open')).toHaveTextContent('open');
    expect(document.body.classList.contains('tweaks-open')).toBe(true);
  });

  it('reflects CSS data attributes on mount', () => {
    render(
      <TweaksProvider>
        <Probe />
      </TweaksProvider>,
    );
    expect(document.body.getAttribute('data-textfx')).toBe('off');
    expect(document.body.getAttribute('data-svgfx')).toBe('on');
    expect(document.documentElement.getAttribute('data-hero-mode')).toBe('dots');
  });
});
