import React from 'react';
import { Compass, Shield, MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export default function Footer({ setActivePage, onTriggerPreloader }) {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">CampusFinder</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Official smart lost & found recovery network for students, faculty, and campus staff. Powered by intelligent attribute & location matching.
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Campus Recovery Network Active
              </div>

              {onTriggerPreloader && (
                <button
                  onClick={onTriggerPreloader}
                  className="flex items-center gap-2 text-xs text-cyan-400 font-mono font-bold bg-cyan-950/60 hover:bg-cyan-900/60 px-3 py-1.5 rounded-lg border border-cyan-800/60 transition-colors w-fit shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>⚡ Holographic Radar Preloader</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setActivePage('browse')} 
                  className="hover:text-white transition-colors"
                >
                  Browse Lost & Found Directory
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('report-lost')} 
                  className="hover:text-white transition-colors text-rose-300"
                >
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('report-found')} 
                  className="hover:text-white transition-colors text-emerald-300"
                >
                  Report a Found Item
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('dashboard')} 
                  className="hover:text-white transition-colors"
                >
                  My Student / Staff Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Desk Locations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Collection Points</h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Central Library Help Desk (1st Floor)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Main Campus Security Office (Gate 1)</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>Student Affairs Center (Room 105)</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                <span>Mon – Fri: 8:00 AM – 8:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Safety & Verification */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Protection</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Direct personal contact info is kept confidential. Ownership verification is required before releasing high-value electronics and smart IDs.
            </p>
            <div className="pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-medium text-slate-200">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Security Hotline: +1 (555) 019-2834</span>
              </div>
            </div>
          </div>

        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>© {new Date().getFullYear()} CampusFinder Smart Lost & Found System. Built for College Campus Recovery.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded border border-indigo-800">
              Rule-Based + N-Gram Similarity Engine
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
