'use client';

import React from 'react';
import { useOperations } from '../context/OperationsContext';
import { RefreshCw, Settings as SettingsIcon } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: HeaderProps) {
  const { simulateStateTick } = useOperations();

  return (
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
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-300 hover:text-white transition-colors"
            id="btn-header-settings"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Setup Key</span>
          </button>
        </div>

      </div>
    </header>
  );
}
