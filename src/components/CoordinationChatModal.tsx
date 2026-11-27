import React, { useState, useEffect, useRef } from 'react';
import { BorrowRequest, ChatMessage, RequestStatus } from '../types';
import { 
  X, 
  Send, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  CheckCircle, 
  AlertTriangle, 
  RotateCcw,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface CoordinationChatModalProps {
  request: BorrowRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (requestId: string, text: string, role: 'lender' | 'borrower') => void;
  onUpdateStatus: (requestId: string, status: RequestStatus) => void;
}

export const CoordinationChatModal: React.FC<CoordinationChatModalProps> = ({
  request,
  isOpen,
  onClose,
  onSendMessage,
  onUpdateStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeRole, setActiveRole] = useState<'lender' | 'borrower'>('borrower');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active role based on user context
  useEffect(() => {
    if (request) {
      if (request.lenderId === 'user-current-me') {
        setActiveRole('lender');
      } else {
        setActiveRole('borrower');
      }
    }
  }, [request]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, request?.messages]);

  if (!isOpen || !request) return null;

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    onSendMessage(request.id, text.trim(), activeRole);
    if (!textToSend) setInputText('');
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">Pending Lender Approval</span>;
      case 'approved':
        return <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">Approved · Ready for Pickup</span>;
      case 'picked_up':
        return <span className="text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">Item Currently with Borrower</span>;
      case 'returned':
        return <span className="text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">Returned & Completed</span>;
      case 'declined':
        return <span className="text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-bold">Declined</span>;
    }
  };

  const isLenderOfThis = request.lenderId === 'user-current-me';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
              <img
                src={request.itemImageUrl}
                alt={request.itemTitle}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  Coordination: {request.itemTitle}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{request.borrowerName}</span>
                <span>↔</span>
                <span>{request.lenderName}</span>
                <span>·</span>
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar for Status Management */}
        <div className="px-5 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <span>Actions:</span>
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(request.id, 'approved')}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs transition-colors"
                >
                  ✓ Approve Request
                </button>
                <button
                  onClick={() => onUpdateStatus(request.id, 'declined')}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-700 border border-slate-200 font-bold rounded-md transition-colors"
                >
                  Decline
                </button>
              </>
            )}

            {request.status === 'approved' && (
              <button
                onClick={() => onUpdateStatus(request.id, 'picked_up')}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md shadow-2xs transition-colors"
              >
                ✓ Mark as Picked Up
              </button>
            )}

            {request.status === 'picked_up' && (
              <button
                onClick={() => onUpdateStatus(request.id, 'returned')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md shadow-2xs transition-colors"
              >
                ✓ Mark as Returned & Finish
              </button>
            )}

            {request.status === 'returned' && (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Item safely returned to neighbor
              </span>
            )}
          </div>

          {/* Perspective switcher to test conversation from both sides */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
            <span>Replying as:</span>
            <button
              onClick={() => setActiveRole(activeRole === 'borrower' ? 'lender' : 'borrower')}
              className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>{activeRole === 'lender' ? 'Lender' : 'Borrower'}</span>
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Pickup & Policy Reminder Strip */}
        <div className="px-5 py-2 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              <strong>Pickup Method:</strong> {request.pickupPreference} · Dates: {request.startDate} to {request.endDate} ({request.totalDays} days)
            </span>
          </div>
          {request.deposit > 0 && (
            <div className="text-[11px] text-amber-800 font-semibold tabular-nums">
              ${request.deposit} deposit at handoff
            </div>
          )}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/50">
          {request.messages.map((msg) => {
            const isMe =
              (activeRole === 'borrower' && msg.senderRole === 'borrower') ||
              (activeRole === 'lender' && msg.senderRole === 'lender');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">{msg.senderName}</span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">
                    {msg.senderRole}
                  </span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-emerald-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-100 space-y-1.5">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Fast Pickup Coordination Starters:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              "What time works best for porch pickup?",
              "Can I swing by Saturday around 10:00 AM?",
              "Item is ready inside the front porch by the blue planter!",
              "Thanks so much neighbor! Returning it clean.",
            ].map((starter, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(starter)}
                className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message as ${activeRole === 'lender' ? 'Lender' : 'Borrower'} (e.g. coordinate address, gate code, exact pickup time)...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 text-xs font-medium text-slate-900 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition-colors shrink-0 shadow-xs active:scale-95"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
