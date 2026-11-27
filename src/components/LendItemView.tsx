import React, { useState } from 'react';
import { ItemCategory, ItemCondition, ShareItem } from '../types';
import { 
  PackagePlus, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  Camera, 
  MapPin, 
  AlertCircle 
} from 'lucide-react';

import { APP_IMAGES } from '../assets/images';
import { NeighborShareService } from '../services/neighborShareService';
import { sanitizeText, sanitizeUrl } from '../utils/securityUtils';

interface LendItemViewProps {
  onItemAdded: (item: Omit<ShareItem, 'id' | 'createdAt' | 'lender' | 'isMyGarageItem'>) => void;
  onCancel: () => void;
  currentNeighborhood?: string;
  currentZipCode?: string;
  onRequestNewNeighborhood?: (zipCode: string) => void;
  onOpenTerms?: () => void;
}

const PRESET_PHOTOS = [
  { label: 'Cordless Drill', url: APP_IMAGES.drill, category: 'Tools' },
  { label: 'Compound Miter Saw', url: APP_IMAGES.miterSaw, category: 'Tools' },
  { label: 'Pressure Washer', url: APP_IMAGES.washer, category: 'Outdoor' },
  { label: 'Leaf Blower', url: APP_IMAGES.leafBlower, category: 'Outdoor' },
  { label: 'Multi-Position Ladder', url: APP_IMAGES.ladder, category: 'Tools' },
  { label: 'Party Table & Chairs', url: APP_IMAGES.chairs, category: 'Party' },
  { label: '10x10 Pop-Up Canopy', url: APP_IMAGES.canopy, category: 'Party' },
  { label: 'Belgian Waffle Maker', url: APP_IMAGES.waffle, category: 'Kitchen' },
  { label: '14-Cup Food Processor', url: APP_IMAGES.foodProcessor, category: 'Kitchen' },
  { label: 'Camping Tent', url: APP_IMAGES.tent, category: 'Camping' },
  { label: 'Camp Stove & Griddle', url: APP_IMAGES.campStove, category: 'Camping' },
  { label: 'Lawn Aerator & Spreader', url: APP_IMAGES.aerator, category: 'Outdoor' },
];

export const LendItemView: React.FC<LendItemViewProps> = ({
  onItemAdded,
  onCancel,
  currentNeighborhood = 'Shady Hollow',
  currentZipCode = '78748',
  onRequestNewNeighborhood,
  onOpenTerms,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Tools');
  const [condition, setCondition] = useState<ItemCondition>('Excellent');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [dailyFee, setDailyFee] = useState<number>(0);
  const [refundableDeposit, setRefundableDeposit] = useState<number>(20);
  const [zipCode, setZipCode] = useState(currentZipCode);
  const [neighborhood, setNeighborhood] = useState(currentNeighborhood);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [imageUrl, setImageUrl] = useState(PRESET_PHOTOS[0].url);
  const [customUrl, setCustomUrl] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectPreset = (url: string) => {
    setImageUrl(url);
    setCustomUrl('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(title, 120);
    const cleanDesc = sanitizeText(description, 1000);
    const cleanRules = sanitizeText(rules, 600);
    const candidateImage = customUrl.trim() ? sanitizeUrl(customUrl) : imageUrl;
    const finalImage = candidateImage || APP_IMAGES.drill;

    if (!cleanTitle || !cleanDesc) return;

    const depositNote =
      refundableDeposit > 0
        ? `$${refundableDeposit} refundable deposit - handled neighbor-to-neighbor at pickup`
        : undefined;

    onItemAdded({
      title: cleanTitle,
      category,
      condition,
      description: cleanDesc,
      rules: cleanRules,
      dailyFee: Math.max(0, Math.min(500, Number(dailyFee) || 0)),
      refundableDeposit: Math.max(0, Math.min(1000, Number(refundableDeposit) || 0)),
      depositNote,
      neighborhood: sanitizeText(neighborhood, 80),
      zipCode: sanitizeText(zipCode, 10),
      imageUrl: finalImage,
      isAvailable: true,
    });

    setIsSuccess(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded w-fit mb-2 border border-emerald-200">
          <PackagePlus className="w-4 h-4 text-emerald-600" />
          <span>Neighborhood Garage Inventory</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Add an Item to Your Garage
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Add tools, party gear, lawn care items, or kitchen appliances sitting in your closet or shed to the community pool.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white rounded-2xl p-8 border border-emerald-200 text-center max-w-lg mx-auto shadow-sm space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Item Added to Your Garage!</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your item is now live on the neighborhood feed. Neighbors in {neighborhood} can request to borrow it, and you will receive notifications in My Hub.
          </p>
          <div className="pt-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
            >
              Back to Explore Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Item Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeWalt 20V Cordless Hammer Drill, 10-ft Pop-up Canopy..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category & Condition */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tools">Tools & Workshop</option>
                    <option value="Outdoor">Outdoor & Garden</option>
                    <option value="Kitchen">Kitchen Appliances</option>
                    <option value="Party">Party & Events</option>
                    <option value="Camping">Camping & Recreation</option>
                    <option value="Other">Other & Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Condition *
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ItemCondition)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Like New">Like New (flawless, barely used)</option>
                    <option value="Excellent">Excellent (light wear, perfectly functional)</option>
                    <option value="Good">Good (minor cosmetic scuffs)</option>
                    <option value="Well-loved">Well-loved (solid workhorse)</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Description & Included Accessories *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is included? (e.g. includes case, 2 batteries, extra bits, attachments)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-normal text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Rules & Care Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Borrowing Rules & Care Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please rinse after use. Store inside garage out of rain."
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Informational Fees & Deposit */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Informational Honor Fees (Handled Neighbor-to-Neighbor)</span>
                </div>
                <div className="text-[11px] text-slate-500 leading-relaxed">
                  No money is processed in NeighborShare. These badges inform neighbors of any voluntary fee or refundable deposit you request in person at pickup.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily Borrow Fee ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={dailyFee}
                        onChange={(e) => setDailyFee(Number(e.target.value))}
                        className="w-full text-xs font-medium text-slate-900 pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Set $0 for completely free lending</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Refundable Deposit ($)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400">$</span>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={refundableDeposit}
                        onChange={(e) => setRefundableDeposit(Number(e.target.value))}
                        className="w-full text-xs font-medium text-slate-900 pl-7 pr-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Returned to neighbor upon safe return</span>
                  </div>
                </div>
              </div>

              {/* Neighborhood and Zip from Verified DB */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Zip Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={zipCode}
                      onChange={(e) => {
                        const newZip = e.target.value;
                        setZipCode(newZip);
                        const data = NeighborShareService.getNeighborhoodsForZip(newZip);
                        if (data && data.neighborhoods.length > 0) {
                          setNeighborhood(data.neighborhoods[0]);
                        }
                      }}
                      className="w-full text-xs font-bold text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Verified Neighborhood in {zipCode} *
                    </label>
                    {(() => {
                      const zipData = NeighborShareService.getNeighborhoodsForZip(zipCode);
                      const availableNeighborhoods = zipData?.neighborhoods || [];

                      if (availableNeighborhoods.length > 0) {
                        return (
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          >
                            {availableNeighborhoods.map((nh) => (
                              <option key={nh} value={nh}>
                                {nh} ({zipCode})
                              </option>
                            ))}
                          </select>
                        );
                      }

                      return (
                        <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                          No verified neighborhoods in zip {zipCode}.
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Subtitle helper / request link */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Only verified neighborhoods in our database can be chosen.</span>
                  {onRequestNewNeighborhood && (
                    <button
                      type="button"
                      onClick={() => onRequestNewNeighborhood(zipCode)}
                      className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      Request new neighborhood
                    </button>
                  )}
                </div>
              </div>

              {/* Photo Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Select Item Photo</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-500">Pick preset or paste URL</span>
                </label>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
                  {PRESET_PHOTOS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(p.url)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        imageUrl === p.url && !customUrl
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  placeholder="Or enter custom image URL..."
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Terms of Service Disclaimer (Nextdoor policy modeled) */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-950 font-medium">
                  <input
                    type="checkbox"
                    required
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                  />
                  <span className="leading-relaxed">
                    I agree to the <strong className="text-amber-900 font-bold">NeighborShare Member Terms of Service</strong>: NeighborShare is not responsible for the borrower's or lender's items, wear and tear, or unreturned items. As a lender, I am loaning my item directly neighbor-to-neighbor at my own discretion.
                  </span>
                </label>
                {onOpenTerms && (
                  <div className="pl-6.5 text-[11px]">
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
                    >
                      Read Full Terms & Liability Waiver
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!agreeToTerms}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 rounded-lg transition-all shadow-xs active:scale-95"
                >
                  Add Item to Garage
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Card Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Neighbor Feed Preview</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative aspect-4/3 bg-slate-100">
                <img
                  src={customUrl.trim() || imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded">
                  {condition}
                </div>
                <div className="absolute top-3 right-3">
                  {dailyFee === 0 ? (
                    <div className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                      Free to borrow
                    </div>
                  ) : (
                    <div className="bg-slate-900/90 text-white text-xs font-bold px-2.5 py-1 rounded tabular-nums">
                      ${dailyFee}/day
                    </div>
                  )}
                </div>
                {refundableDeposit > 0 && (
                  <div className="absolute bottom-2 left-2 right-2 bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded text-center">
                    ${refundableDeposit} refundable deposit · at pickup
                  </div>
                )}
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <span className="text-emerald-700 font-semibold">{category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {neighborhood} ({zipCode})
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {title || 'Your Item Title'}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {description || 'Item description will appear here on the feed...'}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                      AR
                    </div>
                    <span className="text-xs font-semibold text-slate-800">You (Alex R.)</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-semibold">99% Trust</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-950 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>
                Items you post can be paused or removed at any time from <strong>My Hub &gt; My Garage Items</strong>.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
