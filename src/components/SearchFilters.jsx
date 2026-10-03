import React from 'react';
import { Search, X, Filter, RotateCcw, Calendar, MapPin, Tag } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Bags & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Water Bottles',
  'Other'
];

const CAMPUS_LOCATIONS = [
  'All',
  'Central Library',
  'Library Block',
  'Main Canteen / Food Court',
  'Campus Gym / Fitness Center',
  'Sports Complex',
  'Main Auditorium',
  'Science Block',
  'Computer Centre',
  'Student Union Plaza',
  'Hostel / Dorm Blocks'
];

export default function SearchFilters({ filters, setFilters, onReset }) {
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      
      {/* Top Search bar & Type Toggle */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.q}
            onChange={(e) => updateFilter('q', e.target.value)}
            placeholder="Search by keywords, brand, color, location (e.g. Dell laptop, black bottle)..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
          />
          {filters.q && (
            <button
              onClick={() => updateFilter('q', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type Toggle: All / Lost / Found */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => updateFilter('type', 'all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items
          </button>
          <button
            type="button"
            onClick={() => updateFilter('type', 'lost')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === 'lost'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-rose-600'
            }`}
          >
            Lost Reports
          </button>
          <button
            type="button"
            onClick={() => updateFilter('type', 'found')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filters.type === 'found'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Found Reports
          </button>
        </div>
      </div>

      {/* Filter Row: Category, Location, Status, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        
        {/* Category */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Campus Location */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Campus Zone
          </label>
          <select
            value={filters.location}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {CAMPUS_LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Report Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="active">Active Only</option>
            <option value="all">All Statuses</option>
            <option value="recovered">Recovered</option>
            <option value="returned">Returned to Owner</option>
            <option value="claimed">Claim Pending</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Sort Order
          </label>
          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="newest">Newest Reported</option>
            <option value="oldest">Oldest First</option>
            <option value="date">Date Lost / Found</option>
          </select>
        </div>

      </div>

      {/* Date Pickers & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Date Range:
          </span>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => updateFilter('dateFrom', e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => updateFilter('dateTo', e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Filters
        </button>
      </div>

    </div>
  );
}
