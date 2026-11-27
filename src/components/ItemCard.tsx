import React, { useState } from 'react';
import { ShareItem } from '../types';
import { ShieldCheck, MapPin, Wrench, Sparkles, Clock } from 'lucide-react';

interface ItemCardProps {
  item: ShareItem;
  onSelect: (item: ShareItem) => void;
  onRequestBorrow: (item: ShareItem) => void;
  distanceMiles?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onRequestBorrow,
  distanceMiles,
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Image container */}
      <div 
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onSelect(item)}
      >
        {!imgError && item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-emerald-50 text-slate-500">
            <Wrench className="w-10 h-10 text-emerald-600/70 mb-2" />
            <span className="text-xs font-semibold text-slate-700">{item.title}</span>
            <span className="text-[11px] text-slate-600 mt-1">{item.category}</span>
          </div>
        )}

        {/* Condition chip top-left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>{item.condition}</span>
        </div>

        {/* Informational Daily Fee Tag top-right */}
        <div className="absolute top-3 right-3">
          {item.dailyFee === 0 ? (
            <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
              Free to borrow
            </div>
          ) : (
            <div className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs tabular-nums">
              ${item.dailyFee}/day
            </div>
          )}
        </div>

        {/* Informational Deposit info bottom bar */}
        {item.refundableDeposit > 0 && (
          <div className="absolute bottom-2 left-2 right-2 bg-amber-500/95 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded text-center shadow-xs">
            ${item.refundableDeposit} refundable deposit · at pickup
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Category & Location metadata with Distance Badge */}
          <div className="flex items-center justify-between gap-2 text-xs font-medium text-slate-500 mb-1.5 flex-wrap">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-emerald-700 font-semibold">{item.category}</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-slate-600 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{item.neighborhood}</span>
              </span>
            </div>

            {distanceMiles !== undefined && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 tabular-nums ${
                  distanceMiles <= 5
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
                title={distanceMiles <= 5 ? 'Within your 5-mile neighborhood radius' : 'Outside 5-mile radius'}
              >
                {distanceMiles < 1 ? '< 1 mi' : `${distanceMiles} mi`}
              </span>
            )}

            {item.isDemo && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0"
                title="Sample demonstration item"
              >
                Showcase
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(item)}
            className="text-base font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors cursor-pointer line-clamp-2"
          >
            {item.title}
          </h3>

          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Lender and Trust info */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0">
              {item.lender.avatar}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 truncate">
                {item.lender.name}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="tabular-nums">{item.lender.trustScore}% Neighbor Trust</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onRequestBorrow(item)}
            className="px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-white hover:bg-emerald-600 bg-emerald-50 rounded-lg transition-colors shrink-0 whitespace-nowrap active:scale-95"
          >
            Borrow
          </button>
        </div>
      </div>
    </div>
  );
};
