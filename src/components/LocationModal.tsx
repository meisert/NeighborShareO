import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  Check, 
  Search, 
  ArrowRight, 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  PlusCircle, 
  AlertCircle 
} from 'lucide-react';
import { NeighborShareService } from '../services/neighborShareService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNeighborhood: string;
  currentZipCode: string;
  onSelectLocation: (neighborhood: string, zipCode: string) => void;
  onRequestNewNeighborhood: (zipCode: string) => void;
  onOpenAdminReview?: () => void;
  pendingProposalsCount?: number;
}

const FEATURED_US_ZIPS = [
  { zip: '78748', label: 'Austin, TX (78748)' },
  { zip: '80205', label: 'Denver, CO (80205)' },
  { zip: '98103', label: 'Seattle, WA (98103)' },
  { zip: '60614', label: 'Chicago, IL (60614)' },
  { zip: '92104', label: 'San Diego, CA (92104)' },
  { zip: '11215', label: 'Brooklyn, NY (11215)' },
  { zip: '30307', label: 'Atlanta, GA (30307)' },
  { zip: '75204', label: 'Dallas, TX (75204)' },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentNeighborhood,
  currentZipCode,
  onSelectLocation,
  onRequestNewNeighborhood,
  onOpenAdminReview,
  pendingProposalsCount = 0,
}) => {
  const [zipInput, setZipInput] = useState(currentZipCode || '78748');
  const [isLocating, setIsLocating] = useState(false);
  const [locationNote, setLocationNote] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customNhName, setCustomNhName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setZipInput(currentZipCode || '78748');
      setLocationNote(null);
      setSearchTerm('');
      setCustomNhName('');
    }
  }, [isOpen, currentZipCode]);

  if (!isOpen) return null;

  // Retrieve neighborhoods from the database for this zip code
  const zipData = NeighborShareService.getNeighborhoodsForZip(zipInput);
  const neighborhoods = zipData?.neighborhoods || [];

  const filteredNeighborhoods = neighborhoods.filter((nh) =>
    nh.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectNeighborhood = (nhName: string) => {
    onSelectLocation(nhName, zipInput.trim() || '78748');
    onClose();
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    setLocationNote(null);

    if (!navigator.geolocation) {
      setLocationNote('Geolocation is not supported by this browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        setIsLocating(false);
        setZipInput('78748');
        onSelectLocation('Shady Hollow', '78748');
        onClose();
      },
      () => {
        setIsLocating(false);
        setZipInput('78748');
        setLocationNote('Detected Austin area. Pick your verified neighborhood in 78748 below:');
      },
      { timeout: 6000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Your Neighborhood</h2>
              <p className="text-[11px] text-slate-500">
                Choose from verified neighborhoods in the Austin database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Geolocation Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Navigation className={`w-3.5 h-3.5 text-emerald-600 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting coordinates...' : 'Auto-Detect Nearby (Austin 78748)'}</span>
          </button>

          {locationNote && (
            <div className="text-[11px] text-emerald-900 bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-200">
              {locationNote}
            </div>
          )}

          {/* STEP 1: Enter Zip Code */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              1. Enter Zip Code:
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={5}
                placeholder="e.g. 78748"
                value={zipInput}
                onChange={(e) => {
                  setZipInput(e.target.value);
                  setSearchTerm('');
                }}
                className="w-full text-sm font-bold text-slate-900 pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums tracking-wide"
              />
              <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                ZIP
              </span>
            </div>

            {/* Quick US Zip Chips */}
            <div className="pt-1 flex flex-wrap gap-1.5">
              {FEATURED_US_ZIPS.map((item) => (
                <button
                  key={item.zip}
                  type="button"
                  onClick={() => {
                    setZipInput(item.zip);
                    setSearchTerm('');
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border ${
                    zipInput === item.zip
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Neighborhoods in Database */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Select Neighborhood in ZIP {zipInput}:</span>
              </label>
              {zipData && (
                <span className="text-[11px] font-semibold text-emerald-700">
                  {zipData.areaName}
                </span>
              )}
            </div>

            {/* Search filter if many neighborhoods */}
            {neighborhoods.length > 6 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder={`Search ${neighborhoods.length} neighborhoods in ${zipInput}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs text-slate-800 pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {/* Neighborhood buttons list */}
            {filteredNeighborhoods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                {filteredNeighborhoods.map((nhName) => {
                  const isCurrent = currentNeighborhood === nhName && currentZipCode === zipInput;
                  return (
                    <button
                      key={nhName}
                      type="button"
                      onClick={() => handleSelectNeighborhood(nhName)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-white hover:border-emerald-300 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-white' : 'text-emerald-600'}`} />
                        <span className="truncate">{nhName}</span>
                      </div>
                      {isCurrent ? (
                        <Check className="w-4 h-4 text-white shrink-0 ml-1" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 opacity-0 group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-3">
                <div className="flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">
                      Joining from a community in {zipInput}?
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Type your neighborhood, subdivision, or town name to connect with neighbors:
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Downtown, West End, Highland Park..."
                    value={customNhName}
                    onChange={(e) => setCustomNhName(e.target.value)}
                    className="flex-1 text-xs font-medium text-slate-900 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={!customNhName.trim()}
                    onClick={() => {
                      const cleanNh = customNhName.trim();
                      if (!cleanNh) return;
                      NeighborShareService.addNeighborhoodToZip(zipInput, cleanNh);
                      onSelectLocation(cleanNh, zipInput);
                      onClose();
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs disabled:opacity-50 shrink-0"
                  >
                    Set Location
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add or Request Neighborhood in this ZIP */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 text-[11px]">
                Don't see your specific subdivision in {zipInput}?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestNewNeighborhood(zipInput.trim() || '78748');
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit Official Addition</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Admin Review shortcut */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          {onOpenAdminReview ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdminReview();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin Review Console</span>
              {pendingProposalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                  {pendingProposalsCount}
                </span>
              )}
            </button>
          ) : (
            <span className="text-[11px]">Directory updated regularly</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
