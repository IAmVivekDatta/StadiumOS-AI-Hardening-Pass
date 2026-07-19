import { describe, it, expect } from 'vitest';
import { sanitizeInput, isValidGeminiApiKey, redactSecrets } from '../services/securityUtils';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should encode HTML tags and special characters to prevent XSS/HTML Injection', () => {
      const input = '<script>alert("XSS")</script>';
      const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should encode ampersands and single quotes', () => {
      const input = "Tom & Jerry's";
      const expected = 'Tom &amp; Jerry&#x27;s';
      expect(sanitizeInput(input)).toBe(expected);
    });

    it('should return an empty string for empty inputs', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput(null as unknown as string)).toBe('');
    });
  });

  describe('isValidGeminiApiKey', () => {
    it('should validate a correctly formatted Gemini API key', () => {
      const validKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q'; // AIzaSy + 33 chars = 39 total
      expect(isValidGeminiApiKey(validKey)).toBe(true);
    });

    it('should validate a key with leading/trailing whitespaces', () => {
      const validKeyWithSpaces = '  AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q  ';
      expect(isValidGeminiApiKey(validKeyWithSpaces)).toBe(true);
    });

    it('should reject keys that are too short or long', () => {
      expect(isValidGeminiApiKey('AIzaSy')).toBe(false);
      expect(isValidGeminiApiKey('AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q_extra')).toBe(false);
    });

    it('should reject keys that do not start with AIzaSy', () => {
      expect(isValidGeminiApiKey('BIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q')).toBe(false);
    });

    it('should reject empty or invalid values', () => {
      expect(isValidGeminiApiKey('')).toBe(false);
      expect(isValidGeminiApiKey(null as unknown as string)).toBe(false);
    });
  });

  describe('redactSecrets', () => {
    it('should redact any valid API keys from strings', () => {
      const validKey = 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q';
      const text = `Failed to fetch: key ${validKey} was invalid.`;
      const expected = 'Failed to fetch: key [REDACTED_API_KEY] was invalid.';
      expect(redactSecrets(text)).toBe(expected);
    });

    it('should not redact strings that look close but are invalid', () => {
      const closeKey = 'AIzaSyShort';
      expect(redactSecrets(closeKey)).toBe(closeKey);
    });

    it('should return empty string for empty inputs', () => {
      expect(redactSecrets('')).toBe('');
      expect(redactSecrets(null as unknown as string)).toBe('');
    });
  });
});
