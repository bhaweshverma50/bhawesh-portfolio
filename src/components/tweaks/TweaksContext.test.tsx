import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TweaksProvider, useTweaks } from './TweaksContext';

function Probe() {
  const { tweaks, setTweak, open, toggle } = useTweaks();
  return (
    <div>
      <span data-testid="hero">{tweaks.heroFx}</span>
      <span data-testid="motion">{tweaks.motion ? 'on' : 'off'}</span>
      <span data-testid="open">{open ? 'open' : 'closed'}</span>
      <button onClick={() => setTweak('heroFx', 'off')}>set</button>
      <button onClick={() => setTweak('motion', false)}>motion-off</button>
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
    expect(screen.getByTestId('hero')).toHaveTextContent('off');
    expect(localStorage.getItem('bhawesh-tweaks')).toContain('off');
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

  it('does not flag motion-off on mount with default tweaks', () => {
    render(
      <TweaksProvider>
        <Probe />
      </TweaksProvider>,
    );
    expect(document.body.classList.contains('motion-off')).toBe(false);
  });

  it('adds the motion-off body class when motion is disabled', async () => {
    const user = userEvent.setup();
    render(
      <TweaksProvider>
        <Probe />
      </TweaksProvider>,
    );
    expect(document.body.classList.contains('motion-off')).toBe(false);
    await user.click(screen.getByText('motion-off'));
    expect(document.body.classList.contains('motion-off')).toBe(true);
  });
});
