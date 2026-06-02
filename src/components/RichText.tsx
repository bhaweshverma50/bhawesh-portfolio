import type { ElementType } from 'react';

/** Renders a copy string that may contain simple inline HTML (<b>, <em>, <br>).
 *  Content is author-controlled (from the data files), so this is safe. */
export function RichText({
  html,
  as,
  className,
}: {
  html: string;
  as?: ElementType;
  className?: string;
}) {
  const Tag = as ?? 'p';
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
