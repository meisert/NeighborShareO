import React, { useState } from 'react';
import { ArrowRight, ShieldCheck, HeartHandshake, Sparkles, Share2 } from 'lucide-react';
import { APP_IMAGES } from '../assets/images';

interface HeroBannerProps {
  onExploreClick: () => void;
  onPostIsoClick: () => void;
  userNeighborhood?: string;
  userZipCode?: string;
  onShareClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onPostIsoClick,
  userNeighborhood = 'Shady Hollow',
  userZipCode = '78748',
  onShareClick,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(APP_IMAGES.hero);
  const [imgFailed, setImgFailed] = useState<boolean>(false);

  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline and Call-to-actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200/60">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Local peer-to-peer neighborhood sharing</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
              Why buy when you can borrow from a neighbor?
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
              Borrow drills, pressure washers, folding chairs, and camping gear right on your block. Save hundreds of dollars, reduce garage clutter, and build genuine community trust.
            </p>

            {/* Informational neighbor-to-neighbor policy callout */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl max-w-xl text-xs text-slate-600 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-semibold">Zero-Commission Community:</strong> No payments are processed through the app. Voluntary daily wear fees and refundable safety deposits are settled neighbor-to-neighbor upon pickup.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onExploreClick}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs active:scale-95"
              >
                <span>Browse Available Items</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onPostIsoClick}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-2xs active:scale-95"
              >
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Ask Neighbors for an Item</span>
              </button>

              {onShareClick && (
                <button
                  onClick={onShareClick}
                  className="flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/90 rounded-xl transition-all shadow-2xs active:scale-95"
                >
                  <Share2 className="w-4 h-4 text-emerald-600" />
                  <span>Invite Neighbors</span>
                </button>
              )}
            </div>

            {/* Trust and community proof markers */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tabular-nums">140+</span>
                <span>items in neighborhood</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-sm tabular-nums">99%</span>
                <span>return rating</span>
              </div>
              <span className="text-slate-300" aria-hidden="true">·</span>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-emerald-700 text-sm tabular-nums">$0</span>
                <span>platform fees</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-fidelity Community Photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md aspect-16/10 min-h-[260px] bg-slate-900 group">
              {!imgFailed ? (
                <img
                  src={imageSrc}
                  alt="Friendly neighbors greeting each other and sharing gardening equipment over a front lawn fence"
                  onError={() => {
                    // Try static public path first, otherwise show stylized fallback
                    if (imageSrc !== '/images/hero_neighborhood_sharing_1792094178028.jpg') {
                      setImageSrc('/images/hero_neighborhood_sharing_1792094178028.jpg');
                    } else {
                      setImgFailed(true);
                    }
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              ) : (
                /* High-fidelity Stylized Community Mesh Fallback */
                <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-emerald-800 via-slate-900 to-slate-950 p-6 flex flex-col justify-between text-white">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
                      Community Shared
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-lg font-bold text-white">
                      {userNeighborhood} Tool & Gear Library
                    </div>
                    <div className="text-xs text-slate-300">
                      Borrow local · Meet neighbors · Save together
                    </div>
                  </div>
                </div>
              )}

              {/* Gradient Scrim & Info Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-5 pointer-events-none">
                <div className="text-white space-y-0.5">
                  <div className="text-xs font-semibold text-emerald-300 tracking-wide uppercase">
                    {userNeighborhood} Community Garage
                  </div>
                  <div className="text-sm font-medium text-slate-100">
                    Austin, TX ({userZipCode}) · Active sharing within your community
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
