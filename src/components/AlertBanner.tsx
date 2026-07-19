'use client';

import React from 'react';
import { useOperations } from '../context/OperationsContext';
import { ShieldAlert } from 'lucide-react';

export default function AlertBanner() {
  const { state, clearAlerts } = useOperations();

  if (state.activeAlerts.length === 0) return null;

  return (
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
  );
}
