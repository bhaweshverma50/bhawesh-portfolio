import { describe, it, expect } from 'vitest';
import { readingTime } from './readingTime';

describe('readingTime', () => {
  it('floors at 1 minute for short/empty input', () => {
    expect(readingTime('')).toBe('1 min');
    expect(readingTime('a few words here')).toBe('1 min');
  });
  it('estimates ~200 wpm', () => {
    const words = Array.from({ length: 400 }, () => 'word').join(' ');
    expect(readingTime(words)).toBe('2 min');
  });
  it('ignores fenced code and image markup', () => {
    const md = '```ts\n' + Array.from({ length: 400 }, () => 'x').join('\n') + '\n```\nhello world';
    expect(readingTime(md)).toBe('1 min');
  });
});
