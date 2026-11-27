import React, { useState } from 'react';
import { IsoRequest } from '../types';
import { X, HeartHandshake, Check, Send, Sparkles } from 'lucide-react';

interface IsoResponseModalProps {
  iso: IsoRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSendResponse: (isoId: string, message: string) => void;
}

export const IsoResponseModal: React.FC<IsoResponseModalProps> = ({
  iso,
  isOpen,
  onClose,
  onSendResponse,
}) => {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !iso) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSendResponse(iso.id, message.trim());
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setMessage('');
      onClose();
    }, 1300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Offer to Lend: Help {iso.posterName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Target request summary */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
              Requested Item ({iso.category})
            </div>
            <div className="font-bold text-slate-900 text-sm">{iso.title}</div>
            <div className="text-slate-600 line-clamp-2">{iso.description}</div>
            <div className="text-[11px] text-slate-500 pt-1">
              Needed by: <strong>{new Date(iso.neededByDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong> · {iso.neighborhood}
            </div>
          </div>

          {isSuccess ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Offer Sent to {iso.posterName}!</h3>
              <p className="text-xs text-slate-600">
                They will receive your note and can connect with you on porch handoff times.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Your message to {iso.posterName.split(' ')[0]} *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder={`Hi ${iso.posterName.split(' ')[0]}! I have this exact item in my garage. Happy to let you borrow it for your project...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs font-normal text-slate-900 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1">
                <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Quick starters:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMessage(`Hi ${iso.posterName.split(' ')[0]}, I have this in my garage ready to go! You're welcome to pick it up anytime.`)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors text-left"
                  >
                    "I have this ready to go in my garage!"
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessage(`Hey! Have one available this weekend. Free to borrow, porch pickup in ${iso.neighborhood}.`)}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors text-left"
                  >
                    "Free to borrow this weekend, porch pickup!"
                  </button>
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
                  className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Neighbor Offer</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
