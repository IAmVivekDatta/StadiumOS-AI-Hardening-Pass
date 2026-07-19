'use client';

import React, { useState, useMemo } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { 
  Navigation, 
  AlertTriangle, 
  MapPin, 
  Coffee, 
  Activity, 
  Info,
  Accessibility
} from 'lucide-react';

interface StadiumMapProps {
  routeType: 'none' | 'wheelchair' | 'family' | 'senior' | 'vision';
}

// Map density to colors
const getDensityColor = (density: string) => {
  switch (density) {
    case 'low': return 'fill-emerald-500/10 stroke-emerald-500/40';
    case 'medium': return 'fill-amber-500/10 stroke-amber-500/40';
    case 'high': return 'fill-orange-500/15 stroke-orange-500/60';
    case 'critical': return 'fill-red-500/25 stroke-red-500/80 animate-pulse';
    default: return 'fill-neutral-800 stroke-neutral-700';
  }
};

const getGateBorderColor = (density: string) => {
  switch (density) {
    case 'low': return 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20';
    case 'medium': return 'border-amber-500/40 text-amber-400 bg-amber-950/20';
    case 'high': return 'border-orange-500/40 text-orange-400 bg-orange-950/20';
    case 'critical': return 'border-red-500/60 text-red-400 bg-red-950/30 animate-pulse';
    default: return 'border-neutral-700 text-neutral-400';
  }
};

const zonesMap: Record<string, { label: string; coords: string; textCoords: [number, number] }> = {
  'zone-north': { label: 'North Stand', coords: 'M 150 120 A 130 130 0 0 1 350 120 L 330 150 A 100 100 0 0 0 170 150 Z', textCoords: [250, 105] },
  'zone-east': { label: 'East Stand', coords: 'M 350 120 A 130 130 0 0 1 350 280 L 330 250 A 100 100 0 0 0 330 150 Z', textCoords: [375, 200] },
  'zone-south': { label: 'South Stand', coords: 'M 350 280 A 130 130 0 0 1 150 280 L 170 250 A 100 100 0 0 0 330 250 Z', textCoords: [250, 310] },
  'zone-west': { label: 'West Stand', coords: 'M 150 280 A 130 130 0 0 1 150 120 L 170 150 A 100 100 0 0 0 170 250 Z', textCoords: [120, 200] },
  'zone-concourse': { label: 'Concourse Ring', coords: 'M 90 200 A 160 160 0 1 1 410 200 A 160 160 0 1 1 90 200 M 105 200 A 145 145 0 1 0 395 200 A 145 145 0 1 0 105 200 Z', textCoords: [250, 75] }
};

export default function StadiumMap({ routeType }: StadiumMapProps) {
  const { state } = useOperations();
  const [selectedElement, setSelectedElement] = useState<{ type: 'zone' | 'gate' | 'facility'; name: string; details: string } | null>(null);

  const facilities = useMemo(() => [
    { name: 'Food Court A', x: 250, y: 155, type: 'food', icon: Coffee, details: 'Wheelchair-friendly ramp. Low crowds.' },
    { name: 'Medical Station Red', x: 300, y: 200, type: 'medical', icon: Activity, details: 'Active response. Stretcher access.' },
    { name: 'Volunteer Desk 1', x: 190, y: 230, type: 'info', icon: Info, details: 'Helper assistance, tactile guides.' },
  ], []);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg flex flex-col items-center relative overflow-hidden">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-start mb-4">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-indigo-400" />
            Live Arena Map (Telemetry Link)
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Real-time heat density and navigation guide. Click elements to inspect.
          </p>
        </div>
        {routeType !== 'none' && (
          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 border border-indigo-500/30 rounded-full font-medium">
            Routing: {routeType}
          </span>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="w-full max-w-[420px] aspect-square relative">
        <svg viewBox="0 0 500 400" className="w-full h-full select-none" id="stadium-svg">
          {/* Definitions for map gradients */}
          <defs>
            <radialGradient id="field-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1e3a1e" />
              <stop offset="100%" stopColor="#0f1f0f" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background Grid Lines (Sci-Fi Aesthetic) */}
          <line x1="50" y1="200" x2="450" y2="200" stroke="#27272a" strokeWidth="1" strokeDasharray="5,5" />
          <line x1="250" y1="40" x2="250" y2="360" stroke="#27272a" strokeWidth="1" strokeDasharray="5,5" />
          <circle cx="250" cy="200" r="185" fill="none" stroke="#27272a" strokeWidth="1" />

          {/* 1. Playing Field (Soccer Pitch) */}
          <rect x="200" y="165" width="100" height="70" rx="4" fill="url(#field-grad)" stroke="#22c55e" strokeWidth="1.5" />
          <circle cx="250" cy="200" r="15" fill="none" stroke="#22c55e" strokeWidth="1.2" />
          <line x1="250" y1="165" x2="250" y2="235" stroke="#22c55e" strokeWidth="1.2" />
          
          {/* 2. Crowd Zones (Stands) */}
          {state.zones.map((zone) => {
            const mapped = zonesMap[zone.id];
            if (!mapped) return null;
            return (
              <path
                key={zone.id}
                d={mapped.coords}
                className={`transition-colors duration-500 cursor-pointer stroke-2 focus:outline-none focus:stroke-indigo-400 focus:stroke-[3px] ${getDensityColor(zone.density)}`}
                tabIndex={0}
                role="button"
                aria-label={`Stand: ${zone.name}. Crowd: ${zone.currentCrowd} of ${zone.capacity}. Density is ${zone.density}.`}
                onClick={() => setSelectedElement({
                  type: 'zone',
                  name: zone.name,
                  details: `Crowd: ${zone.currentCrowd} / ${zone.capacity} capacity (${Math.round((zone.currentCrowd/zone.capacity)*100)}%). Density is ${zone.density.toUpperCase()}. Active incidents: ${zone.incidentsCount}.`
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedElement({
                      type: 'zone',
                      name: zone.name,
                      details: `Crowd: ${zone.currentCrowd} / ${zone.capacity} capacity (${Math.round((zone.currentCrowd/zone.capacity)*100)}%). Density is ${zone.density.toUpperCase()}. Active incidents: ${zone.incidentsCount}.`
                    });
                  }
                }}
              />
            );
          })}

          {/* 3. Text labels for Stands */}
          {state.zones.map((zone) => {
            const mapped = zonesMap[zone.id];
            if (!mapped) return null;
            return (
              <text
                key={`label-${zone.id}`}
                x={mapped.textCoords[0]}
                y={mapped.textCoords[1]}
                fill="#a1a1aa"
                fontSize="10"
                fontWeight="semibold"
                textAnchor="middle"
                className="pointer-events-none uppercase tracking-wide opacity-80"
              >
                {zone.name.split(' ')[0]}
              </text>
            );
          })}

          {/* 4. Accessibility Navigational Route Lines (Animated Dash Flow) */}
          {/* Standard Route */}
          {routeType === 'none' && (
            <path
              d="M 50 200 L 150 200 M 450 200 L 350 200 M 250 40 L 250 120"
              fill="none"
              stroke="#52525b"
              strokeWidth="3"
              strokeLinecap="round"
              className="opacity-40"
            />
          )}

          {/* Wheelchair Path: avoids steps, utilizes ramps to concourse, Gate D to concourse */}
          {routeType === 'wheelchair' && (
            <path
              d="M 50 200 C 100 200, 110 180, 140 180 M 140 180 L 230 180 M 230 180 L 250 155"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-route-flow"
              filter="url(#glow)"
            />
          )}

          {/* Family Path: avoids crowded south gate, leads to west family section and food court */}
          {routeType === 'family' && (
            <path
              d="M 50 200 C 100 200, 110 230, 140 230 L 190 230 C 190 230, 200 220, 210 200"
              fill="none"
              stroke="#34d399"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-route-flow"
              filter="url(#glow)"
            />
          )}

          {/* Senior Path: Escalator connections, minimal walking */}
          {routeType === 'senior' && (
            <path
              d="M 250 360 L 250 300 C 250 280, 290 270, 310 250 L 330 250"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-route-flow"
              filter="url(#glow)"
            />
          )}

          {/* Vision Path: Direct high tactile walkways */}
          {routeType === 'vision' && (
            <path
              d="M 450 200 L 350 200 L 330 200 C 310 200, 310 200, 300 200"
              fill="none"
              stroke="#c084fc"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-route-flow"
              filter="url(#glow)"
            />
          )}

          {/* 5. Facility markers */}
          {facilities.map((fac) => {
            const Icon = fac.icon;
            return (
              <g
                key={fac.name}
                transform={`translate(${fac.x - 8}, ${fac.y - 8})`}
                className="cursor-pointer group focus:outline-none focus:scale-125 transition-transform"
                tabIndex={0}
                role="button"
                aria-label={`Facility: ${fac.name}. ${fac.details}`}
                onClick={() => setSelectedElement({
                  type: 'facility',
                  name: fac.name,
                  details: fac.details
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedElement({
                      type: 'facility',
                      name: fac.name,
                      details: fac.details
                    });
                  }
                }}
              >
                <circle cx="8" cy="8" r="10" fill="#18181b" stroke="#818cf8" strokeWidth="1.5" />
                <Icon className="w-3.5 h-3.5 text-indigo-300 translate-x-[1px] translate-y-[1px]" />
              </g>
            );
          })}

          {/* 6. Gates Coordinates & Status */}
          {/* Gate A: (250, 40) - North */}
          {/* Gate B: (450, 200) - East */}
          {/* Gate C: (250, 360) - South */}
          {/* Gate D: (50, 200) - West */}
          {state.gates.map((gate) => {
            let gx = 0;
            let gy = 0;
            if (gate.id === 'gate-a') { gx = 250; gy = 40; }
            if (gate.id === 'gate-b') { gx = 450; gy = 200; }
            if (gate.id === 'gate-c') { gx = 250; gy = 360; }
            if (gate.id === 'gate-d') { gx = 50; gy = 200; }

            const critical = gate.density === 'critical';
            return (
              <g
                key={gate.id}
                transform={`translate(${gx}, ${gy})`}
                className="cursor-pointer focus:outline-none focus:scale-125 transition-transform"
                tabIndex={0}
                role="button"
                aria-label={`Gate ${gate.id.split('-')[1].toUpperCase()}: ${gate.name}. Wait time: ${gate.waitTime} minutes. Density: ${gate.density}. ${gate.wheelchairAccessible ? 'Wheelchair accessible' : 'Stairs only'}`}
                onClick={() => setSelectedElement({
                  type: 'gate',
                  name: gate.name,
                  details: `Status: ${gate.status.toUpperCase()}. Wait Time: ${gate.waitTime} mins. Density: ${gate.density.toUpperCase()}. ${gate.wheelchairAccessible ? '♿ Wheelchair Accessible Ramp.' : '⚠ Stairs only.'}`
                })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedElement({
                      type: 'gate',
                      name: gate.name,
                      details: `Status: ${gate.status.toUpperCase()}. Wait Time: ${gate.waitTime} mins. Density: ${gate.density.toUpperCase()}. ${gate.wheelchairAccessible ? '♿ Wheelchair Accessible Ramp.' : '⚠ Stairs only.'}`
                    });
                  }
                }}
              >
                {critical && (
                  <circle cx="0" cy="0" r="18" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping opacity-75" />
                )}
                <circle cx="0" cy="0" r="12" fill="#18181b" stroke={critical ? '#ef4444' : '#52525b'} strokeWidth="2" />
                <text
                  x="0"
                  y="3.5"
                  fill="white"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="pointer-events-none"
                >
                  {gate.id.split('-')[1].toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Gate Wait Times Quick Bar */}
      <div className="w-full grid grid-cols-4 gap-2 mt-4 z-10">
        {state.gates.map((gate) => (
          <button
            key={gate.id}
            onClick={() => setSelectedElement({
              type: 'gate',
              name: gate.name,
              details: `Status: ${gate.status.toUpperCase()}. Wait Time: ${gate.waitTime} mins. Density: ${gate.density.toUpperCase()}. ${gate.wheelchairAccessible ? '♿ Wheelchair Accessible.' : '⚠ Stairs only.'}`
            })}
            className={`border rounded-lg p-1.5 text-center cursor-pointer transition-all duration-200 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getGateBorderColor(gate.density)}`}
            aria-label={`Inspect Gate ${gate.id.split('-')[1].toUpperCase()} Details. Wait time: ${gate.waitTime} minutes.`}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider">Gate {gate.id.split('-')[1].toUpperCase()}</div>
            <div className="text-xs font-semibold mt-0.5">{gate.waitTime}m</div>
            <div className="text-[8px] flex items-center justify-center gap-0.5 mt-0.5 opacity-80">
              {gate.wheelchairAccessible ? (
                <Accessibility className="w-2.5 h-2.5 text-blue-400" aria-label="Wheelchair accessible" />
              ) : (
                <span className="text-neutral-500">-</span>
              )}
              {gate.status !== 'open' && (
                <AlertTriangle className="w-2.5 h-2.5 text-red-500" aria-label="Alert" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Element Detail Box */}
      <div className="w-full mt-4 min-h-[50px]">
        {selectedElement ? (
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-2.5 text-xs text-neutral-300 relative animate-fade-in">
            <button
              onClick={() => setSelectedElement(null)}
              className="absolute top-1.5 right-2 text-neutral-500 hover:text-neutral-300 font-bold"
              aria-label="Close details"
            >
              ×
            </button>
            <div className="font-semibold text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {selectedElement.name}
            </div>
            <div className="mt-1 text-neutral-400 text-[11px] leading-relaxed">
              {selectedElement.details}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-neutral-800 rounded-lg p-2.5 text-center text-[10px] text-neutral-500 flex items-center justify-center h-[52px]">
            Select a stand (zone), gate, or facility pin to inspect details.
          </div>
        )}
      </div>

    </div>
  );
}
