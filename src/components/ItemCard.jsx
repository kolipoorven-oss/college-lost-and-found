import React from 'react';
import StatusBadge from './StatusBadge';
import { 
  MapPin, 
  Calendar, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight,
  Laptop,
  CreditCard,
  Key,
  Briefcase,
  BookOpen,
  Shirt,
  Coffee,
  HelpCircle
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Electronics': Laptop,
  'IDs & Cards': CreditCard,
  'Keys': Key,
  'Bags & Wallets': Briefcase,
  'Books & Stationery': BookOpen,
  'Clothing & Accessories': Shirt,
  'Water Bottles': Coffee,
  'Other': HelpCircle
};

export default function ItemCard({ item, onSelect, onContact }) {
  const IconComponent = CATEGORY_ICONS[item.category] || HelpCircle;
  const isLost = item.type === 'lost';

  return (
    <div 
      onClick={() => onSelect(item)}
      className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-400">
            <IconComponent className="w-12 h-12 stroke-[1.5]" />
            <span className="text-xs font-medium mt-1">No image attached</span>
          </div>
        )}

        {/* Type Badge: LOST or FOUND */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold tracking-wider uppercase shadow-sm ${
            isLost 
              ? 'bg-rose-600 text-white' 
              : 'bg-emerald-600 text-white'
          }`}>
            {item.type}
          </span>
          <StatusBadge status={item.status} />
        </div>

        {/* Smart Matches Alert Pill */}
        {item.potentialMatchesCount > 0 && (
          <div className="absolute bottom-3 right-3 bg-amber-500/95 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{item.potentialMatchesCount} {item.potentialMatchesCount === 1 ? 'Match' : 'Matches'}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              <IconComponent className="w-3 h-3" />
              {item.category}
            </span>
            {item.brand && (
              <span className="text-slate-400 font-medium">
                • {item.brand}
              </span>
            )}
            {item.color && (
              <span className="text-slate-400 font-medium">
                • {item.color}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Meta details footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{item.date} {item.approximate_time && `at ${item.approximate_time}`}</span>
            </div>
            
            <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
