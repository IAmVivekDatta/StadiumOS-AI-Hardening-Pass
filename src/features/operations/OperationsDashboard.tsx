'use client';

import React, { useState, useMemo } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { IncidentSeverity } from '../../types';
import { sanitizeInput } from '../../services/securityUtils';
import { 
  ShieldAlert, 
  Activity, 
  Trash2, 
  Zap, 
  Users, 
  Volume2, 
  CheckCircle,
  FileSpreadsheet,
  AlertOctagon
} from 'lucide-react';

export default function OperationsDashboard() {
  const { state, updateIncidentStatus, resolveIncident, triggerEmergencyAlert, clearAlerts } = useOperations();
  const [broadcastText, setBroadcastText] = useState('');
  
  // Calculate total crowd metrics
  const { totalCapacity, totalCrowd, crowdPercentage } = useMemo(() => {
    const cap = state.zones.reduce((acc, cur) => acc + cur.capacity, 0);
    const crowd = state.zones.reduce((acc, cur) => acc + cur.currentCrowd, 0);
    const pct = cap > 0 ? Math.round((crowd / cap) * 100) : 0;
    return { totalCapacity: cap, totalCrowd: crowd, crowdPercentage: pct };
  }, [state.zones]);

  const getSeverityBadge = (sev: IncidentSeverity) => {
    switch (sev) {
      case 'low': return 'bg-neutral-800 text-neutral-400 border-neutral-750';
      case 'medium': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse';
    }
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText.trim()) return;
    triggerEmergencyAlert(sanitizeInput(broadcastText));
    setBroadcastText('');
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          Operations Hub Telemetry
        </h2>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Central stadium operations dashboard, incident reporting, and energy grid control.
        </p>
      </div>

      {/* Grid of KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Capacity Radial Approximation */}
        <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-neutral-400" /> Crowd Capacity
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold text-white">{crowdPercentage}%</span>
            <span className="text-[10px] text-neutral-400">({(totalCrowd / 1000).toFixed(1)}k / {(totalCapacity / 1000).toFixed(0)}k)</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${crowdPercentage}%` }}></div>
          </div>
        </div>

        {/* Incidents Metric */}
        <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-neutral-400" /> Incidents
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold text-white">{state.incidents.length}</span>
            <span className="text-[10px] text-neutral-400">active dispatch(es)</span>
          </div>
          <div className="text-[9px] text-neutral-500 mt-1">
            {state.incidents.filter(i => i.severity === 'high' || i.severity === 'critical').length} Urgent priority
          </div>
        </div>

        {/* Energy Grid */}
        <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-neutral-400" /> Power Usage
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold text-white">{state.energyUsage} kW</span>
            <span className="text-[10px] text-emerald-400">Grid Connected</span>
          </div>
          <div className="text-[9px] text-neutral-500 mt-1">
            Solar feeds: 12% contribution
          </div>
        </div>

        {/* Waste Fill */}
        <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-lg space-y-1">
          <div className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5 text-neutral-400" /> Waste Index
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold text-white">{state.wasteLevel}%</span>
            <span className="text-[10px] text-neutral-400">fill average</span>
          </div>
          <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className={`h-full transition-all duration-500 ${state.wasteLevel > 80 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${state.wasteLevel}%` }}></div>
          </div>
        </div>

      </div>

      {/* Broadcaster Block */}
      <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-lg space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            Emergency Broadcast Deck
          </h3>
          {state.activeAlerts.length > 0 && (
            <button
              onClick={clearAlerts}
              className="text-[10px] text-red-400 hover:text-red-300 font-semibold"
              id="btn-clear-broadcasts"
            >
              Clear Alerts
            </button>
          )}
        </div>

        {/* Active Alert Banners */}
        {state.activeAlerts.length > 0 && (
          <div className="space-y-1.5">
            {state.activeAlerts.map((alert, idx) => (
              <div key={idx} className="flex gap-2 p-2.5 bg-red-500/10 border border-red-500/25 rounded-md text-xs text-red-300 animate-pulse">
                <AlertOctagon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleBroadcast} className="flex gap-2 mt-2">
          <input
            type="text"
            required
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            placeholder="Type emergency alert message to broadcast to all screens..."
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
            id="input-broadcast-text"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-lg transition-colors"
            id="btn-broadcast-submit"
          >
            Broadcast
          </button>
        </form>
      </div>

      {/* Incidents Management Deck */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          Active Incident Desk
        </h3>

        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
          {state.incidents.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-neutral-850 rounded-lg text-neutral-500 text-xs">
              Zero active incidents reported. Stadium operations normal.
            </div>
          ) : (
            state.incidents.map((inc) => (
              <div 
                key={inc.id}
                className="bg-neutral-950 border border-neutral-850 rounded-lg p-3 flex flex-col md:flex-row justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${getSeverityBadge(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className="font-semibold text-white">{inc.title}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1">{inc.description}</p>
                  <div className="text-[10px] text-neutral-500 mt-1">
                    Quadrant: <strong>{inc.zoneName}</strong> | Reported: {inc.reportedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {inc.status === 'reported' && (
                    <button
                      onClick={() => updateIncidentStatus(inc.id, 'responding')}
                      className="px-2.5 py-1 bg-blue-950/40 border border-blue-500/30 text-blue-400 hover:bg-blue-900/40 rounded text-[10px] font-semibold transition-colors"
                      id={`btn-incident-respond-${inc.id}`}
                    >
                      Respond Dispatch
                    </button>
                  )}
                  {inc.status === 'responding' && (
                    <span className="text-[10px] text-neutral-500 font-medium px-2.5 py-1 bg-neutral-900 border border-neutral-800 rounded">
                      Responding...
                    </span>
                  )}
                  <button
                    onClick={() => resolveIncident(inc.id)}
                    className="p-1 bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/30 rounded"
                    title="Resolve incident"
                    id={`btn-incident-resolve-${inc.id}`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
