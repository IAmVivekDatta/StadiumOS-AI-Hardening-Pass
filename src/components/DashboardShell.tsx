'use client';

import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { useSettingsModal } from '../hooks/useSettingsModal';
import AlertBanner from './AlertBanner';
import Header from './Header';
import DashboardGrid from './DashboardGrid';
import SettingsModal from './SettingsModal';

export default function DashboardShell() {
  const { settings } = useSettings();
  const modalProps = useSettingsModal();

  // Determine global wrapper classes based on accessibility configuration
  const wrapperClass = `min-h-screen text-white font-sans transition-colors duration-300 ${
    settings.highContrast ? 'high-contrast bg-black' : 'bg-neutral-950'
  } text-scale-${settings.fontSize}`;

  return (
    <div className={wrapperClass} id="root-app-container">
      <AlertBanner />
      <Header onOpenSettings={modalProps.handleOpenSettings} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardGrid onOpenSettings={modalProps.handleOpenSettings} />
      </main>

      <SettingsModal {...modalProps} />

      {/* Simple accessibility audio player target */}
      <div id="audio-reader-target" className="sr-only" aria-live="assertive"></div>
    </div>
  );
}
