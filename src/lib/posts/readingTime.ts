const WORDS_PER_MIN = 200;

/** Rough reading-time estimate from markdown, ignoring code fences + image syntax. */
export function readingTime(markdown: string): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_`~]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.round(words / WORDS_PER_MIN));
  return `${mins} min`;
}
