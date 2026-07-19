'use client';

import React, { useMemo } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { 
  Bus, 
  Timer, 
  Navigation
} from 'lucide-react';

export default function TransportPlanner() {
  const { state } = useOperations();

  // Find safest transit recommendations
  const { recommendedTransit, slowTransit } = useMemo(() => {
    const recommended = state.transit.find(t => t.status === 'on-time' && t.waitTime < 15);
    const slow = state.transit.find(t => t.waitTime > 25);
    return { recommendedTransit: recommended, slowTransit: slow };
  }, [state.transit]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
      case 'delayed': return 'text-amber-400 bg-amber-950/20 border-amber-900/30';
      case 'suspended': return 'text-red-400 bg-red-950/20 border-red-900/30 animate-pulse';
      default: return 'text-neutral-400 bg-neutral-900 border-neutral-800';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-5">
      
      {/* Title */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <Bus className="w-4 h-4 text-indigo-400" />
          Transport Assistant
        </h2>
        <p className="text-[11px] text-neutral-400 mt-0.5">
          Live transit dispatch, parking availability, and optimal departure directions.
        </p>
      </div>

      {/* Transit Board */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Public Transit Telemetry</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {state.transit.map((t) => (
            <div 
              key={t.id}
              className="bg-neutral-950 border border-neutral-850 p-3 rounded-lg flex justify-between items-center text-xs"
            >
              <div className="space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                  {t.lineName}
                </div>
                <div className="text-[10px] text-neutral-500">
                  Runs every {t.frequency}m | Type: {t.type.toUpperCase()}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${getStatusColor(t.status)}`}>
                  {t.status}
                </span>
                <div className="text-[10px] text-neutral-400 mt-1.5 flex items-center gap-1 justify-end">
                  <Timer className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Q: <strong>{t.waitTime}m</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parking Status */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Parking Lot Capacity</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {state.parking.map((p) => {
            const pct = Math.round((p.occupied / p.capacity) * 100);
            const full = pct > 90;
            return (
              <div key={p.id} className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg space-y-1">
                <div className="font-semibold text-white truncate">{p.name.split(' ')[0]}</div>
                <div className="text-[10px] text-neutral-400">
                  {p.occupied}/{p.capacity} spots
                </div>
                <div className="w-full bg-neutral-800 h-1 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full transition-all duration-300 ${full ? 'bg-red-500' : 'bg-indigo-400'}`} 
                    style={{ width: `${pct}%` }}
                  ></div>
                </div>
                <div className="text-[9px] text-neutral-500 pt-0.5">
                  {p.walkingTime}m walk to gates
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Walking Directions Advisor */}
      <div className="bg-neutral-950 border border-neutral-850 p-3.5 rounded-lg text-xs space-y-2">
        <h4 className="font-semibold text-white flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          Optimal Route Guidance
        </h4>
        
        <div className="space-y-2 text-neutral-350 text-[11px] leading-relaxed">
          {recommendedTransit ? (
            <p>
              💡 **Recommended departure route**: Use **Gate A (North)** to board the **{recommendedTransit.lineName}** which is currently running on-time with queue times under {recommendedTransit.waitTime + 2} minutes.
            </p>
          ) : (
            <p>
              💡 **Standard departure route**: Utilize the closest West/North exit gates.
            </p>
          )}

          {slowTransit && (
            <p className="text-red-400/90 font-medium">
              ⚠ **Avoid route**: The **{slowTransit.lineName}** is experiencing heavy queues of **{slowTransit.waitTime} mins** due to peak congestion. Redirect to alternative buses or parking shuttles.
            </p>
          )}

          <p className="text-neutral-500">
            *Accessibility Tip: Wheelchair users should exit via Gate D (West Section) where shuttle ramps are fully equipped. Shuttle buses run to the Park & Ride lot every 3 minutes.*
          </p>
        </div>
      </div>

    </div>
  );
}
