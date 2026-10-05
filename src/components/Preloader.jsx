import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  Laptop, 
  Key, 
  CreditCard, 
  Headphones, 
  Coffee, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function Preloader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const audioCtxRef = useRef(null);

  const telemetrySteps = [
    { text: "Connecting to University Quantum Mesh...", code: "GEO-NET // CONNECTED" },
    { text: "Calibrating Library, Canteen & Sports GPS zones...", code: "ZONE-SCAN // 12 NODES" },
    { text: "Initializing AI Multi-Attribute Smart Match Engine...", code: "NEURAL-CORE // ACTIVE" },
    { text: "Scanning 2.4GHz & BLE Beacons for Lost Belongings...", code: "BEACON-RX // 99.4%" },
    { text: "Encrypting Student ID & Privacy Shields...", code: "AES-256 // ENCRYPTED" },
    { text: "Campus Recovery Grid Synchronized. Ready!", code: "SYSTEM // 100% OPERATIONAL" }
  ];

  const radarItems = [
    { icon: Laptop, label: "Dell XPS 15", loc: "Library", match: "91%", angle: 45, radius: 110, color: "from-blue-500 to-indigo-500" },
    { icon: Headphones, label: "AirPods Pro", loc: "Auditorium", match: "88%", angle: 140, radius: 85, color: "from-purple-500 to-pink-500" },
    { icon: CreditCard, label: "Student ID", loc: "Canteen", match: "95%", angle: 220, radius: 125, color: "from-emerald-500 to-teal-500" },
    { icon: Key, label: "Dorm Keys", loc: "Union Plaza", match: "82%", angle: 305, radius: 95, color: "from-amber-500 to-orange-500" }
  ];

  // Web Audio Synth for sci-fi sound effects (zero external files required)
  const playSound = (freq = 440, type = 'sine', duration = 0.1) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // 2.2s total smooth load

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProg = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentProg);

      const step = Math.min(
        telemetrySteps.length - 1, 
        Math.floor((elapsed / duration) * telemetrySteps.length)
      );
      setStatusIndex(step);

      if (currentProg % 25 === 0 && currentProg < 100) {
        playSound(520 + currentProg * 4, 'sine', 0.08);
      }

      if (currentProg >= 100) {
        clearInterval(interval);
        playSound(880, 'triangle', 0.25);
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 600);
        }, 350);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white overflow-hidden transition-all duration-700 ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Cybernetic Grid & Atmospheric Nebula */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-indigo-600/15 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/3 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Top Header HUD Bar */}
      <header className="relative z-10 w-full max-w-5xl px-4 sm:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/20">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono tracking-widest text-indigo-400 font-bold">CAMPUSFINDER</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                v2.5 AI
              </span>
            </div>
            <p className="text-[10px] font-mono text-slate-400">QUANTUM RECOVERY RADAR</p>
          </div>
        </div>

        {/* Right side controls: Sound toggle & Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors text-xs flex items-center gap-1.5"
            title={soundEnabled ? "Mute audio" : "Enable sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={handleSkip}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all text-xs font-mono font-medium flex items-center gap-1"
          >
            <span>Skip</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Center Radar & Hologram */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-4">
        
        {/* Main Circular Radar Screen */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
          
          {/* Radar Background Rings (Concentric Sonar Circles) */}
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 bg-slate-950/60 backdrop-blur-md"></div>
          <div className="absolute inset-8 sm:inset-10 rounded-full border border-indigo-500/15"></div>
          <div className="absolute inset-16 sm:inset-20 rounded-full border border-indigo-500/20"></div>
          <div className="absolute inset-24 sm:inset-32 rounded-full border border-indigo-500/25"></div>

          {/* Crosshairs & Compass Bearings */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-indigo-500/20"></div>
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-indigo-500/20"></div>
          
          {/* Radar Direction Badges */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-indigo-400 font-bold tracking-widest">N // LIBRARY</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-indigo-400 font-bold tracking-widest">S // SPORTS</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-indigo-400 font-bold tracking-widest">E // UNION</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-mono text-indigo-400 font-bold tracking-widest">W // CANTEEN</span>

          {/* 360-Degree Sweeping Beam */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none animate-[spin_3s_linear_infinite]"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0deg, rgba(79, 70, 229, 0.0) 260deg, rgba(6, 182, 212, 0.25) 355deg, rgba(6, 182, 212, 0.7) 360deg)'
            }}
          ></div>

          {/* Pulsing Sonar Ring Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/40 animate-ping opacity-20 pointer-events-none"></div>

          {/* Orbiting Detected Items Nodes */}
          {radarItems.map((item, idx) => {
            const rad = (item.angle * Math.PI) / 180;
            // Responsive scale factor for smaller mobile displays
            const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
            const r = isMobile ? item.radius * 0.75 : item.radius;
            const x = Math.cos(rad) * r;
            const y = Math.sin(rad) * r;
            const Icon = item.icon;

            return (
              <div 
                key={idx}
                className="absolute z-20 flex flex-col items-center group pointer-events-auto transition-transform hover:scale-125"
                style={{
                  transform: `translate(${x}px, ${y}px)`
                }}
              >
                {/* Node icon pill */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${item.color} p-[1px] shadow-lg shadow-cyan-500/20 animate-bounce duration-1000`}>
                  <div className="w-full h-full bg-slate-900 rounded-[11px] flex items-center justify-center text-white">
                    <Icon className="w-4 h-4 text-cyan-300" />
                  </div>
                </div>

                {/* Node Radar Label Card */}
                <div className="mt-1 px-1.5 py-0.5 rounded bg-slate-900/90 border border-indigo-500/30 text-[9px] font-mono text-slate-300 flex items-center gap-1 shadow-md whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{item.match}</span>
                  <span className="text-slate-500">•</span>
                  <span>{item.loc}</span>
                </div>
              </div>
            );
          })}

          {/* Central Glowing Campus Core */}
          <div className="relative z-30 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-400 p-[1.5px] shadow-2xl shadow-indigo-500/50">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center text-white">
              <Compass className="w-7 h-7 sm:w-9 sm:h-9 text-indigo-400 animate-spin [animation-duration:8s]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
          </div>

        </div>

      </main>

      {/* Bottom Telemetry HUD & Progress Bar */}
      <footer className="relative z-10 w-full max-w-lg px-4 sm:px-8 pb-8 space-y-4 text-center">
        
        {/* Real-time Percentage & Code Status */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-cyan-300 font-bold tracking-wider">
              {telemetrySteps[statusIndex]?.code || "INITIALIZING..."}
            </span>
          </div>
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-300 to-white">
            {progress}%
          </span>
        </div>

        {/* High-Tech Progress Track */}
        <div className="relative w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-indigo-900/60 p-[1px]">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-75 relative shadow-[0_0_12px_rgba(6,182,212,0.8)]"
            style={{ width: `${progress}%` }}
          >
            {/* Shimmer light streak */}
            <div className="absolute right-0 top-0 bottom-0 w-3 bg-white blur-[2px] opacity-80"></div>
          </div>
        </div>

        {/* Dynamic Telemetry Log Message */}
        <div className="h-6 flex items-center justify-center">
          <p className="text-xs font-mono text-slate-400 animate-fade-in truncate">
            {telemetrySteps[statusIndex]?.text}
          </p>
        </div>

        {/* Safe Campus Security Footer Badge */}
        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 border border-slate-800/80 px-3 py-1 rounded-full bg-slate-900/40">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Encrypted Campus Multi-Factor Matching v2.5</span>
        </div>

      </footer>
    </div>
  );
}
