'use client';

import React from 'react';
import { KeyRound, Info } from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  tempApiKey: string;
  setTempApiKey: (key: string) => void;
  settings: UserSettings;
  handleSaveSettings: (e: React.FormEvent) => void;
  handleClearKey: () => void;
}

export default function SettingsModal({
  showSettings,
  setShowSettings,
  tempApiKey,
  setTempApiKey,
  settings,
  handleSaveSettings,
  handleClearKey
}: SettingsModalProps) {
  if (!showSettings) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-850 rounded-xl p-6 w-full max-w-md space-y-5 shadow-2xl animate-scale-pulse">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-indigo-400" />
            Configure Operational Keys
          </h3>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-neutral-500 hover:text-white font-bold"
            aria-label="Close settings"
            id="btn-close-settings-modal"
          >
            ×
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-normal">
          Input your Gemini API key below. The key is kept **only** in your browser&apos;s local storage and is never sent to a server.
        </p>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex justify-between items-center">
              <span>Gemini API Key</span>
              {settings.geminiApiKey && (
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Configured</span>
              )}
            </label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Paste your AIzaSy... API key"
              className="w-full mt-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
              id="input-gemini-key"
            />
          </div>

          {/* Security Banner */}
          <div className="bg-neutral-950 border border-neutral-850 p-3 rounded-lg text-[10px] text-neutral-500 flex gap-2">
            <Info className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
            <span>
              <strong>Strict Security:</strong> The key connects directly client-to-API. If left empty, local AI simulation scripts will response with static telemetry summaries.
            </span>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={handleClearKey}
              className="mr-auto text-[10px] text-red-400 hover:underline"
              id="btn-clear-key"
            >
              Clear Key
            </button>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="px-3.5 py-2 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition-colors"
              id="btn-save-key-settings"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
