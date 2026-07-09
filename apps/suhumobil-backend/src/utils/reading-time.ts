/**
 * Estimate reading time in minutes from HTML content.
 * Strips tags, counts words, divides by average reading speed (200 wpm),
 * rounds up, minimum 1 minute.
 */
export function estimateReadingTimeMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return Math.max(1, minutes);
}
