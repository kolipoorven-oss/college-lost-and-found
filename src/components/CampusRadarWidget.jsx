import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Radar, 
  Sparkles, 
  X, 
  ShieldCheck, 
  RotateCcw, 
  UserCheck, 
  Zap,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function CampusRadarWidget({ onTriggerPreloader, setActivePage }) {
  const { user, quickLogin } = useAuth();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleQuickSwitch = async (role) => {
    setSwitching(true);
    try {
      await quickLogin(role);
      if (role === 'admin') setActivePage('admin');
      else setActivePage('dashboard');
      setOpen(false);
    } catch (e) {
    } finally {
      setSwitching(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
        <button
          onClick={() => setOpen(!open)}
          className="group relative flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full bg-slate-900/90 text-white border border-indigo-500/40 shadow-xl shadow-indigo-600/20 backdrop-blur-md hover:bg-slate-900 hover:border-cyan-400 transition-all active:scale-95"
          aria-label="Open Smart Campus Radar"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block animate-ping absolute inset-0"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 block relative"></span>
          </div>
          <Radar className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200 group-hover:text-cyan-300">
            RADAR AI
          </span>
        </button>
      </div>

      {/* Futuristic Radar Control Drawer */}
      {open && (
        <div 
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-950 text-white rounded-3xl p-5 shadow-2xl border border-indigo-500/30 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-mono font-bold text-cyan-400 tracking-wider">
                    CAMPUS TELEMETRY HUD
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400">
                    Smart Attributes & Recovery Engine
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Live Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400">MATCH RATE</span>
                <span className="text-sm font-black font-mono text-cyan-400">91.4%</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400">HOT ZONES</span>
                <span className="text-sm font-black font-mono text-indigo-400">12 BLOCKS</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="block text-[10px] font-mono text-slate-400">SECURITY</span>
                <span className="text-sm font-black font-mono text-emerald-400">ACTIVE</span>
              </div>
            </div>

            {/* Action 1: Replay Preloader Radar */}
            <button
              onClick={() => {
                setOpen(false);
                if (onTriggerPreloader) onTriggerPreloader();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-600 hover:from-indigo-600 hover:to-cyan-500 text-white font-mono text-xs font-bold flex items-center justify-between shadow-lg shadow-indigo-600/30 transition-all active:scale-98"
            >
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 animate-spin [animation-duration:6s]" />
                <span>Launch Holographic Radar Scanner</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Action 2: Demo Quick Login Switcher */}
            <div className="space-y-2 pt-1">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Instant Demo Account Switcher
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  disabled={switching}
                  onClick={() => handleQuickSwitch('student')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 text-left transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="truncate">Alex (Student)</span>
                </button>
                <button
                  disabled={switching}
                  onClick={() => handleQuickSwitch('student2')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 text-left transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">Priya (Student)</span>
                </button>
                <button
                  disabled={switching}
                  onClick={() => handleQuickSwitch('staff')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500 text-slate-200 text-left transition-colors flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">Dr. Vance (Staff)</span>
                </button>
                <button
                  disabled={switching}
                  onClick={() => handleQuickSwitch('admin')}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 text-slate-200 text-left transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate">Campus Admin</span>
                </button>
              </div>
            </div>

            {/* Footer status */}
            <div className="text-[10px] font-mono text-slate-500 text-center pt-1 border-t border-slate-850">
              CampusFinder Quantum Radar • Multi-Device v2.5
            </div>
          </div>
        </div>
      )}
    </>
  );
}
