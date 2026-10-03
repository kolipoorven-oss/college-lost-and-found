import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export default function LoginPage({ setActivePage }) {
  const { login, quickLogin } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(identifier, password);
      setActivePage('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      if (role === 'admin') {
        setActivePage('admin');
      } else {
        setActivePage('dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      
      {/* Brand header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
          <Compass className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Campus Portal Login
        </h1>
        <p className="text-xs text-slate-500">
          Sign in using your university email address or student/staff ID
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              College Email or ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. alex.rivers@college.edu or STU-8841"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
          </button>
        </form>

        {/* Quick Demo Switcher Section */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <span>One-Click Demo Personas:</span>
            <span className="text-indigo-600 font-semibold">Ready to test</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('student')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">Alex Rivers</div>
              <div className="text-[10px] text-slate-500">Student (Lost Dell Laptop)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('student2')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">Priya Sharma</div>
              <div className="text-[10px] text-slate-500">Student (Found Laptop)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('staff')}
              className="p-2.5 text-left rounded-xl bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200 transition-colors"
            >
              <div className="text-xs font-bold text-slate-800">Dr. Marcus Vance</div>
              <div className="text-[10px] text-slate-500">Faculty Staff (Found AirPods)</div>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('admin')}
              className="p-2.5 text-left rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors"
            >
              <div className="text-xs font-bold text-cyan-300">Campus Admin</div>
              <div className="text-[10px] text-slate-300">Full Moderation Console</div>
            </button>
          </div>
        </div>

      </div>

      {/* Footer link to register */}
      <div className="text-center text-xs text-slate-500">
        Don't have an account yet?{' '}
        <button
          onClick={() => setActivePage('register')}
          className="font-bold text-indigo-600 hover:underline"
        >
          Register College ID
        </button>
      </div>

    </div>
  );
}
