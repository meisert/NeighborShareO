import React, { useState } from 'react';
import { IsoRequest, ItemCategory, UserAccount } from '../types';
import { 
  HeartHandshake, 
  PlusCircle, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  MessageCircle, 
  Search, 
  Sparkles,
  Lock
} from 'lucide-react';

interface IsoBoardProps {
  isoRequests: IsoRequest[];
  onOpenPostModal: () => void;
  onOpenResponseModal: (iso: IsoRequest) => void;
  currentUser?: UserAccount | null;
  onRequireLogin?: (reason: string) => void;
}

export const IsoBoard: React.FC<IsoBoardProps> = ({
  isoRequests,
  onOpenPostModal,
  onOpenResponseModal,
  currentUser,
  onRequireLogin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = isoRequests.filter((req) => {
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.neighborhood.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Post CTA */}
      <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-md mb-2">
            <HeartHandshake className="w-3.5 h-3.5 text-amber-700" />
            <span>Community Wishlist & Requests</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Need something that isn't in the garage yet?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            Post an item request. Neighbors with spare tools, extra lawn gear, or party supplies in their sheds will reach out directly to let you borrow it.
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) {
              onRequireLogin?.('Please log in or create an account to post an item request to neighbors.');
            } else {
              onOpenPostModal();
            }
          }}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-xs shrink-0 self-start md:self-center active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Ask for an Item</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Category Pills (Functional buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['All', 'Tools', 'Outdoor', 'Kitchen', 'Party', 'Camping', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search requested items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs font-medium text-slate-900 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Request Cards Grid */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No open requests match your filter</h3>
          <p className="text-xs text-slate-500">Be the first neighbor to post a request for an item you need!</p>
          <button
            onClick={onOpenPostModal}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Ask for an Item</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header metadata */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200/60">
                    {req.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>Needed by {new Date(req.neededByDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {req.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {req.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                {/* Poster info */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center justify-center">
                      {req.posterAvatar}
                    </div>
                    <span className="font-medium text-slate-700">{req.posterName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{req.neighborhood}</span>
                  </div>
                </div>

                {/* Action CTA & Responses Count */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.responsesCount} neighbor{req.responsesCount === 1 ? '' : 's'} offered</span>
                  </div>

                  <button
                    onClick={() => {
                      if (!currentUser) {
                        onRequireLogin?.(`Please log in or create an account to offer to lend for "${req.title}".`);
                      } else {
                        onOpenResponseModal(req);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs active:scale-95"
                  >
                    <HeartHandshake className="w-3.5 h-3.5" />
                    <span>I Can Lend This!</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
