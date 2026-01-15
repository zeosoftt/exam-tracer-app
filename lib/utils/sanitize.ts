/**
 * XSS Protection - Output Escaping
 * Sanitize user input before displaying
 */

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function sanitizeInput(input: string): string {
  return escapeHtml(input.trim());
}
