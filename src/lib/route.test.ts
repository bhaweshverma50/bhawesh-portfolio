import { describe, expect, it } from 'vitest';
import { routeKeyOf, slugOf } from './route';

describe('routeKeyOf', () => {
  it('maps base paths to route keys', () => {
    expect(routeKeyOf('/')).toBe('home');
    expect(routeKeyOf('')).toBe('home');
    expect(routeKeyOf('/work')).toBe('work');
    expect(routeKeyOf('/blog')).toBe('blog');
    expect(routeKeyOf('/contact')).toBe('contact');
  });

  it('maps dynamic detail paths', () => {
    expect(routeKeyOf('/project/synthwave')).toBe('project');
    expect(routeKeyOf('/post/motion-meaning')).toBe('post');
  });

  it('falls back to home for unknown paths', () => {
    expect(routeKeyOf('/nonsense')).toBe('home');
  });
});

describe('slugOf', () => {
  it('extracts the slug from detail paths', () => {
    expect(slugOf('/project/cortex')).toBe('cortex');
    expect(slugOf('/post/poc-weekend')).toBe('poc-weekend');
  });
  it('returns undefined for non-detail paths', () => {
    expect(slugOf('/work')).toBeUndefined();
    expect(slugOf('/')).toBeUndefined();
  });
});
