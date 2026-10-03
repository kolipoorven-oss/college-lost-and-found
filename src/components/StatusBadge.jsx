import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export default function StatusBadge({ status, size = 'sm' }) {
  const s = (status || 'active').toLowerCase();

  const sizeClasses = size === 'lg' 
    ? 'px-3 py-1 text-sm font-semibold'
    : 'px-2.5 py-0.5 text-xs font-medium';

  switch (s) {
    case 'active':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Active
        </span>
      );
    case 'recovered':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-green-50 text-green-700 border border-green-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
          Recovered
        </span>
      );
    case 'returned':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          Returned to Owner
        </span>
      );
    case 'claimed':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-purple-600" />
          Claim Pending
        </span>
      );
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          In Review
        </span>
      );
    case 'rejected':
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
          {status}
        </span>
      );
  }
}
