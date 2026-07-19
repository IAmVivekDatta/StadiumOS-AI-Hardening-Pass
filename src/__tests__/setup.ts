import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock SpeechSynthesis
const speechMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  speakUtterance: vi.fn(),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: speechMock,
  writable: true,
});

// Mock SpeechSynthesisUtterance
class SpeechSynthesisUtteranceMock {
  text: string = '';
  lang: string = 'en';
  constructor(text: string) {
    this.text = text;
  }
}

Object.defineProperty(window, 'SpeechSynthesisUtterance', {
  value: SpeechSynthesisUtteranceMock,
  writable: true,
});

// Mock ResizeObserver (required for Recharts responsive container)
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  value: ResizeObserverMock,
  writable: true,
});

// Suppress known/expected warning and error logs during tests to keep stdout/stderr clean
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const msg = args[0]?.toString() || '';
  if (
    msg.includes('is unrecognized in this browser') ||
    msg.includes('is using incorrect casing') ||
    msg.includes('Gemini API Error') ||
    msg.includes('Failed to parse settings from local storage') ||
    msg.includes('Uncaught error inside ErrorBoundary') ||
    msg.includes('The above error occurred in the')
  ) {
    return;
  }
  originalConsoleError(...args);
};

const originalConsoleWarn = console.warn;
console.warn = (...args: unknown[]) => {
  const msg = args[0]?.toString() || '';
  if (
    msg.includes('is unrecognized in this browser') ||
    msg.includes('is using incorrect casing')
  ) {
    return;
  }
  originalConsoleWarn(...args);
};
