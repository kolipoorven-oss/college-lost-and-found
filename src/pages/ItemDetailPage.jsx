import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import MatchCard from '../components/MatchCard';
import ContactModal from '../components/ContactModal';
import ReportFlagModal from '../components/ReportFlagModal';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles, 
  MessageSquare, 
  CheckCircle2, 
  Trash2, 
  Flag,
  Share2,
  Lock,
  UserCheck
} from 'lucide-react';

export default function ItemDetailPage({ itemId, setActivePage, setSelectedItem }) {
  const { user, token } = useAuth();
  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchItemDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/items/${itemId}`, { headers });
      if (!res.ok) throw new Error('Item not found or removed');
      const data = await res.json();
      
      setItem(data.item);
      setMatches(data.matches || []);
      setIsOwner(data.isOwner);
      setIsAdmin(data.isAdmin);
    } catch (err) {
      console.error('Item detail fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) {
      fetchItemDetail();
    }
  }, [itemId, token]);

  const handleMarkStatus = async (newStatus) => {
    if (!token) return;
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/items/${itemId}/status`, {
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

      await fetchItemDetail();
    } catch (err) {
      alert(err.message);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete report');
      alert('Report removed successfully');
      setActivePage('browse');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs font-semibold text-slate-500">Loading campus item record & smart matches...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Unable to display report</h3>
        <p className="text-xs text-slate-500">{error || 'This report may have been deleted.'}</p>
        <button
          onClick={() => setActivePage('browse')}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isLost = item.type === 'lost';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <button
        onClick={() => setActivePage('browse')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Main Item Card Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left: Item Photo */}
        <div className="lg:col-span-5 bg-slate-900 flex items-center justify-center relative min-h-[320px]">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <Tag className="w-16 h-16 mx-auto stroke-1" />
              <p className="text-xs font-medium">No photo uploaded by reporter</p>
            </div>
          )}

          {/* Type Badge Overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`px-3 py-1 rounded-xl text-xs font-extrabold uppercase shadow-md ${
              isLost ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {item.type} ITEM
            </span>
            <StatusBadge status={item.status} size="lg" />
          </div>
        </div>

        {/* Right: Item Metadata & Details */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & Tags */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                {item.category}
              </span>
              {item.brand && (
                <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Brand: {item.brand}
                </span>
              )}
              {item.color && (
                <span className="font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Color: {item.color}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>

            {/* Location & Date details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                  Campus Location
                </span>
                <p className="font-semibold text-slate-800 text-sm">{item.location}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Date & Time {isLost ? 'Lost' : 'Found'}
                </span>
                <p className="font-semibold text-slate-800 text-sm">
                  {item.date} {item.approximate_time && `at ${item.approximate_time}`}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Item Description
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white">
                {item.description}
              </p>
            </div>

            {/* Identifying Details */}
            {item.identifying_details && (
              <div className="space-y-1.5 bg-amber-50/50 border border-amber-200/70 p-3.5 rounded-2xl">
                <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Unique Ownership Proof / Identifying Marks
                </h4>
                <p className="text-xs text-amber-900 leading-relaxed">
                  {item.identifying_details}
                </p>
              </div>
            )}

            {/* Reporter Privacy Shield Card */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {item.reporter?.name ? item.reporter.name.charAt(0) : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">{item.reporter?.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                      {item.reporter?.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {item.reporter?.maskedCollegeId || item.reporter?.college_id} • Verified Campus Member
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Identity Protected</span>
              </div>
            </div>

          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            
            {/* If Owner or Admin */}
            {(isOwner || isAdmin) ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {item.status === 'active' && (
                  <button
                    onClick={() => handleMarkStatus(isLost ? 'recovered' : 'returned')}
                    disabled={statusUpdating}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as {isLost ? 'Recovered' : 'Returned'} 🎉</span>
                  </button>
                )}
                {item.status !== 'active' && (
                  <button
                    onClick={() => handleMarkStatus('active')}
                    disabled={statusUpdating}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Reopen as Active
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Report
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all transform hover:-translate-y-0.5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contact {isLost ? 'Finder' : 'Reporter'}</span>
                </button>
                <button
                  onClick={() => setFlagModalOpen(true)}
                  className="px-3 py-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                  title="Report inappropriate or suspicious content"
                >
                  <Flag className="w-3.5 h-3.5" />
                  Report Post
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-600">
              Reported on {new Date(item.created_at).toLocaleDateString()}
            </div>

          </div>

        </div>

      </div>

      {/* Smart Matches Found Section */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Potential Smart Matches ({matches.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated cross-referencing between this {item.type} report and existing campus reports.
            </p>
          </div>

          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 self-start sm:self-auto">
            Algorithm Confidence Threshold: ≥ 50%
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Potential Matches Found Yet</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Our background matching engine continually checks new lost and found reports as they are submitted by students and faculty.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((m, idx) => (
              <MatchCard
                key={idx}
                match={m}
                onViewItem={(id) => {
                  setSelectedItem({ id });
                  setActivePage('item-detail');
                }}
                onContact={(matched) => {
                  setContactModalOpen(true);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ContactModal
        item={item}
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onMessageSent={() => {
          alert('Message sent! You can view the full conversation in your Messages inbox.');
        }}
      />

      <ReportFlagModal
        itemId={item.id}
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
      />

    </div>
  );
}
