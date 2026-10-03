import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Send, 
  ShieldCheck, 
  Tag, 
  MapPin, 
  Lock, 
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function ContactModal({ item, isOpen, onClose, onMessageSent }) {
  const { user, token } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !item) return null;

  const quickTemplates = [
    item.type === 'found'
      ? "Hi! I believe this is my item. I can provide the serial number / proof of ownership to verify."
      : "Hi! I found an item matching your lost report. Please let me know how to return it.",
    "Is this item still available at the campus collection desk?",
    "Where and when can we meet on campus to verify and claim the item?"
  ];

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!user) {
      setError('Please log in with your college account to message the reporter.');
      return;
    }

    if (user.id === item.user_id) {
      setError('You are the reporter of this item.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiver_id: item.user_id,
          item_id: item.id,
          message: message.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSuccess(true);
      setMessage('');
      if (onMessageSent) {
        onMessageSent(data.data);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Secure Campus Messenger
              </h3>
              <p className="text-[11px] text-slate-500">
                Contact Reporter with Privacy Protection
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary Card */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center gap-3">
            {item.image_url ? (
              <img 
                src={item.image_url} 
                alt={item.title} 
                className="w-14 h-14 rounded-xl object-cover border border-indigo-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Tag className="w-6 h-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  item.type === 'lost' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {item.type}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {item.category}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm truncate mt-0.5">
                {item.title}
              </h4>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{item.location}</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Notice */}
          <div className="flex items-start gap-2.5 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-emerald-900 text-xs">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Zero-Exposure Privacy:</strong> Your personal email and phone number will remain hidden. The reporter will receive your message in their CampusFinder Inbox.
            </p>
          </div>

          {/* Quick Message Chips */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setMessage(tmpl)}
                  className="text-left text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors leading-snug"
                >
                  {tmpl}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your inquiry or provide details that prove your ownership..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Message delivered to reporter's CampusFinder inbox!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim() || success}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center gap-1.5"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Secure Message</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
