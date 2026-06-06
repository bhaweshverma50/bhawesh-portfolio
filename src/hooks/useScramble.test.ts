import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScramble } from './useScramble';

const PHRASES = ['AI systems', 'pipelines', 'native apps'];

describe('useScramble', () => {
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

  it('renders the first phrase immediately', () => {
    const { result } = renderHook(() => useScramble(PHRASES, false));
    expect(result.current).toBe('AI systems');
  });

  it('stays static when reduced motion is on', () => {
    const { result } = renderHook(() => useScramble(PHRASES, true));
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    expect(result.current).toBe('AI systems');
  });

  it('resolves to the next phrase after the start delay and scramble', () => {
    const { result } = renderHook(() => useScramble(PHRASES, false));
    act(() => {
      vi.advanceTimersByTime(3500 + 700 + 100); // startDelay + scramble + slack
    });
    expect(result.current).toBe('pipelines');
  });

  it('keeps cycling through the list', () => {
    const { result } = renderHook(() => useScramble(PHRASES, false));
    act(() => {
      vi.advanceTimersByTime(3500 + 700 + 100); // -> pipelines
      vi.advanceTimersByTime(3000 + 700 + 100); // hold -> native apps
    });
    expect(result.current).toBe('native apps');
  });
});
