/* Auto-fetch sources for the writing section. The portfolio is the canonical
   home; these mirror posts you publish elsewhere. Uncomment + set your handle
   once you start publishing. LinkedIn has no public read API — use a post's
   `links:` frontmatter to add an "Also on LinkedIn ↗" button instead. */

export type Source =
  | { type: 'devto'; user: string }
  | { type: 'hashnode'; host: string }
  | { type: 'medium'; user: string };

export const SOURCES: Source[] = [
  // { type: 'devto', user: 'your-devto-username' },
  // { type: 'hashnode', host: 'yourblog.hashnode.dev' },  // adapter: TODO
  // { type: 'medium', user: 'yourhandle' },               // adapter: TODO (RSS, build-time)
];
