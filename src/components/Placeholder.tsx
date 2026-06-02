/** Striped placeholder used where a real image/screenshot would go. */
export function Placeholder({ label, alt, className }: { label: string; alt?: string; className?: string }) {
  return (
    <div
      className={'ph' + (className ? ' ' + className : '')}
      {...(alt ? { role: 'img', 'aria-label': alt } : {})}
    >
      {label}
    </div>
  );
}

/** Small tag-pill list reused across cards and detail pages. */
export function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="feat-tags">
      {tags.map((t) => (
        <span className="tag" key={t}>
          {t}
        </span>
      ))}
    </div>
  );
}
