import { Marked, type Tokens } from 'marked';
import markedShiki from 'marked-shiki';
import { createHighlighter, type Highlighter } from 'shiki';

const THEME = 'github-dark';
const LANGS = [
  'ts', 'tsx', 'js', 'jsx', 'json', 'bash', 'sh', 'html', 'css',
  'python', 'go', 'rust', 'sql', 'yaml', 'md', 'diff', 'swift', 'dart',
];

export interface Renderer {
  render(markdown: string): Promise<string>;
}

/** Build a reusable markdown→HTML renderer. shiki highlights at build time
 *  (inline styles, no client JS). Create ONCE and reuse across files. */
export async function createRenderer(): Promise<Renderer> {
  const highlighter: Highlighter = await createHighlighter({ themes: [THEME], langs: LANGS });
  const loaded = new Set(highlighter.getLoadedLanguages());

  const marked = new Marked()
    .use({
      gfm: true,
      renderer: {
        link(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, { href, title, tokens }: Tokens.Link) {
          const text = this.parser.parseInline(tokens);
          const t = title ? ` title="${title}"` : '';
          const external = /^https?:\/\//i.test(href);
          const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
          return `<a href="${href}"${t}${attrs}>${text}</a>`;
        },
      },
    })
    .use(
      markedShiki({
        highlight(code: string, lang: string) {
          const language = lang && loaded.has(lang) ? lang : 'text';
          return highlighter.codeToHtml(code, { lang: language, theme: THEME });
        },
      }),
    );

  return { render: (md: string) => marked.parse(md) as Promise<string> };
}
