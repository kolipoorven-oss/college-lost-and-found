import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Upload, 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';

const CATEGORIES = [
  'Electronics',
  'IDs & Cards',
  'Keys',
  'Bags & Wallets',
  'Books & Stationery',
  'Clothing & Accessories',
  'Water Bottles',
  'Other'
];

const POPULAR_LOCATIONS = [
  'Central Library, 2nd Floor',
  'Library Block, Table Area',
  'Main Canteen / Food Court',
  'Campus Gym / Fitness Center',
  'Sports Complex / Indoor Court',
  'Main Auditorium, Row J',
  'Science Block, Room 302',
  'Computer Centre, Ground Floor',
  'Student Union Plaza',
  'Engineering Block A',
  'Hostel / Dormitory Quad'
];

export default function ReportItemPage({ initialType = 'lost', setActivePage, setSelectedItem }) {
  const { user, token } = useAuth();
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [approximateTime, setApproximateTime] = useState('');
  const [identifyingDetails, setIdentifyingDetails] = useState('');

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Live match preview
  const [liveMatches, setLiveMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(false);

  // Form submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  // Live matching radar debounce
  useEffect(() => {
    if (!title.trim() || title.length < 3) {
      setLiveMatches([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingMatches(true);
      try {
        const res = await fetch('/api/matches/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            category,
            description,
            color,
            brand,
            location,
            date,
            type,
            identifying_details: identifyingDetails
          })
        });
        if (res.ok) {
          const data = await res.json();
          setLiveMatches(data.matches || []);
        }
      } catch (err) {
        console.error('Preview match error:', err);
      } finally {
        setLoadingMatches(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, category, color, brand, location, type]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in or register before submitting a report.');
      return;
    }

    if (!title.trim() || !category || !description.trim() || !location.trim() || !date) {
      setError('Please fill in all required fields (Title, Category, Description, Campus Location, Date).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('color', color.trim());
      formData.append('brand', brand.trim());
      formData.append('location', location.trim());
      formData.append('date', date);
      formData.append('approximate_time', approximateTime.trim());
      formData.append('identifying_details', identifyingDetails.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit report');
      }

      alert(`Success! Your ${type} item report has been published.${data.matchesFoundCount > 0 ? ` Found ${data.matchesFoundCount} potential smart matches!` : ''}`);
      setSelectedItem(data.item);
      setActivePage('item-detail');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isLost = type === 'lost';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header & Type Toggle */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {type} REPORT
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Official Campus Recovery Log
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Report a {isLost ? 'Lost Item' : 'Found Item'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Provide as many accurate details as possible to trigger the Smart Match similarity engine.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'lost'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              Lost Something
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'found'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-600'
              }`}
            >
              Found Something
            </button>
          </div>
        </div>

        {/* Live Matching Radar Banner (if potential matches detected while typing) */}
        {liveMatches.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-indigo-50 border-2 border-amber-200/80 rounded-2xl space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Live Campus Radar: {liveMatches.length} Potential {isLost ? 'Found' : 'Lost'} Matches Detected!</span>
              </div>
              <span className="text-[11px] text-slate-500">Real-time cross-match</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {liveMatches.map((m, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                        {Math.round(m.score)}% Match
                      </span>
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {m.matchedItem.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {m.matchedItem.location} • {m.matchedItem.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedItem(m.matchedItem);
                      setActivePage('item-detail');
                    }}
                    className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          
          {/* Item Name / Title */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Item Title / Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isLost ? "e.g., Black Dell XPS 15 Laptop, Navy Hydro Flask" : "e.g., Black Dell Laptop in sleeve, Wireless Earbuds"}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category, Brand, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Dell, Apple, Casio, Nike"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Primary Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g. Black, Navy Blue, Silver"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Campus Location */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Campus Location {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Central Library 2nd floor quiet room, Sports Complex bleachers..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {/* Quick popular location chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400 font-semibold self-center mr-1">Quick Picks:</span>
              {POPULAR_LOCATIONS.slice(0, 5).map(loc => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setLocation(loc)}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition-colors"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Approximate Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Date {isLost ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Approximate Time (Optional)
              </label>
              <input
                type="text"
                value={approximateTime}
                onChange={(e) => setApproximateTime(e.target.value)}
                placeholder="e.g. 11:30 AM, During Calculus lecture"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a helpful general description of the item, what condition it was in, or where specifically it was situated..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Identifying Details (Crucial for Ownership Verification) */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Unique Identifying Marks / Serial Number / Proof Details</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Add details that only the true owner would know (e.g. stickers on laptop, scratch on watch back, initial on keychain). This helps verify rightful ownership before handing over items.
            </p>
            <textarea
              rows={2}
              value={identifyingDetails}
              onChange={(e) => setIdentifyingDetails(e.target.value)}
              placeholder="e.g. Has university CS sticker on lid, dent on bottom rim, ID card number ends in 8841..."
              className="w-full p-3 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            />
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Upload Item Photo (Optional)
            </label>
            
            {imagePreview ? (
              <div className="relative w-full max-w-xs aspect-video rounded-2xl overflow-hidden border-2 border-indigo-200 group">
                <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-md hover:bg-rose-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Click or drag photo here to upload</p>
                  <p className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Error notice */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setActivePage('browse')}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2 ${
                isLost 
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <span>Publishing to Campus Network...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit {isLost ? 'Lost Item' : 'Found Item'} Report</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
