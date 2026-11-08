import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function renderMarkdown(markdown: string): string {
  // Pre-process ADR references into standard markdown links if not already linked
  const resolved = markdown.replace(/\[(ADR-\d{4})\](?!\()/g, (_match, p1) => {
    return `[${p1}](/docs/release-contract#${p1.toLowerCase()})`;
  });

  const rawHtml = marked.parse(resolved, {
    gfm: true,
    breaks: false
  }) as string;

  const cleanHtml = sanitizeHtml(rawHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'span', 'pre', 'code',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'hr'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'a': ['href', 'title', 'target', 'rel', 'class'],
      'code': ['class'],
      'span': ['class'],
      'th': ['align', 'class'],
      'td': ['align', 'class'],
      'table': ['class']
    },
    transformTags: {
      'a': (tagName, attribs) => {
        // Ensure external links open securely, internal links remain in-app
        if (attribs.href && attribs.href.startsWith('http')) {
          attribs.target = '_blank';
          attribs.rel = 'noopener noreferrer';
        }
        return {
          tagName,
          attribs
        };
      }
    }
  });

  return cleanHtml;
}

