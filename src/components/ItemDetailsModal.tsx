import React, { useState } from 'react';
import { ShareItem, UserAccount } from '../types';
import { 
  X, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Calendar, 
  AlertCircle, 
  HeartHandshake, 
  MessageSquare,
  Sparkles,
  Check,
  LogIn,
  Lock
} from 'lucide-react';

interface ItemDetailsModalProps {
  item: ShareItem;
  isOpen: boolean;
  onClose: () => void;
  onSubmitBorrowRequest: (params: {
    item: ShareItem;
    startDate: string;
    endDate: string;
    message: string;
    pickupPreference: 'Porch pickup' | 'Front gate handoff' | 'Flexible meet-up';
  }) => void;
  onOpenTerms?: () => void;
  distanceMiles?: number;
  currentUser?: UserAccount | null;
  onOpenLogin?: (reason?: string) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onSubmitBorrowRequest,
  onOpenTerms,
  distanceMiles,
  currentUser,
  onOpenLogin,
}) => {
  // Set default dates: tomorrow and 3 days later
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultStart = tomorrow.toISOString().split('T')[0];

  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  const defaultEnd = threeDaysLater.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [pickupPreference, setPickupPreference] = useState<'Porch pickup' | 'Front gate handoff' | 'Flexible meet-up'>('Porch pickup');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [message, setMessage] = useState(
    `Hi ${item.lender.name.split(' ')[0]}! I'd love to borrow your ${item.title.split('(')[0].trim()} for a weekend home project. Happy to follow all care guidelines!`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate borrow days
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);
  const estimatedVoluntaryFee = item.dailyFee * totalDays;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      onSubmitBorrowRequest({
        item,
        startDate,
        endDate,
        message,
        pickupPreference,
      });
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        onClose();
      }, 1400);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              {item.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">·</span>
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {item.neighborhood} ({item.zipCode})
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Item Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Image */}
            <div className="md:col-span-5 rounded-xl overflow-hidden border border-slate-200 aspect-4/3 bg-slate-100 relative">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[11px] font-semibold px-2 py-0.5 rounded backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Condition: {item.condition}</span>
              </div>
            </div>

            {/* Title & Key Specs */}
            <div className="md:col-span-7 space-y-3">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {item.title}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {item.description}
              </p>

              {/* Informational Fee and Deposit Badges */}
              <div className="pt-2 flex flex-wrap gap-2">
                {item.dailyFee === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/70 text-emerald-800 text-xs font-bold rounded-lg">
                    Free to borrow
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg tabular-nums">
                    ${item.dailyFee}/day borrow fee
                  </span>
                )}

                {item.refundableDeposit > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 text-xs font-semibold rounded-lg border border-amber-200 tabular-nums">
                    ${item.refundableDeposit} refundable deposit
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Usage Rules */}
          {item.rules && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span>Neighbor Care & Usage Rules</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-5">
                {item.rules}
              </p>
            </div>
          )}

          {/* Informational Neighbor Policy Callout */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-emerald-900">How neighbor exchange works:</strong> NeighborShare is 100% free with no in-app payment processing. Any voluntary daily borrow fee or refundable deposit is handed directly to {item.lender.name.split(' ')[0]} in cash/Venmo at porch pickup, and deposits are returned when you bring the item back in good condition.
            </div>
          </div>

          {/* Lender Profile Card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold text-base flex items-center justify-center shrink-0">
                {item.lender.avatar}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{item.lender.name}</span>
                  {item.lender.isVerifiedNeighbor && (
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      Verified Neighbor
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {item.lender.neighborhood} · Responds {item.lender.responseTime}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-600 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="flex items-center gap-1 text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold tabular-nums">{item.lender.trustScore}%</span> Trust Score
              </div>
              <span className="text-slate-300">·</span>
              <div>
                <span className="font-bold text-slate-800 tabular-nums">{item.lender.totalLends}</span> items shared
              </div>
            </div>
          </div>

          {/* Interactive Request Form */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Request to Borrow</span>
            </h3>

            {submittedSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white mb-1">
                  <Check className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-emerald-900">Request Sent to {item.lender.name}!</div>
                <div className="text-xs text-emerald-700">Added to your Dashboard. Check "My Hub" to coordinate pickup.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Date (Return Date)
                    </label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Pickup Preference
                    </label>
                    <select
                      value={pickupPreference}
                      onChange={(e) => setPickupPreference(e.target.value as any)}
                      className="w-full text-xs font-medium text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Porch pickup">Porch pickup (Contactless)</option>
                      <option value="Front gate handoff">Front gate handoff</option>
                      <option value="Flexible meet-up">Flexible meet-up</option>
                    </select>
                  </div>

                  {/* Summary note */}
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-600 flex flex-col justify-center">
                    <div className="flex justify-between font-medium">
                      <span>Duration:</span>
                      <strong className="text-slate-900 tabular-nums">{totalDays} day{totalDays > 1 ? 's' : ''}</strong>
                    </div>
                    <div className="flex justify-between font-medium mt-1">
                      <span>Informational fee:</span>
                      <strong className="text-slate-900 tabular-nums">
                        {estimatedVoluntaryFee === 0 ? 'Free' : `$${estimatedVoluntaryFee} voluntary`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Message to {item.lender.name}
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly explain what project you are doing and what pickup times work for you..."
                    className="w-full text-xs font-normal text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Terms of Service & Liability Disclaimer (Modeled after Nextdoor Policy) */}
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
                      I agree to the <strong className="text-amber-900 font-bold">NeighborShare Member Terms of Service</strong>: NeighborShare is solely a communication platform and is <strong>not responsible for the borrower's or lender's items</strong>, item condition, damage, theft, or accidents during use. All safety deposits and handoffs are handled directly neighbor-to-neighbor.
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

                {!currentUser && (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Neighborhood membership required to borrow items.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenLogin?.(`Log in or create an account to borrow ${item.title}`)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline shrink-0"
                    >
                      Log in now
                    </button>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>

                  {!currentUser ? (
                    <button
                      type="button"
                      onClick={() => onOpenLogin?.(`Please log in or create an account to borrow ${item.title}`)}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs active:scale-95"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In to Request Borrow</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting || !agreeToTerms}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs disabled:opacity-45"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? 'Sending Request...' : 'Send Borrow Request'}</span>
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
