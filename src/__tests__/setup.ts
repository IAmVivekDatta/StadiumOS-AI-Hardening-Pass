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
