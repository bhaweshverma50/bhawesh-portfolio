import { describe, it, expect } from 'vitest';
import { sanitizeRemote } from './sanitize';

describe('sanitizeRemote', () => {
  it('keeps shiki inline color styles', () => {
    const out = sanitizeRemote('<pre class="shiki" style="background-color:#24292e"><code><span style="color:#F97583">const</span></code></pre>');
    expect(out).toContain('style="color:#F97583"');
  });
  it('strips script tags', () => {
    expect(sanitizeRemote('<p>ok</p><script>alert(1)</script>')).not.toContain('<script');
  });
  it('preserves relative image paths and adds rel to external links', () => {
    const out = sanitizeRemote('<img src="/posts/x.svg"><a href="https://e.com">e</a>');
    expect(out).toContain('src="/posts/x.svg"');
    expect(out).toContain('rel="noopener noreferrer nofollow"');
  });
});
