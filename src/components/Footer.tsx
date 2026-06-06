import type { ReactNode } from 'react';
import { useClock } from '../hooks/useClock';
import { SITE } from '../config/site';

export function Footer({ children }: { children?: ReactNode }) {
  const clock = useClock();
  return (
    <div className="footer">
      <span>
        © {SITE.year} {SITE.name} | {SITE.role}
      </span>
      <span>{children ?? 'Designed & built with intent'}</span>
      <span>{clock}</span>
    </div>
  );
}
