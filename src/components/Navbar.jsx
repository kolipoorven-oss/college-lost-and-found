import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  PlusCircle, 
  MessageSquare, 
  ShieldCheck, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Sparkles, 
  FileText,
  Search,
  CheckCircle2,
  ChevronDown,
  Building2
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage }) {
  const { user, unreadCount, logout, quickLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleNav = (page) => {
    setActivePage(page);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickSwitch = async (role) => {
    await quickLogin(role);
    setDemoDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & College Brand */}
          <div 
            onClick={() => handleNav('landing')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  Campus<span className="text-indigo-600">Finder</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  SMART AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-600 tracking-wider">
                COLLEGE LOST & FOUND PORTAL
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('browse')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activePage === 'browse'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Items
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activePage === 'dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Dashboard
                </button>

                <button
                  onClick={() => handleNav('my-reports')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activePage === 'my-reports'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Reports
                </button>

                <button
                  onClick={() => handleNav('messages')}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activePage === 'messages'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                    </span>
                  )}
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <button
                onClick={() => handleNav('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  activePage === 'admin'
                    ? 'bg-slate-900 text-white'
                    : 'bg-indigo-100/70 text-indigo-900 hover:bg-indigo-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Admin Console
              </button>
            )}
          </nav>

          {/* Action CTAs & Profile */}
          <div className="hidden md:flex items-center gap-2">
            
            {/* Report Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleNav('report-lost')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors shadow-sm"
              >
                + Report Lost
              </button>
              <button
                onClick={() => handleNav('report-found')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                + Report Found
              </button>
            </div>

            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 transition-colors"
                title="Quickly switch demo personas for testing"
              >
                <span>Demo User</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    Quick Persona Login
                  </div>
                  <button
                    onClick={() => handleQuickSwitch('student')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between text-slate-800"
                  >
                    <div>
                      <div className="font-semibold text-indigo-700">Alex Rivers (Student)</div>
                      <div className="text-[10px] text-slate-600">Lost Dell Laptop & ID</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Student</span>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('student2')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between text-slate-800"
                  >
                    <div>
                      <div className="font-semibold text-indigo-700">Priya Sharma (Student)</div>
                      <div className="text-[10px] text-slate-600">Found Dell Laptop in Library</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Student</span>
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('staff')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between text-slate-800"
                  >
                    <div>
                      <div className="font-semibold text-indigo-700">Dr. Vance (Faculty)</div>
                      <div className="text-[10px] text-slate-600">Found AirPods in Auditorium</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">Staff</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 flex items-center justify-between text-slate-800"
                  >
                    <div>
                      <div className="font-bold text-slate-900">Campus Safety Admin</div>
                      <div className="text-[10px] text-slate-600">Full moderation dashboard</div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-white font-semibold">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* User Dropdown or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {user.name}
                    </div>
                    <div className="text-[10px] font-medium text-slate-600 uppercase">
                      {user.role} • {user.college_id}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-600 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {user.role} ({user.college_id})
                      </span>
                    </div>

                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-600" />
                      Dashboard
                    </button>

                    <button
                      onClick={() => handleNav('my-reports')}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      My Reports
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => handleNav('admin')}
                        className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        handleNav('landing');
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav('report-lost')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-center text-rose-700 bg-rose-50 border border-rose-200"
            >
              + Report Lost
            </button>
            <button
              onClick={() => handleNav('report-found')}
              className="flex-1 py-2 rounded-lg text-xs font-semibold text-center text-white bg-emerald-600"
            >
              + Report Found
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => handleNav('browse')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Browse Items
            </button>
            {user ? (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => handleNav('my-reports')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Reports
                </button>
                <button
                  onClick={() => handleNav('messages')}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {user.role === 'admin' && (
                  <button
                    onClick={() => handleNav('admin')}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Admin Console
                  </button>
                )}
                <button
                  onClick={() => {
                    logout();
                    handleNav('landing');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleNav('login')}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-center text-slate-800 bg-slate-100"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNav('register')}
                  className="w-full py-2 rounded-lg text-sm font-semibold text-center text-white bg-indigo-600"
                >
                  Register College Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
