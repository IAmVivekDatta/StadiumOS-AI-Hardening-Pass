import { useState, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export function useSettingsModal() {
  const { settings, setGeminiApiKey } = useSettings();
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');

  const handleOpenSettings = useCallback(() => {
    setTempApiKey(settings.geminiApiKey);
    setShowSettings(true);
  }, [settings.geminiApiKey]);

  const handleSaveSettings = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempApiKey);
    setShowSettings(false);
  }, [tempApiKey, setGeminiApiKey]);

  const handleClearKey = useCallback(() => {
    setTempApiKey('');
    setGeminiApiKey('');
  }, [setGeminiApiKey]);

  return {
    showSettings,
    setShowSettings,
    tempApiKey,
    setTempApiKey,
    settings,
    handleOpenSettings,
    handleSaveSettings,
    handleClearKey
  };
}
