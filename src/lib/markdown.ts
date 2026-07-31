const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]!);
}

/**
 * A deliberately tiny renderer for the `full_description` fields, which only use
 * **bold**, _italic_ and blank-line paragraph breaks. Not a general markdown
 * parser — reach for a real one if the copy ever needs links, lists or headings.
 *
 * Input is escaped before any markup is added, so author text can never inject
 * HTML through this path.
 */
export function renderRichText(source: string): string {
  return source
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const html = escapeHtml(block)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        .replace(/\n/g, "<br />");

      return `<p>${html}</p>`;
    })
    .join("");
}
