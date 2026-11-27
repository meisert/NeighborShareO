import React, { useState } from 'react';
import { BorrowRequest, ShareItem, RequestStatus } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { 
  Package, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Clock, 
  PlusCircle, 
  Trash2,
  Power
} from 'lucide-react';
import { UserAccount } from '../types';

interface DashboardViewProps {
  requests: BorrowRequest[];
  garageItems: ShareItem[];
  onOpenChat: (request: BorrowRequest) => void;
  onUpdateStatus: (requestId: string, status: RequestStatus) => void;
  onToggleAvailability: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onNavigateToLend: () => void;
  onOpenAdminModal?: () => void;
  pendingProposalsCount?: number;
  currentUser?: UserAccount | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  requests,
  garageItems,
  onOpenChat,
  onUpdateStatus,
  onToggleAvailability,
  onDeleteItem,
  onNavigateToLend,
  onOpenAdminModal,
  pendingProposalsCount = 0,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing' | 'garage'>('incoming');

  const activeUserId = currentUser ? currentUser.id : CURRENT_USER.id;
  const activeUserName = currentUser ? currentUser.name : CURRENT_USER.name;
  const activeUserAvatar = currentUser ? currentUser.avatar : CURRENT_USER.avatar;
  const activeUserNh = currentUser ? currentUser.neighborhood : CURRENT_USER.neighborhood;
  const activeUserZip = currentUser ? currentUser.zipCode : CURRENT_USER.zipCode;
  const activeUserTrust = currentUser ? currentUser.trustScore : CURRENT_USER.trustScore;

  // Incoming lending requests (where lender is active user)
  const incomingRequests = requests.filter(
    (req) => req.lenderId === activeUserId || (!currentUser?.isDemo && req.lenderId === activeUserId) || (currentUser?.isDemo && req.lenderName.includes('You'))
  );

  // Outgoing borrow requests (where borrower is active user)
  const outgoingRequests = requests.filter(
    (req) => req.borrowerId === activeUserId || (!currentUser?.isDemo && req.borrowerId === activeUserId) || (currentUser?.isDemo && req.borrowerName.includes('You'))
  );

  // My garage items
  const myItems = garageItems.filter((item) => {
    if (currentUser && !currentUser.isDemo) {
      return item.lender.id === activeUserId;
    }
    return item.isMyGarageItem || item.lender.id === activeUserId;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending Approval</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>Approved · Ready for Pickup</span>
          </span>
        );
      case 'picked_up':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="w-3 h-3 text-blue-600" />
            <span>Picked Up · In Use</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <CheckCircle className="w-3 h-3 text-slate-600" />
            <span>Returned & Completed</span>
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Declined</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Profile & Neighborhood Trust Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white font-bold text-xl flex items-center justify-center shadow-xs">
            {activeUserAvatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">{activeUserName}</h1>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Verified Resident
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {activeUserNh} ({activeUserZip})
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                {activeUserTrust}% Neighbor Trust Rating
              </span>
            </div>
          </div>
        </div>

        {/* Quick summary badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Incoming Requests</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {incomingRequests.filter((r) => r.status === 'pending').length} pending
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500">Active Borrows</div>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {outgoingRequests.filter((r) => r.status === 'approved' || r.status === 'picked_up').length}
            </div>
          </div>

          <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div className="text-xs text-slate-500">My Garage Items</div>
            <div className="text-lg font-bold text-emerald-700 tabular-nums">
              {myItems.length}
            </div>
          </div>

          {currentUser?.isAdmin && onOpenAdminModal && (
            <button
              onClick={onOpenAdminModal}
              className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300 rounded-xl text-center transition-all shadow-2xs group flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Review</span>
                {pendingProposalsCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                    {pendingProposalsCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] text-amber-700/80 mt-0.5">
                Neighborhood Requests
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2 sm:gap-6">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'incoming'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          <span>Incoming Requests (Lending)</span>
          {incomingRequests.filter((r) => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
              {incomingRequests.filter((r) => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('outgoing')}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'outgoing'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowUpRight className="w-4 h-4 text-blue-600" />
          <span>My Borrow Requests</span>
          <span className="text-xs text-slate-400">({outgoingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('garage')}
          className={`flex items-center gap-2 pb-3 pt-1 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'garage'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4 text-slate-600" />
          <span>My Garage Items</span>
          <span className="text-xs text-slate-400">({myItems.length})</span>
        </button>
      </div>

      {/* TAB CONTENT 1: Incoming Requests */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No incoming lending requests yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When neighbors want to borrow items from your garage, their requests and pickup times will appear here.
              </p>
              <button
                onClick={onNavigateToLend}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add an Item to Your Garage</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={req.itemImageUrl}
                          alt={req.itemTitle}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{req.itemTitle}</h3>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>Requested by <strong className="text-slate-800">{req.borrowerName}</strong></span>
                          <span>·</span>
                          <span className="text-emerald-700 font-medium">{req.borrowerTrustScore}% Trust</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Request details row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Requested Window:</span>
                      <strong className="text-slate-800 font-medium">
                        {req.startDate} to {req.endDate} ({req.totalDays} days)
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pickup Preference:</span>
                      <strong className="text-slate-800 font-medium">{req.pickupPreference}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Handled in person:</span>
                      <strong className="text-slate-800 font-medium">
                        {req.deposit > 0 ? `$${req.deposit} deposit` : 'No deposit'} · {req.dailyFee > 0 ? `$${req.dailyFee}/day` : 'Free borrow'}
                      </strong>
                    </div>
                  </div>

                  {/* Borrower message */}
                  <div className="text-xs text-slate-700 bg-emerald-50/40 p-3 rounded-lg border border-emerald-100">
                    <strong className="text-emerald-900 block mb-0.5">Note from neighbor:</strong>
                    "{req.message}"
                  </div>

                  {/* Action buttons */}
                  <div className="pt-1 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                    <button
                      onClick={() => onOpenChat(req)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Coordination Chat ({req.messages.length} messages)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onUpdateStatus(req.id, 'declined')}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => onUpdateStatus(req.id, 'approved')}
                            className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                          >
                            Approve Request
                          </button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <button
                          onClick={() => onUpdateStatus(req.id, 'picked_up')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-2xs"
                        >
                          Mark Picked Up
                        </button>
                      )}

                      {req.status === 'picked_up' && (
                        <button
                          onClick={() => onUpdateStatus(req.id, 'returned')}
                          className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                        >
                          Mark Returned (Completed)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: Outgoing Requests (My Borrow Requests) */}
      {activeTab === 'outgoing' && (
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">You haven't requested any items yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explore items in the neighborhood feed and click "Borrow" to request tools, party equipment, or camping gear.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {outgoingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                        <img
                          src={req.itemImageUrl}
                          alt={req.itemTitle}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{req.itemTitle}</h3>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Lender: <strong className="text-slate-800">{req.lenderName}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Borrow Dates:</span>
                      <strong className="text-slate-800 font-medium">
                        {req.startDate} to {req.endDate}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Pickup Location:</span>
                      <strong className="text-slate-800 font-medium">
                        {req.handoffAddress || 'Shared upon approval'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Informational Terms:</span>
                      <strong className="text-slate-800 font-medium">
                        {req.deposit > 0 ? `$${req.deposit} deposit` : 'No deposit'} (handled at handoff)
                      </strong>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">
                      Coordinate exact pickup time directly with {req.lenderName}:
                    </span>

                    <button
                      onClick={() => onOpenChat(req)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Coordinate Pickup Chat</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: My Garage Items */}
      {activeTab === 'garage' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Manage items you make available to neighbors in {CURRENT_USER.neighborhood}.
            </p>
            <button
              onClick={onNavigateToLend}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Another Item</span>
            </button>
          </div>

          {myItems.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <Package className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Your Garage is empty</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add power tools, folding chairs, pressure washers, or camping gear to share with neighbors.
              </p>
              <button
                onClick={onNavigateToLend}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Item Now</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                          {item.category}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          item.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.isAvailable ? 'Available' : 'Paused'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {item.dailyFee === 0 ? 'Free borrow' : `$${item.dailyFee}/day`} · ${item.refundableDeposit} deposit
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleAvailability(item.id)}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md transition-colors"
                      >
                        <Power className="w-3 h-3 text-slate-500" />
                        <span>{item.isAvailable ? 'Pause' : 'Activate'}</span>
                      </button>

                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
