import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { SocialLink } from './social';
import { SOCIALS } from '../config/site';

describe('SocialLink', () => {
  const configured = SOCIALS.find((s) => s.url);

  it('renders a configured link that opens safely in a new tab', () => {
    if (!configured) return; // nothing configured — skip
    const { container } = render(<SocialLink k={configured.key} />);
    const a = container.querySelector('a');
    expect(a).not.toBeNull();
    expect(a).toHaveAttribute('href', configured.url);
    expect(a).toHaveAttribute('target', '_blank');
    expect(a?.getAttribute('rel')).toContain('noopener');
  });

  it('renders nothing for an unknown / unconfigured key', () => {
    const { container } = render(<SocialLink k="definitely-not-a-key" />);
    expect(container).toBeEmptyDOMElement();
  });
});
