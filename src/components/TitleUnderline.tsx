/** Self-drawing accent underline rendered beneath standalone page titles. */
export function TitleUnderline() {
  return (
    <svg className="title-underline" viewBox="0 0 440 14" preserveAspectRatio="none" aria-hidden="true">
      <path d="M3 9 Q 130 1 230 7 T 437 6" pathLength={1} />
    </svg>
  );
}
