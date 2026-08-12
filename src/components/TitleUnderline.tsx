/** Terminal-style marker beneath standalone page titles: a short accent rule
 *  and a caret tick. (Replaces the old self-drawing SVG squiggle.) */
export function TitleUnderline() {
  return (
    <div className="title-marker" aria-hidden="true">
      <span className="bar" />
      <span className="tick">▮</span>
    </div>
  );
}
