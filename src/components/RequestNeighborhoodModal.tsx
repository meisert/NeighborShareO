import React, { useState } from 'react';
import { X, Building2, MapPin, CheckCircle, ShieldCheck, Sparkles, Send } from 'lucide-react';
import { NeighborShareService } from '../services/neighborShareService';
import { NeighborhoodProposal } from '../types';

interface RequestNeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultZip?: string;
  onRequestSubmitted: (proposal: NeighborhoodProposal) => void;
}

export const RequestNeighborhoodModal: React.FC<RequestNeighborhoodModalProps> = ({
  isOpen,
  onClose,
  defaultZip = '78748',
  onRequestSubmitted,
}) => {
  const [zipCode, setZipCode] = useState(defaultZip);
  const [neighborhoodName, setNeighborhoodName] = useState('');
  const [areaName, setAreaName] = useState('');
  const [requesterName, setRequesterName] = useState('Alex Rivera');
  const [requesterEmail, setRequesterEmail] = useState('meisert2@gmail.com');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedProposal, setSubmittedProposal] = useState<NeighborhoodProposal | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipCode.trim() || !neighborhoodName.trim()) return;

    const proposal = NeighborShareService.submitNeighborhoodProposal({
      zipCode: zipCode.trim(),
      neighborhoodName: neighborhoodName.trim(),
      areaName: areaName.trim() || `Austin Area (${zipCode.trim()})`,
      requesterName: requesterName.trim() || 'Community Member',
      requesterEmail: requesterEmail.trim(),
      notes: notes.trim(),
    });

    setSubmittedProposal(proposal);
    setIsSubmitted(true);
    onRequestSubmitted(proposal);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setNeighborhoodName('');
    setAreaName('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Request New Neighborhood</h2>
              <p className="text-[11px] text-slate-500">
                Submit a neighborhood & zip for admin review and approval
              </p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isSubmitted && submittedProposal ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Request Submitted for Review!</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your request for <strong className="text-slate-900">{submittedProposal.neighborhoodName}</strong> ({submittedProposal.zipCode}) has been queued in the community admin dashboard.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5 max-w-sm mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                    Pending Admin Review
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Zip Code:</span>
                  <span className="font-semibold text-slate-800">{submittedProposal.zipCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Submitted by:</span>
                  <span className="font-semibold text-slate-800">{submittedProposal.requesterName}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trust & Database Notice */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  To ensure trusted borrowing and accurate handoff locations, all neighborhoods must be verified in our community directory. Once approved by an admin, this neighborhood will immediately become selectable for all neighbors.
                </div>
              </div>

              {/* Zip Code */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Zip Code *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="e.g. 78748"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 tabular-nums tracking-wide"
                  />
                </div>
              </div>

              {/* Neighborhood / Subdivision Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Proposed Neighborhood / Subdivision Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sendera South, Maple Run East, Grand Oaks..."
                  value={neighborhoodName}
                  onChange={(e) => setNeighborhoodName(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Area / Major Cross Streets */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  General Area or Cross Streets (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. South Austin near Slaughter Ln & West Gate Blvd"
                  value={areaName}
                  onChange={(e) => setAreaName(e.target.value)}
                  className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Requester Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Your Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Notes for Admin Review
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. HOA subdivision of ~200 homes; looking to share lawn aeration and power tools among neighbors."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-normal text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!zipCode.trim() || !neighborhoodName.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
