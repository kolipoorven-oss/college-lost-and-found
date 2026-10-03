import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowRight,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

export default function MyReportsPage({ setActivePage, setSelectedItem }) {
  const { user, token } = useAuth();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState('all'); // 'all' | 'lost' | 'found' | 'recovered'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyReports = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/items/my/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load your reports');
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [token]);

  const handleMarkStatus = async (item, newStatus) => {
    try {
      const res = await fetch(`/api/items/${item.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');

      if (['recovered', 'returned'].includes(newStatus)) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      await fetchMyReports();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete report');
      await fetchMyReports();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <FileText className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Please Sign In</h3>
        <p className="text-xs text-slate-500">Sign in with your college account to view and manage your reports.</p>
        <button
          onClick={() => setActivePage('login')}
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const filteredItems = items.filter(item => {
    if (tab === 'lost') return item.type === 'lost' && item.status === 'active';
    if (tab === 'found') return item.type === 'found' && item.status === 'active';
    if (tab === 'recovered') return ['recovered', 'returned'].includes(item.status);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              {user.role} Portal
            </span>
            <span className="text-xs text-slate-500 font-semibold">{user.college_id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Campus Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your submitted lost and found items, review smart matches, or update recovery status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('report-lost')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
          >
            + Report Lost
          </button>
          <button
            onClick={() => setActivePage('report-found')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { key: 'all', label: `All Reports (${items.length})` },
          { key: 'lost', label: `Active Lost (${items.filter(i => i.type === 'lost' && i.status === 'active').length})` },
          { key: 'found', label: `Active Found (${items.filter(i => i.type === 'found' && i.status === 'active').length})` },
          { key: 'recovered', label: `Recovered / Returned (${items.filter(i => ['recovered', 'returned'].includes(i.status)).length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              tab === t.key
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">No reports in this category</h4>
            <p className="text-xs text-slate-500 mt-1">You haven't logged any items in this view yet.</p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setActivePage('report-lost')}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
            >
              Report Lost Item
            </button>
            <button
              onClick={() => setActivePage('report-found')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Report Found Item
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => {
            const isLost = item.type === 'lost';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-200 hover:shadow-sm transition-all"
              >
                {/* Item Details */}
                <div className="flex items-start gap-4">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <Tag className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {item.type}
                      </span>
                      <StatusBadge status={item.status} />
                      {item.potentialMatchesCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                          <Sparkles className="w-3 h-3 text-amber-500" />
                          {item.potentialMatchesCount} Potential Matches
                        </span>
                      )}
                    </div>

                    <h3 
                      onClick={() => {
                        setSelectedItem(item);
                        setActivePage('item-detail');
                      }}
                      className="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      {item.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {item.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0">
                  {item.status === 'active' && (
                    <button
                      onClick={() => handleMarkStatus(item, isLost ? 'recovered' : 'returned')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark {isLost ? 'Recovered' : 'Returned'} 🎉
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setActivePage('item-detail');
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
