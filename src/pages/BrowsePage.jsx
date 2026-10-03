import React, { useState, useEffect } from 'react';
import SearchFilters from '../components/SearchFilters';
import ItemCard from '../components/ItemCard';
import { Search, Frown, Sparkles, Filter, RefreshCw } from 'lucide-react';

export default function BrowsePage({ setActivePage, setSelectedItem, filterState, setFilterState }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch items based on current filters
  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterState.type && filterState.type !== 'all') params.append('type', filterState.type);
      if (filterState.category && filterState.category !== 'All') params.append('category', filterState.category);
      if (filterState.location && filterState.location !== 'All') params.append('location', filterState.location);
      if (filterState.status) params.append('status', filterState.status);
      if (filterState.q) params.append('q', filterState.q);
      if (filterState.dateFrom) params.append('dateFrom', filterState.dateFrom);
      if (filterState.dateTo) params.append('dateTo', filterState.dateTo);
      if (filterState.sort) params.append('sort', filterState.sort);

      const res = await fetch(`/api/items?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load items');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error('Fetch items error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filterState]);

  const handleReset = () => {
    setFilterState({
      type: 'all',
      category: 'All',
      location: 'All',
      status: 'active',
      q: '',
      dateFrom: '',
      dateTo: '',
      sort: 'newest'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Lost & Found Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Search, filter, and discover reported items across the university campus.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('report-lost')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            + Report Lost
          </button>
          <button
            onClick={() => setActivePage('report-found')}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* Filter Component */}
      <SearchFilters
        filters={filterState}
        setFilters={setFilterState}
        onReset={handleReset}
      />

      {/* Results Header Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          Showing <strong className="text-slate-800">{items.length}</strong> {items.length === 1 ? 'record' : 'records'}
          {filterState.type !== 'all' && ` (${filterState.type} items)`}
        </span>
        <button
          onClick={fetchItems}
          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Item Cards Grid / Loading / Empty States */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 animate-pulse">
              <div className="aspect-[16/10] bg-slate-200 rounded-xl"></div>
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center space-y-2">
          <p className="font-semibold text-sm">Error loading campus records</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={fetchItems}
            className="px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base">No items match your criteria</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Try adjusting your search terms, changing the category, or expanding the date range.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
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
      )}

    </div>
  );
}
