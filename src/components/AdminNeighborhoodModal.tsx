import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Building2, 
  Filter, 
  Sparkles, 
  Check, 
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { NeighborhoodProposal } from '../types';
import { NeighborShareService } from '../services/neighborShareService';

interface AdminNeighborhoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProposalUpdated: () => void;
  onOpenNewProposalModal?: () => void;
}

export const AdminNeighborhoodModal: React.FC<AdminNeighborhoodModalProps> = ({
  isOpen,
  onClose,
  onProposalUpdated,
  onOpenNewProposalModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Duplicate or out of coverage area');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const proposals = NeighborShareService.getNeighborhoodProposals();
  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  const filtered = proposals.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleApprove = (proposal: NeighborhoodProposal) => {
    const res = NeighborShareService.approveNeighborhoodProposal(proposal.id);
    if (res.success) {
      setActionNotice(`Approved "${proposal.neighborhoodName}"! Added to active directory in zip ${proposal.zipCode}.`);
      onProposalUpdated();
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  const handleConfirmReject = (proposalId: string) => {
    const res = NeighborShareService.rejectNeighborhoodProposal(proposalId, rejectReason);
    if (res.success) {
      setActionNotice('Request declined.');
      setRejectionModalId(null);
      onProposalUpdated();
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Admin Review: Neighborhood Requests</h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-slate-950">
                    {pendingCount} Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300">
                Review, verify, and approve neighborhood proposals to add them to the official database
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Bar */}
        {actionNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Filters and CTA bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              Status:
            </span>
            {(['pending', 'approved', 'rejected', 'all'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors capitalize ${
                  filterStatus === tab
                    ? 'bg-slate-900 text-white'
                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                }`}
              >
                {tab === 'pending' ? `Pending (${pendingCount})` : tab}
              </button>
            ))}
          </div>

          {onOpenNewProposalModal && (
            <button
              onClick={() => {
                onClose();
                onOpenNewProposalModal();
              }}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Simulate New Submission</span>
            </button>
          )}
        </div>

        {/* Proposals List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
              <div className="text-sm font-bold text-slate-700">No {filterStatus} neighborhood proposals</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {filterStatus === 'pending'
                  ? 'All submitted neighborhood requests have been reviewed!'
                  : 'No proposals match this filter.'}
              </p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{item.neighborhoodName}</span>
                      </h3>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                        Zip: {item.zipCode}
                      </span>
                      {item.status === 'pending' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                          Pending Review
                        </span>
                      )}
                      {item.status === 'approved' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Approved & In Database
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          Declined
                        </span>
                      )}
                    </div>

                    {item.areaName && (
                      <p className="text-xs text-slate-600 font-medium">
                        Area: {item.areaName}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 mt-1 leading-relaxed">
                        <span className="font-semibold text-slate-900">Requester Note:</span> {item.notes}
                      </p>
                    )}
                  </div>

                  {/* Review Actions */}
                  {item.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                      <button
                        onClick={() => handleApprove(item)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve & Add</span>
                      </button>
                      <button
                        onClick={() => setRejectionModalId(item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                      >
                        <X className="w-3.5 h-3.5 text-slate-500" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Submitter & Timestamp metadata */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100 gap-2">
                  <div>
                    Submitted by: <strong className="text-slate-700">{item.requesterName}</strong>
                    {item.requesterEmail && <span className="ml-1">({item.requesterEmail})</span>}
                  </div>
                  <div>
                    {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : 'Recent'}
                    {item.reviewedBy && (
                      <span className="ml-2 text-emerald-700 font-semibold">
                        · Reviewed by {item.reviewedBy}
                      </span>
                    )}
                  </div>
                </div>

                {/* Decline modal/drawer if open for this item */}
                {rejectionModalId === item.id && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2 animate-fade-in">
                    <label className="block text-xs font-bold text-amber-900">
                      Reason for declining:
                    </label>
                    <select
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full text-xs font-medium text-slate-800 p-2 bg-white border border-amber-300 rounded-lg"
                    >
                      <option value="Duplicate or already exists in directory">Duplicate or already exists</option>
                      <option value="Outside Austin service coverage">Outside Austin service coverage</option>
                      <option value="Invalid zip code or subdivision name">Invalid zip code or subdivision name</option>
                      <option value="Commercial or non-residential area">Commercial or non-residential area</option>
                    </select>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setRejectionModalId(null)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-amber-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmReject(item.id)}
                        className="px-3.5 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Approved neighborhoods are immediately available in the neighborhood picker.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
