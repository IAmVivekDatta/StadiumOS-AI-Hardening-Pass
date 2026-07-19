'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import StadiumMap from '../features/live-map/StadiumMap';
import AccessibilityPanel from '../features/accessibility/AccessibilityPanel';
import { ErrorBoundary } from './ErrorBoundary';

// Lazy load non-critical widgets
const AIChat = dynamic(() => import('../features/command-center/AIChat'), { ssr: false });
const TransportPlanner = dynamic(() => import('../features/transport/TransportPlanner'), { ssr: false });
const PredictionChart = dynamic(() => import('../features/crowd-prediction/PredictionChart'), { ssr: false });
const VolunteerTasks = dynamic(() => import('../features/volunteer/VolunteerTasks'), { ssr: false });
const OperationsDashboard = dynamic(() => import('../features/operations/OperationsDashboard'), { ssr: false });

interface DashboardGridProps {
  onOpenSettings: () => void;
}

export default function DashboardGrid({ onOpenSettings }: DashboardGridProps) {
  const [mapRoute, setMapRoute] = useState<'none' | 'wheelchair' | 'family' | 'senior' | 'vision'>('none');

  return (
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
          <AIChat onOpenSettings={onOpenSettings} />
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

      {/* Extended Operations console row below the fold */}
      <div className="lg:col-span-12 mt-6">
        <ErrorBoundary fallbackTitle="Operations Dashboard Error">
          <OperationsDashboard />
        </ErrorBoundary>
      </div>

    </div>
  );
}
