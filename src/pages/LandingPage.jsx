import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  MapPin, 
  Laptop, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Compass,
  Zap,
  Building2,
  Users
} from 'lucide-react';
import ItemCard from '../components/ItemCard';

export default function LandingPage({ setActivePage, setSelectedItem, setFilterState }) {
  const [stats, setStats] = useState({
    totalReports: 12,
    recoveredItems: 4,
    activeReports: 8,
    matchRate: 85
  });
  const [recentItems, setRecentItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Fetch recent items and stats
    fetch('/api/items?limit=6')
      .then(res => res.json())
      .then(data => {
        if (data.items) {
          setRecentItems(data.items.slice(0, 6));
        }
      })
      .catch(console.error);

    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.summary) {
          setStats({
            totalReports: data.summary.totalReports || 12,
            recoveredItems: data.summary.totalRecovered || 4,
            activeReports: data.summary.totalActive || 8,
            matchRate: data.summary.recoveryRate || 85
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (setFilterState) {
      setFilterState(prev => ({ ...prev, q: searchQuery, type: 'all' }));
    }
    setActivePage('browse');
  };

  const handleQuickCategory = (cat) => {
    if (setFilterState) {
      setFilterState(prev => ({ ...prev, category: cat, type: 'all' }));
    }
    setActivePage('browse');
  };

  return (
    <div className="space-y-16 pb-12">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-indigo-50/70 via-slate-50 to-slate-50 border-b border-slate-200/60">
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-cyan-200/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Campus Tag Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-indigo-100 shadow-sm text-xs font-bold text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span>Official Campus Lost & Found System</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium">Smart AI Attribute Matching</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Never lose track of what’s yours on <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-indigo-600 to-cyan-500">campus.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl mx-auto">
              Report lost electronics, bags, IDs, and keys in seconds. Our smart matching algorithm cross-references categories, locations, and unique attributes to reunite you with your belongings quickly.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleHeroSearch} className="max-w-2xl mx-auto pt-2">
              <div className="relative flex items-center bg-white rounded-2xl shadow-xl shadow-indigo-500/5 border-2 border-indigo-100 focus-within:border-indigo-500 transition-all p-1.5">
                <Search className="w-5 h-5 text-indigo-500 ml-3.5 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campus reports (e.g., 'Dell laptop Library', 'AirPods Auditorium')..."
                  className="w-full px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md shadow-indigo-600/20 shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActivePage('report-lost')}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Report Lost Item</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('report-found')}
                className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <span>Report Found Item</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('browse')}
                className="px-5 py-3 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
              >
                Browse All Items
              </button>
            </div>

            {/* Quick Categories Bar */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-semibold mr-1">Popular:</span>
              {['Electronics', 'IDs & Cards', 'Water Bottles', 'Keys', 'Bags & Wallets'].map(cat => (
                <button
                  key={cat}
                  onClick={() => handleQuickCategory(cat)}
                  className="px-3 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-600 font-medium transition-colors shadow-2xs"
                >
                  {cat}
                </button>
              ))}
            </div>

          </div>

        </div>

      </section>

      {/* Live Campus Recovery Stats Counters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            
            <div className="pt-2 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">
                {stats.totalReports}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Total Campus Reports
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Active & archived logs
              </div>
            </div>

            <div className="pt-2 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600">
                {stats.recoveredItems}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Items Successfully Recovered
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Reunited with owners
              </div>
            </div>

            <div className="pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-cyan-600">
                {stats.activeReports}
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Active Listings
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Pending claim verification
              </div>
            </div>

            <div className="pt-4 lg:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-purple-600 flex items-center justify-center gap-1">
                <span>{stats.matchRate}%</span>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mt-1">
                Recovery Success Rate
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                High-confidence matches
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How the Smart Matching System Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Intelligent Campus Architecture</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How Smart Matching Works
          </h2>
          <p className="text-sm text-slate-600">
            Our multi-attribute similarity engine compares your report with existing records across 6 weighted parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Submit a Campus Report
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Fill in the title, category, color, brand, campus building, date, and unique markings (stickers, serial numbers). Optionally upload a photo.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 to-white p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Smart Engine
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-indigo-500/20">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Multi-Attribute Cross Check
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The algorithm evaluates Category (25%), Keywords (25%), Location Clusters (20%), Color (10%), Brand (10%), and Date Proximity (10%).
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-3 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">
              Connect & Securely Recover
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review match confidence scores with detailed explanations. Contact the reporter through in-app messaging while your personal email remains hidden.
            </p>
          </div>

        </div>
      </section>

      {/* Recent Items Preview Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Real-time Campus Activity
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Recently Reported Items
            </h2>
          </div>

          <button
            onClick={() => setActivePage('browse')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-4 py-2 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onSelect={(selected) => {
                setSelectedItem(selected);
                setActivePage('item-detail');
              }}
            />
          ))}
        </div>
      </section>

      {/* College Desk Notice & Security Hotline Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span>Campus Safety & Security Office</span>
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight">
              Found a high-value item on campus?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Laptops, smartphones, and official student RFID badges should be submitted directly to the Central Library Help Desk or Campus Security Gate 1 for secure custody.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setActivePage('report-found')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-500/20"
            >
              Report Found Item Now
            </button>
            <button
              onClick={() => setActivePage('browse')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors"
            >
              Search Database
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
