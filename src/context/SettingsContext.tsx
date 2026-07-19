'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserSettings } from '../types';

interface SettingsContextProps {
  settings: UserSettings;
  setGeminiApiKey: (key: string) => void;
  setLanguage: (lang: string) => void;
  setAccessibilityMode: (enabled: boolean) => void;
  setFontSize: (size: 'normal' | 'large' | 'extra-large') => void;
  setSimpleLanguage: (enabled: boolean) => void;
  setHighContrast: (enabled: boolean) => void;
  setAudioReader: (enabled: boolean) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  language: 'en',
  accessibilityMode: false,
  fontSize: 'normal',
  simpleLanguage: false,
  highContrast: false,
  audioReader: false
};

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stadium_os_settings');
      if (stored) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        } catch (e) {
          console.error('Failed to parse settings from local storage', e);
        }
      }
    }
    return DEFAULT_SETTINGS;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const setGeminiApiKey = useCallback((key: string) => {
    setSettings((prev) => {
      const next = { ...prev, geminiApiKey: key };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setSettings((prev) => {
      const next = { ...prev, language: lang };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setAccessibilityMode = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, accessibilityMode: enabled };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setFontSize = useCallback((size: 'normal' | 'large' | 'extra-large') => {
    setSettings((prev) => {
      const next = { ...prev, fontSize: size };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setSimpleLanguage = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, simpleLanguage: enabled };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, highContrast: enabled };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const setAudioReader = useCallback((enabled: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, audioReader: enabled };
      localStorage.setItem('stadium_os_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(() => {
      localStorage.setItem('stadium_os_settings', JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    });
  }, []);

  // Prevent hydration flash by rendering children only after mounting on the client
  return (
    <SettingsContext.Provider
      value={{
        settings,
        setGeminiApiKey,
        setLanguage,
        setAccessibilityMode,
        setFontSize,
        setSimpleLanguage,
        setHighContrast,
        setAudioReader,
        resetSettings
      }}
    >
      {mounted ? children : <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading settings...</div>}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
