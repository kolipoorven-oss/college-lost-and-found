import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Calendar, 
  Tag, 
  ArrowRight, 
  MessageSquare,
  ShieldAlert,
  Info
} from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function MatchCard({ match, onViewItem, onContact }) {
  const { matchedItem, score, reasons, breakdown } = match;

  // Determine score badge styling
  let scoreBg = 'bg-emerald-500';
  let scoreBadgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
  let scoreText = 'Strong Match';

  if (score < 70 && score >= 55) {
    scoreBg = 'bg-amber-500';
    scoreBadgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
    scoreText = 'Moderate Match';
  } else if (score < 55) {
    scoreBg = 'bg-slate-500';
    scoreBadgeColor = 'text-slate-700 bg-slate-50 border-slate-200';
    scoreText = 'Low Match';
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md hover:shadow-lg transition-all p-5 space-y-4">
      {/* Header with Match Percentage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {/* Circular score badge */}
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-extrabold shadow-md ${scoreBg}`}>
              <span className="text-lg leading-none">{Math.round(score)}%</span>
              <span className="text-[9px] uppercase tracking-tighter opacity-90">MATCH</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${scoreBadgeColor}`}>
                {scoreText}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Algorithm Confidence Score
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mt-0.5">
              Potential {matchedItem.type === 'lost' ? 'Lost Item' : 'Found Item'} Match
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onContact && (
            <button
              onClick={() => onContact(matchedItem)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Contact
            </button>
          )}
          {onViewItem && (
            <button
              onClick={() => onViewItem(matchedItem.id)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1"
            >
              View Item <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Matched Item Brief */}
      <div className="flex items-start gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/70">
        {matchedItem.image_url ? (
          <img 
            src={matchedItem.image_url} 
            alt={matchedItem.title} 
            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
              matchedItem.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {matchedItem.type}
            </span>
            <StatusBadge status={matchedItem.status} />
          </div>
          <h5 className="font-bold text-slate-900 text-sm truncate mt-1">
            {matchedItem.title}
          </h5>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {matchedItem.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {matchedItem.date}
            </span>
          </div>
        </div>
      </div>

      {/* Human-Readable Match Reasons Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Why this might be your item:
          </span>
          <span className="text-[11px] text-slate-400">Rule-based scoring</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {reasons && reasons.map((reason, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Caution Verification Notice */}
      <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Campus Notice:</strong> Matches are potential suggestions generated through keyword, category, date, and location similarity. Please verify unique identifying details with the reporter before claiming.
        </span>
      </div>
    </div>
  );
}
