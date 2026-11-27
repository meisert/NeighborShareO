import React, { useState } from 'react';
import { ItemCategory, IsoRequest } from '../types';
import { X, HeartHandshake, Calendar, Check } from 'lucide-react';

import { NeighborShareService } from '../services/neighborShareService';
import { sanitizeText } from '../utils/securityUtils';

interface PostIsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (params: {
    title: string;
    category: ItemCategory;
    description: string;
    neededByDate: string;
    neighborhood: string;
    zipCode: string;
  }) => void;
  userNeighborhood?: string;
  userZipCode?: string;
  onRequestNewNeighborhood?: (zipCode: string) => void;
}

export const PostIsoModal: React.FC<PostIsoModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userNeighborhood = 'Shady Hollow',
  userZipCode = '78748',
  onRequestNewNeighborhood,
}) => {
  const nextWeekend = new Date();
  nextWeekend.setDate(nextWeekend.getDate() + 3);
  const defaultDate = nextWeekend.toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Tools');
  const [description, setDescription] = useState('');
  const [neededByDate, setNeededByDate] = useState(defaultDate);
  const [zipCode, setZipCode] = useState(userZipCode);
  const [neighborhood, setNeighborhood] = useState(userNeighborhood);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(title, 120);
    const cleanDesc = sanitizeText(description, 1000);
    if (!cleanTitle || !cleanDesc) return;

    onSubmit({
      title: cleanTitle,
      category,
      description: cleanDesc,
      neededByDate,
      neighborhood: sanitizeText(neighborhood, 80),
      zipCode: sanitizeText(zipCode, 10),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Ask Neighbors for an Item
              </h2>
              <p className="text-[11px] text-slate-500">
                Looking to borrow something? Ask neighbors nearby.
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

        <div className="p-6">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Request Posted to Neighborhood!</h3>
              <p className="text-xs text-slate-600">Neighbors nearby will see your request and reach out if they have it.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  What item are you looking for? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10x10 Pop-up canopy, Drywall sander, Lawn aerator..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Tools">Tools</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Party">Party</option>
                    <option value="Camping">Camping</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Needed By Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={neededByDate}
                    onChange={(e) => setNeededByDate(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Project details / How long you need it *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what you need it for and how long you will need it (e.g. Needed for 3 hours on Saturday morning for trimming hedge)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs font-normal text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

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
                      className="w-full text-xs font-bold text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums"
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
                            className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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
                        <div className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          No verified neighborhoods in {zipCode}.
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Only verified neighborhoods can be selected.</span>
                  {onRequestNewNeighborhood && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestNewNeighborhood(zipCode);
                      }}
                      className="font-semibold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      Request new neighborhood
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs"
                >
                  Post Item Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
