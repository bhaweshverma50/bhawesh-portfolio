import sanitizeHtml from 'sanitize-html';

const HEX_RGB_VAR = [/^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/, /^rgba?\(/, /^var\(--/];

/** Sanitize HTML produced by marked+shiki for REMOTE (untrusted) markdown. */
export function sanitizeRemote(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'strong', 'em', 'b', 'i', 's', 'del', 'code',
      'ul', 'ol', 'li', 'blockquote', 'hr', 'br', 'img',
      'pre', 'span', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      span: ['style', 'class'],
      pre: ['style', 'class', 'tabindex'],
      code: ['style', 'class'],
      '*': ['class'],
    },
    allowedStyles: {
      '*': {
        color: HEX_RGB_VAR,
        'background-color': HEX_RGB_VAR,
        'font-style': [/^italic$/, /^normal$/],
        'font-weight': [/^bold$/, /^\d{3}$/, /^normal$/],
        'text-decoration': [/^underline$/, /^line-through$/, /^none$/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { a: ['http', 'https', 'mailto', 'tel'], img: ['http', 'https'] },
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href || '');
        return {
          tagName,
          attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer nofollow' } : attribs,
        };
      },
    },
  });
}
