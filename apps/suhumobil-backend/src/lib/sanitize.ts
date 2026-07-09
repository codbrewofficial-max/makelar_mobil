import sanitizeHtml from "sanitize-html";

/**
 * Sanitize rich text HTML coming from TipTap editor before persisting to DB.
 * Whitelist per 00-development-rules.md section 34.
 */
export function sanitizeRichText(dirty: string): string {
  return sanitizeHtml(dirty, {
    allowedTags: [
      "p", "h1", "h2", "h3", "strong", "em", "ul", "ol", "li",
      "blockquote", "a", "img", "code", "pre", "br",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
  });
}
