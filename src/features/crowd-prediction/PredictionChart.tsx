'use client';

import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { useSettings } from '../../context/SettingsContext';
import { askGemini } from '../../services/geminiService';
import { CROWD_PREDICTION_DATA, CROWD_HISTORICAL_DATA } from '../../constants/mockData';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function PredictionChart() {
  const { state } = useOperations();
  const { settings } = useSettings();
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchAiExplanation = async () => {
    setLoading(true);
    try {
      const prompt = `Perform an operational crowd forecast analysis on the following data:
Historical Wait Times (12:00 to 15:00):
${JSON.stringify(CROWD_HISTORICAL_DATA)}

Forecasted Wait Times (15:00 to 18:00):
${JSON.stringify(CROWD_PREDICTION_DATA)}

Current Active Incidents:
${JSON.stringify(state.incidents)}

Provide:
1. Executive summary of bottleneck points (specifically at Gate B and during match end).
2. Mitigation recommendation instructions for Volunteers and Security Staff.
3. Accessible routing alternatives for vulnerable fans.
Be concise and write in a professional operations commander style.`;
      
      const explanation = await askGemini(prompt, state, settings);
      setAiExplanation(explanation);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setAiExplanation(`Failed to generate explanation: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPeakWaitTime = () => {
    let peak = 0;
    let gate = '';
    let time = '';
    CROWD_PREDICTION_DATA.forEach((row) => {
      (['Gate A', 'Gate B', 'Gate C', 'Gate D'] as const).forEach((g) => {
        if (row[g] > peak) {
          peak = row[g];
          gate = g;
          time = row.time;
        }
      });
    });
    return { peak, gate, time };
  };

  const peakInfo = getPeakWaitTime();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-lg space-y-4">
      
      {/* Header Info */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            Crowd Congestion & Wait-Time Forecast
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Compares historical entries against predicted wait times (minutes) through match termination.
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-full h-[220px] bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-850">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={CROWD_PREDICTION_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGateB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGateC" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGateA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" opacity={0.3} />
            <XAxis dataKey="time" stroke="#71717a" fontSize={9} tickLine={false} />
            <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px' }}
              labelStyle={{ fontSize: '10px', color: '#a1a1aa', fontWeight: 'bold' }}
              itemStyle={{ fontSize: '10px', color: '#f4f4f5' }}
            />
            <Legend verticalAlign="top" height={24} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '9px', color: '#a1a1aa' }} />
            <Area type="monotone" dataKey="Gate B" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGateB)" name="Gate B (East)" />
            <Area type="monotone" dataKey="Gate C" stroke="#f59e0b" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGateC)" name="Gate C (South)" />
            <Area type="monotone" dataKey="Gate A" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={1} fill="url(#colorGateA)" name="Gate A (North)" />
            <Area type="monotone" dataKey="Gate D" stroke="#10b981" strokeWidth={1.5} fillOpacity={0} name="Gate D (West)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Highlights Bar */}
      <div className="grid grid-cols-2 gap-3 bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-xs">
        <div className="flex gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-white">Peak Alert</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              {peakInfo.gate} is predicted to reach <strong className="text-red-400">{peakInfo.peak} min</strong> wait at {peakInfo.time}.
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <BrainCircuit className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-white">Simulation Engine</div>
            <div className="text-[10px] text-neutral-400 mt-0.5">
              Dynamic AI telemetry analyzes historical curves and volunteer distributions.
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">AI Congestion Summary</span>
          <button
            onClick={fetchAiExplanation}
            disabled={loading}
            className="flex items-center gap-1 py-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[10px] text-white font-medium rounded-md transition-colors"
            id="btn-ai-explain-forecast"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />}
            {aiExplanation ? 'Recalculate Analysis' : 'Explain Forecast'}
          </button>
        </div>

        {aiExplanation ? (
          <div className="bg-neutral-950 border border-neutral-850 rounded-lg p-3 text-xs text-neutral-300 whitespace-pre-line leading-relaxed max-h-[140px] overflow-y-auto">
            {aiExplanation}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-800 rounded-lg p-3 text-center text-[10px] text-neutral-500 h-[60px] flex items-center justify-center">
            Click &apos;Explain Forecast&apos; to generate a GenAI operational breakdown of this wait-time curve.
          </div>
        )}
      </div>

    </div>
  );
}
