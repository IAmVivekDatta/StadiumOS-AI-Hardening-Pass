'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSettings } from '../context/SettingsContext';
import { useOperations } from '../context/OperationsContext';
import StadiumMap from '../features/live-map/StadiumMap';
import AIChat from '../features/command-center/AIChat';
import OperationsDashboard from '../features/operations/OperationsDashboard';
import VolunteerTasks from '../features/volunteer/VolunteerTasks';
import AccessibilityPanel from '../features/accessibility/AccessibilityPanel';
import TransportPlanner from '../features/transport/TransportPlanner';
import { ErrorBoundary } from '../components/ErrorBoundary';

const PredictionChart = dynamic(() => import('../features/crowd-prediction/PredictionChart'), { ssr: false });

import { 
  Settings as SettingsIcon, 
  ShieldAlert, 
  RefreshCw,
  Info,
  KeyRound
} from 'lucide-react';

export default function Home() {
  const { settings, setGeminiApiKey } = useSettings();
  const { state, simulateStateTick, clearAlerts } = useOperations();
  const [showSettings, setShowSettings] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(settings.geminiApiKey);
  const [mapRoute, setMapRoute] = useState<'none' | 'wheelchair' | 'family' | 'senior' | 'vision'>('none');

  const handleSaveSettings = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(tempApiKey);
    setShowSettings(false);
  }, [tempApiKey, setGeminiApiKey]);

  const handleClearKey = useCallback(() => {
    setTempApiKey('');
    setGeminiApiKey('');
  }, [setGeminiApiKey]);

  // Determine global wrapper classes based on accessibility configuration
  const wrapperClass = `min-h-screen text-white font-sans transition-colors duration-300 ${
    settings.highContrast ? 'high-contrast bg-black' : 'bg-neutral-950'
  } text-scale-${settings.fontSize}`;

  return (
    <div className={wrapperClass} id="root-app-container">
      
      {/* Top Banner (Active Broadcasts) */}
      {state.activeAlerts.length > 0 && (
        <div className="bg-red-600/90 border-b border-red-700 text-white py-2 px-4 text-xs font-semibold text-center flex items-center justify-center gap-2 relative z-40 animate-fade-in" id="global-broadcast-banner">
          <ShieldAlert className="w-4 h-4 animate-bounce" />
          <span>BROADCAST ALERT: {state.activeAlerts[0]}</span>
          <button 
            onClick={clearAlerts}
            className="underline hover:text-neutral-250 ml-3 text-[10px]"
            id="btn-dismiss-top-alert"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Layout Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="bg-white text-black p-1.5 rounded-lg flex items-center justify-center font-black text-xs tracking-tighter">
              OS
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-white">StadiumOS AI</h1>
                <span className="text-[9px] bg-neutral-800 text-neutral-400 border border-neutral-750 px-1.5 py-0.5 rounded-full font-medium">
                  FIFA 2026
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 font-medium">
                USA · Canada · Mexico Smart Arena Hub
              </p>
            </div>
          </div>

          {/* Actions & Settings Toggles */}
          <div className="flex items-center gap-3">
            {/* Simulation Pulse */}
            <button
              onClick={simulateStateTick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 hover:text-white transition-colors"
              title="Manually simulate a live telemetry update tick"
              id="btn-simulate-tick"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Simulate Telemetry Tick</span>
            </button>

            {/* Config Panel Trigger */}
            <button
              onClick={() => {
                setTempApiKey(settings.geminiApiKey);
                setShowSettings(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 hover:text-white transition-colors"
              id="btn-header-settings"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Setup Key</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Grid Deck */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SECTION (5 columns): Live Map and Accessibility */}
          <div className="lg:col-span-5 space-y-6">
            <ErrorBoundary fallbackTitle="Stadium Map Telemetry Error">
              <StadiumMap routeType={mapRoute} />
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Accessibility Panel Error">
              <AccessibilityPanel mapRouteType={mapRoute} setMapRouteType={setMapRoute} />
            </ErrorBoundary>
          </div>

          {/* MIDDLE SECTION (4 columns): AI Chat and Transport */}
          <div className="lg:col-span-4 space-y-6">
            <ErrorBoundary fallbackTitle="AI Command Center Error">
              <AIChat onOpenSettings={() => setShowSettings(true)} />
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Transport Assistant Error">
              <TransportPlanner />
            </ErrorBoundary>
          </div>

          {/* RIGHT SECTION (3 columns): Dashboards & Prediction */}
          <div className="lg:col-span-3 space-y-6">
            <ErrorBoundary fallbackTitle="Wait-Time Forecast Error">
              <PredictionChart />
            </ErrorBoundary>
            <ErrorBoundary fallbackTitle="Volunteer Dispatch Error">
              <VolunteerTasks />
            </ErrorBoundary>
          </div>

        </div>

        {/* Extended Operations console row below the fold */}
        <div className="mt-6">
          <ErrorBoundary fallbackTitle="Operations Dashboard Error">
            <OperationsDashboard />
          </ErrorBoundary>
        </div>
      </main>

      {/* Settings Dialog Overlay */}
      {showSettings && (
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
      )}

      {/* Simple accessibility audio player target */}
      <div id="audio-reader-target" className="sr-only" aria-live="assertive"></div>
      
    </div>
  );
}
