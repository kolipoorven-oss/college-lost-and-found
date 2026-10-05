import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  Search, 
  Plus, 
  MessageSquare, 
  User, 
  Sparkles,
  ArrowRight,
  X,
  FileQuestion,
  FileCheck
} from 'lucide-react';

export default function MobileBottomNav({ activePage, setActivePage }) {
  const { user, unreadCount } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Quick Report Bottom Sheet Modal for Mobile */}
      {reportModalOpen && (
        <div 
          onClick={() => setReportModalOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end justify-center p-3 animate-in fade-in duration-150 md:hidden"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">What would you like to report?</h4>
                  <p className="text-[11px] text-slate-500">Fast campus item recovery</p>
                </div>
              </div>
              <button 
                onClick={() => setReportModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setReportModalOpen(false);
                  handleNav('report-lost');
                }}
                className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100/80 border border-rose-200 flex flex-col items-center justify-center text-center space-y-2 group transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
                  <FileQuestion className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-rose-900">Lost Item</span>
                  <span className="text-[10px] text-rose-600">I lost something</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setReportModalOpen(false);
                  handleNav('report-found');
                }}
                className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 flex flex-col items-center justify-center text-center space-y-2 group transition-all active:scale-95"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-emerald-900">Found Item</span>
                  <span className="text-[10px] text-emerald-600">I found something</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Glassmorphic Mobile Bar */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:hidden px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          
          {/* 1. Home */}
          <button
            onClick={() => handleNav('landing')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 ${
              activePage === 'landing' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Compass className={`w-5 h-5 transition-transform ${activePage === 'landing' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Home</span>
          </button>

          {/* 2. Browse */}
          <button
            onClick={() => handleNav('browse')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 ${
              activePage === 'browse' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className={`w-5 h-5 transition-transform ${activePage === 'browse' ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">Browse</span>
          </button>

          {/* 3. Center Elevated Action Button (+ Report) */}
          <div className="relative -top-4 flex flex-col items-center">
            <button
              onClick={() => setReportModalOpen(true)}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/35 border-2 border-white active:scale-90 transition-all hover:shadow-indigo-600/50"
              aria-label="Create Report"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
            <span className="text-[9px] font-bold text-indigo-700 mt-0.5">Report</span>
          </div>

          {/* 4. Messages */}
          <button
            onClick={() => handleNav(user ? 'messages' : 'login')}
            className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 ${
              activePage === 'messages' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="relative">
              <MessageSquare className={`w-5 h-5 transition-transform ${activePage === 'messages' ? 'scale-110' : ''}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-sm animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Chat</span>
          </button>

          {/* 5. Dashboard / Profile */}
          <button
            onClick={() => handleNav(user ? (user.role === 'admin' ? 'admin' : 'dashboard') : 'login')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all active:scale-90 ${
              ['dashboard', 'admin', 'login', 'register'].includes(activePage) 
                ? 'text-indigo-600 font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className={`w-5 h-5 transition-transform ${['dashboard', 'admin'].includes(activePage) ? 'scale-110' : ''}`} />
            <span className="text-[10px] mt-0.5">
              {user ? (user.role === 'admin' ? 'Admin' : 'Me') : 'Sign In'}
            </span>
          </button>

        </div>
      </nav>
    </>
  );
}
