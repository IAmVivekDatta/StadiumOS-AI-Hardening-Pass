import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsProvider, useSettings } from '../context/SettingsContext';

function TestSettingsComponent() {
  const { settings, setGeminiApiKey, setLanguage, setHighContrast } = useSettings();
  return (
    <div>
      <div data-testid="api-key">{settings.geminiApiKey || 'None'}</div>
      <div data-testid="language">{settings.language}</div>
      <div data-testid="high-contrast">{settings.highContrast ? 'Active' : 'Inactive'}</div>

      <button
        data-testid="btn-set-key"
        onClick={() => setGeminiApiKey('AIzaSyTestKey123')}
      >
        Set Key
      </button>

      <button
        data-testid="btn-set-es"
        onClick={() => setLanguage('es')}
      >
        Set ES
      </button>

      <button
        onClick={() => setHighContrast(!settings.highContrast)}
        data-testid="btn-toggle-contrast"
      >
        Toggle Contrast
      </button>
    </div>
  );
}

describe('Settings State Management', () => {
  it('loads initial settings and writes updates to localStorage', async () => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });

    render(
      <SettingsProvider>
        <TestSettingsComponent />
      </SettingsProvider>
    );

    expect(screen.getByTestId('api-key').textContent).toBe('None');
    expect(screen.getByTestId('language').textContent).toBe('en');
    expect(screen.getByTestId('high-contrast').textContent).toBe('Inactive');

    const setKeyBtn = screen.getByTestId('btn-set-key');
    const setEsBtn = screen.getByTestId('btn-set-es');
    const toggleContrastBtn = screen.getByTestId('btn-toggle-contrast');

    await act(async () => {
      setKeyBtn.click();
      setEsBtn.click();
      toggleContrastBtn.click();
    });

    expect(screen.getByTestId('api-key').textContent).toBe('AIzaSyTestKey123');
    expect(screen.getByTestId('language').textContent).toBe('es');
    expect(screen.getByTestId('high-contrast').textContent).toBe('Active');
  });
});
