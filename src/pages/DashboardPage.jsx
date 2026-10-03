import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import MatchCard from '../components/MatchCard';
import StatusBadge from '../components/StatusBadge';
import { 
  Sparkles, 
  PlusCircle, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Compass
} from 'lucide-react';

export default function DashboardPage({ setActivePage, setSelectedItem }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ lost: 0, found: 0, recovered: 0 });
  const [matches, setMatches] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    // Fetch user dashboard data
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const [meRes, matchesRes, recentRes] = await Promise.all([
          fetch('/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/matches', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/items/my/all', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.stats) setStats(meData.stats);
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json();
          setMatches(matchesData.matches || []);
        }

        if (recentRes.ok) {
          const recentData = await recentRes.json();
          setRecentItems((recentData.items || []).slice(0, 4));
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Compass className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Campus Member Portal</h2>
        <p className="text-xs text-slate-500">Sign in to access your personal campus lost & found dashboard.</p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span>{user.role?.toUpperCase()} ACCOUNT • {user.college_id}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.name}!
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed max-w-xl">
              {user.department || 'Campus Member'} • Keep track of your reports and stay notified when our smart algorithm finds potential item matches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActivePage('report-lost')}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-transform hover:-translate-y-0.5"
            >
              + Report Lost Item
            </button>
            <button
              onClick={() => setActivePage('report-found')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-transform hover:-translate-y-0.5"
            >
              + Report Found Item
            </button>
            <button
              onClick={() => setActivePage('browse')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
            >
              Search All Items
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">My Lost Reports</div>
          <div className="text-3xl font-black text-rose-600">{stats.lost}</div>
          <p className="text-[11px] text-slate-400">Items you are searching for</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">My Found Reports</div>
          <div className="text-3xl font-black text-emerald-600">{stats.found}</div>
          <p className="text-[11px] text-slate-400">Items you recovered on campus</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Potential Matches</div>
          <div className="text-3xl font-black text-amber-500 flex items-center gap-1">
            <span>{matches.length}</span>
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-400">Similarity algorithm detections</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Recovered Items</div>
          <div className="text-3xl font-black text-indigo-600">{stats.recovered}</div>
          <p className="text-[11px] text-slate-400">Reunited items</p>
        </div>

      </div>

      {/* Smart Matches Alert Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Smart Matches for Your Reports ({matches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500">Automatic Attribute Cross-Check</span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700 text-sm">No Pending Smart Matches</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When a campus member reports an item that matches your keywords, category, or location, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(m => (
              <div 
                key={m.id}
                className="bg-white rounded-2xl border-2 border-indigo-100 p-4 shadow-sm hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {Math.round(m.match_score)}% Potential Match
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Match Pair overview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-100">
                    <span className="text-[10px] font-extrabold uppercase text-rose-700">Lost Report</span>
                    <h5 className="font-bold text-slate-900 truncate mt-0.5">{m.lostItem.title}</h5>
                    <p className="text-[11px] text-slate-500 truncate">{m.lostItem.location}</p>
                  </div>
                  <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-700">Found Report</span>
                    <h5 className="font-bold text-slate-900 truncate mt-0.5">{m.foundItem.title}</h5>
                    <p className="text-[11px] text-slate-500 truncate">{m.foundItem.location}</p>
                  </div>
                </div>

                {/* Reasons preview */}
                <div className="space-y-1">
                  {m.reasons.slice(0, 3).map((r, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{r}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedItem({ id: m.lostItem.id });
                      setActivePage('item-detail');
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    View Comparison <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => setActivePage('messages')}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" /> Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Recent Reports Quick List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              My Recent Reports
            </h2>
          </div>
          <button
            onClick={() => setActivePage('my-reports')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View All ({recentItems.length})
          </button>
        </div>

        {recentItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500">
            You haven't submitted any reports yet. Use the buttons above to log a lost or found item.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentItems.map(item => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setActivePage('item-detail');
                }}
                className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-indigo-200 hover:shadow-sm transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {item.type}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h4 className="font-bold text-slate-900 text-sm truncate">{item.title}</h4>
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span className="truncate">{item.location}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
