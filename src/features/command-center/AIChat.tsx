'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { useSettings } from '../../context/SettingsContext';
import { askGemini } from '../../services/geminiService';
import { PRESET_PROMPTS } from '../../constants/mockData';
import { sanitizeInput } from '../../services/securityUtils';
import { 
  Send, 
  Sparkles, 
  Settings as SettingsIcon, 
  Globe, 
  Mic, 
  User, 
  Cpu, 
  AlertCircle
} from 'lucide-react';

interface AIChatProps {
  onOpenSettings: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية' }
];

export default function AIChat({ onOpenSettings }: AIChatProps) {
  const { state } = useOperations();
  const { settings, setLanguage } = useSettings();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Welcome message based on language selection
  useEffect(() => {
    let welcome = 'Welcome to StadiumOS AI. Ask me about gates, wait times, transit, or active tasks.';
    if (settings.language === 'es') welcome = 'Bienvenido a StadiumOS AI. Pregúntame sobre accesos, tiempos de espera, transporte o tareas.';
    if (settings.language === 'fr') welcome = 'Bienvenue sur StadiumOS AI. Posez vos questions sur les portes, l\'attente, le transport ou les tâches.';
    if (settings.language === 'pt') welcome = 'Bem-vindo ao StadiumOS AI. Pergunte sobre portões, tempos de espera, transporte ou tarefas.';
    if (settings.language === 'ar') welcome = 'مرحباً بك في StadiumOS AI. اسألني عن البوابات، أوقات الانتظار، النقل، أو المهام.';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([
      {
        sender: 'ai',
        text: welcome,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      }
    ]);
  }, [settings.language]);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Audio reader simulation: read out the last AI response if active
    if (settings.audioReader && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender === 'ai') {
        const textToSpeak = lastMsg.text.replace(/[*#]/g, ''); // strip markdown
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utterance.lang = settings.language;
          window.speechSynthesis.speak(utterance);
        }
      }
    }
  }, [messages, settings.audioReader, settings.language]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  }, [setLanguage]);

  const handleSend = useCallback(async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const sanitized = sanitizeInput(textToSend);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const userMsg: ChatMessage = { sender: 'user', text: sanitized, timestamp };
    
    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const aiReply = await askGemini(sanitized, state, settings);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: aiReply,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ]);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown issue';
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `An unexpected operational error occurred: ${errorMessage}.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, state, settings]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col h-[520px] shadow-lg overflow-hidden">
      
      {/* Chat Header */}
      <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Command Center</h2>
            <div className="text-[10px] text-neutral-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini 2.5 Flash Telemetry Engine
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 py-1 rounded-md">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={settings.language}
              onChange={handleLanguageChange}
              className="bg-transparent text-[10px] text-neutral-300 focus:outline-none cursor-pointer border-none font-medium"
              id="select-lang"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-neutral-950 text-neutral-300">
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-400 hover:text-white transition-colors"
            title="Configure API Keys"
            id="btn-open-settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Warning if API Key is not set */}
      {!settings.geminiApiKey && (
        <div className="bg-amber-500/15 border-b border-amber-500/25 px-4 py-2 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span>Running in local telemetry mode. Paste your Gemini API key for live responses.</span>
          </div>
          <button 
            onClick={onOpenSettings}
            className="underline hover:text-white font-semibold flex-shrink-0 ml-2"
          >
            Configure
          </button>
        </div>
      )}

      {/* Messages Panel */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4"
        style={{ scrollBehavior: 'smooth' }}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-neutral-300 flex-shrink-0 ${
              msg.sender === 'user' ? 'bg-neutral-800 border-neutral-700' : 'bg-indigo-950/40 border-indigo-500/30'
            }`}>
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5 text-indigo-400" />}
            </div>

            {/* Bubble */}
            <div className={`rounded-xl p-3 text-xs leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-neutral-800 text-white rounded-tr-none'
                : 'bg-neutral-950 border border-neutral-850 text-neutral-200 rounded-tl-none whitespace-pre-line'
            }`}>
              {msg.text}
              <div className="text-[9px] text-neutral-500 mt-1 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-7 h-7 rounded-full flex items-center justify-center border bg-indigo-950/40 border-indigo-500/30 text-indigo-400 flex-shrink-0">
              <Cpu className="w-3.5 h-3.5" />
            </div>
            <div className="bg-neutral-950 border border-neutral-850 rounded-xl rounded-tl-none p-3 text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Preset Prompts Panel */}
      <div className="px-4 py-2 border-t border-neutral-800/60 bg-neutral-950/30 overflow-x-auto flex gap-2 whitespace-nowrap scrollbar-none">
        {PRESET_PROMPTS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleSend(preset.text)}
            className="px-2.5 py-1 text-[10px] bg-neutral-800 border border-neutral-700 text-neutral-300 hover:bg-neutral-750 hover:text-white rounded-full transition-colors flex-shrink-0"
            disabled={loading}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Query input footer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(query);
        }}
        className="p-3 bg-neutral-950 border-t border-neutral-800 flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={settings.simpleLanguage ? "Ask the computer a question..." : "Ask command center (e.g. slowest gates, transit lines)..."}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
          id="input-chat-query"
        />
        
        {/* Sound Emulation */}
        <button
          type="button"
          onClick={() => setQuery("Where is the nearest wheelchair ramp access?")}
          className="p-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-colors"
          title="Emulate speech input"
          id="btn-voice-emulate"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="p-2 bg-white text-black hover:bg-neutral-200 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          id="btn-send-message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      
    </div>
  );
}
