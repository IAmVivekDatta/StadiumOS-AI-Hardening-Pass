'use client';

import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { 
  Type, 
  Eye, 
  Sparkles, 
  Volume2, 
  Accessibility,
  Heart,
  Baby,
  Users
} from 'lucide-react';

interface AccessibilityPanelProps {
  mapRouteType: 'none' | 'wheelchair' | 'family' | 'senior' | 'vision';
  setMapRouteType: (type: 'none' | 'wheelchair' | 'family' | 'senior' | 'vision') => void;
}

export default function AccessibilityPanel({ mapRouteType, setMapRouteType }: AccessibilityPanelProps) {
  const { 
    settings, 
    setFontSize, 
    setHighContrast, 
    setSimpleLanguage, 
    setAudioReader,
    setAccessibilityMode
  } = useSettings();

  const routeOptions = [
    { id: 'none', label: 'Standard Route', icon: Users, color: 'text-neutral-400' },
    { id: 'wheelchair', label: 'Wheelchair Ramp Path', icon: Accessibility, color: 'text-blue-400' },
    { id: 'family', label: 'Family & Stroller Path', icon: Baby, color: 'text-emerald-400' },
    { id: 'senior', label: 'Senior Citizen Path (No Stairs)', icon: Heart, color: 'text-amber-400' },
    { id: 'vision', label: 'Low Vision Guided Path', icon: Eye, color: 'text-purple-400' }
  ] as const;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-indigo-400" />
          Accessibility Hub
        </h2>
        <p className="text-xs text-neutral-400 mt-1">
          Customize your dashboard experience and find optimal navigation routes.
        </p>
      </div>

      {/* Interface Settings */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Dashboard Styling</h3>
        
        <div className="grid grid-cols-2 gap-3">
          {/* High Contrast */}
          <button
            onClick={() => setHighContrast(!settings.highContrast)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between h-20 ${
              settings.highContrast 
                ? 'bg-white text-black border-white' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
            }`}
            aria-pressed={settings.highContrast}
            id="btn-high-contrast"
          >
            <Eye className="w-4 h-4" />
            <span className="text-xs font-medium">High Contrast</span>
          </button>

          {/* Simple Language */}
          <button
            onClick={() => setSimpleLanguage(!settings.simpleLanguage)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between h-20 ${
              settings.simpleLanguage 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
            }`}
            aria-pressed={settings.simpleLanguage}
            id="btn-simple-lang"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium">Simple English</span>
          </button>

          {/* Audio Reader */}
          <button
            onClick={() => setAudioReader(!settings.audioReader)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between h-20 ${
              settings.audioReader 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
            }`}
            aria-pressed={settings.audioReader}
            id="btn-audio-reader"
          >
            <Volume2 className="w-4 h-4" />
            <span className="text-xs font-medium">Audio Guide</span>
          </button>

          {/* Accessibility Mode Toggle */}
          <button
            onClick={() => setAccessibilityMode(!settings.accessibilityMode)}
            className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between h-20 ${
              settings.accessibilityMode 
                ? 'bg-indigo-600 border-indigo-500 text-white' 
                : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600'
            }`}
            aria-pressed={settings.accessibilityMode}
            id="btn-accessible-mode"
          >
            <Accessibility className="w-4 h-4" />
            <span className="text-xs font-medium">Optimize UI</span>
          </button>
        </div>

        {/* Font Size Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Font Size
          </label>
          <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {(['normal', 'large', 'extra-large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`py-1.5 text-xs font-medium capitalize rounded-md transition-all ${
                  settings.fontSize === size 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                id={`btn-font-${size}`}
              >
                {size === 'normal' ? 'AA' : size === 'large' ? 'AA+' : 'AAA'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <hr className="border-neutral-800" />

      {/* Map Guiding Routes */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Map Navigational Overlay</h3>
        <div className="space-y-2">
          {routeOptions.map((opt) => {
            const IconComponent = opt.icon;
            const active = mapRouteType === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setMapRouteType(opt.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left ${
                  active 
                    ? 'bg-neutral-800/80 border-indigo-500/50 text-white shadow-sm' 
                    : 'bg-neutral-950/40 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
                aria-pressed={active}
                id={`btn-route-${opt.id}`}
              >
                <div className={`p-1.5 rounded-md bg-neutral-900 border border-neutral-800 ${opt.color}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">{opt.label}</div>
                  <div className="text-[10px] text-neutral-500">
                    {opt.id === 'none' && 'Shows standard routes.'}
                    {opt.id === 'wheelchair' && 'Elevators and wide ramps.'}
                    {opt.id === 'family' && 'Avoids crowds, highlights family facilities.'}
                    {opt.id === 'senior' && 'Escalators and resting benches.'}
                    {opt.id === 'vision' && 'Tactile indicators and direct walkways.'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
