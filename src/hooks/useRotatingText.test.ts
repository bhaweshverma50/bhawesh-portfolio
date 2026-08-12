import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRotatingText } from './useRotatingText';
import type { RefObject } from 'react';

const PHRASES = ['AI systems', 'pipelines', 'native apps'];

function makeRef(): RefObject<HTMLElement> {
  const el = document.createElement('span');
  el.textContent = PHRASES[0];
  return { current: el };
}

describe('useRotatingText', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'performance'] });
    // drive requestAnimationFrame off the fake timer clock
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) =>
      setTimeout(() => cb(performance.now()), 16) as unknown as number);
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('sets the first phrase immediately', () => {
    const ref = makeRef();
    renderHook(() => useRotatingText(ref, PHRASES, true));
    expect(ref.current?.textContent).toBe('AI systems');
  });

  it('stays static when disabled', () => {
    const ref = makeRef();
    renderHook(() => useRotatingText(ref, PHRASES, false));
    vi.advanceTimersByTime(20_000);
    expect(ref.current?.textContent).toBe('AI systems');
  });

  it('resolves to the next phrase after the start delay and scramble', () => {
    const ref = makeRef();
    renderHook(() => useRotatingText(ref, PHRASES, true));
    vi.advanceTimersByTime(2600 + 640 + 100); // startDelay + scramble + slack
    expect(ref.current?.textContent).toBe('pipelines');
  });

  it('keeps cycling through the list', () => {
    const ref = makeRef();
    renderHook(() => useRotatingText(ref, PHRASES, true));
    vi.advanceTimersByTime(2600 + 640 + 100); // -> pipelines
    vi.advanceTimersByTime(2600 + 640 + 100); // hold -> native apps
    expect(ref.current?.textContent).toBe('native apps');
  });
});
