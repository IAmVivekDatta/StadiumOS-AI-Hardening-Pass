/**
 * Centralized Security Utilities for StadiumOS AI
 */

/**
 * Escapes HTML characters to prevent XSS (Cross-Site Scripting) and HTML Injection.
 * Useful for chat queries, volunteer task creation, and emergency broadcasts.
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates Gemini API Key format.
 * Expected pattern: Starts with "AIzaSy" followed by 33 URL-safe base64 characters.
 */
export function isValidGeminiApiKey(key: string): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (trimmed === '') return false;
  
  // Google API keys are usually 39 chars long and start with AIzaSy
  const apiPattern = /^AIzaSy[A-Za-z0-9_-]{33}$/;
  return apiPattern.test(trimmed);
}

/**
 * Redacts any sensitive Google API key patterns from text to prevent leakage in error output or console logs.
 */
export function redactSecrets(text: string): string {
  if (!text) return '';
  // Match API keys starting with AIzaSy followed by characters
  return text.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, '[REDACTED_API_KEY]');
}
