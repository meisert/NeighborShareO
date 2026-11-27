import React, { useState, useRef, useEffect } from 'react';
import { 
  Package, 
  PlusCircle, 
  Compass, 
  ClipboardList, 
  MapPin, 
  ChevronDown, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  LogOut, 
  User, 
  RotateCcw,
  Sparkles,
  Share2
} from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  activeView: 'explore' | 'iso' | 'lend' | 'hub';
  setActiveView: (view: 'explore' | 'iso' | 'lend' | 'hub') => void;
  pendingRequestsCount: number;
  currentNeighborhood: string;
  currentZipCode: string;
  onOpenLocationModal: () => void;
  onOpenAdminModal?: () => void;
  pendingProposalsCount?: number;
  currentUser: UserAccount | null;
  onOpenLogin: (reason?: string) => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  onOpenShareModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  pendingRequestsCount,
  currentNeighborhood,
  currentZipCode,
  onOpenLocationModal,
  onOpenAdminModal,
  pendingProposalsCount = 0,
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  onOpenShareModal,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking or tapping outside
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isUserMenuOpen]);

  const handleNavToLend = () => {
    if (!currentUser) {
      onOpenLogin('Please log in or create an account to list items from your garage.');
    } else {
      setActiveView('lend');
    }
  };

  const handleNavToHub = () => {
    if (!currentUser) {
      onOpenLogin('Please log in or create an account to view your Borrow Hub and messages.');
    } else {
      setActiveView('hub');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('explore')}
              className="flex items-center gap-2.5 text-left group"
            >
              <img
                src="/favicon.svg"
                alt="NeighborShare icon"
                className="w-9 h-9 rounded-xl shadow-xs transition-transform group-hover:scale-105"
              />
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
                  NeighborShare
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full">
                  US Nationwide
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => setActiveView('explore')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeView === 'explore'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Explore Items
            </button>

            <button
              onClick={() => setActiveView('iso')}
              className={`whitespace-nowrap transition-colors py-1 ${
                activeView === 'iso'
                  ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Neighbor Requests
            </button>

            {currentUser && (
              <>
                <button
                  onClick={handleNavToLend}
                  className={`whitespace-nowrap transition-colors py-1 flex items-center gap-1.5 ${
                    activeView === 'lend'
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Add to Garage</span>
                </button>

                <button
                  onClick={handleNavToHub}
                  className={`whitespace-nowrap transition-colors py-1 relative ${
                    activeView === 'hub'
                      ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>My Hub</span>
                  {pendingRequestsCount > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-semibold text-white bg-amber-500 rounded-full">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>
              </>
            )}
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Admin button if user is Admin */}
            {currentUser?.isAdmin && onOpenAdminModal && (
              <button
                type="button"
                onClick={onOpenAdminModal}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-amber-50/90 hover:bg-amber-100 py-1.5 px-2.5 rounded-xl transition-colors border border-amber-200/90 shadow-2xs"
                title="Review neighborhood additions"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden lg:inline">Admin</span>
                {pendingProposalsCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold text-white bg-amber-600 rounded-full">
                    {pendingProposalsCount}
                  </span>
                )}
              </button>
            )}

            {/* Neighborhood location button */}
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 py-1.5 px-2.5 rounded-xl transition-colors border border-slate-200/60"
              title="Change neighborhood profile location"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate max-w-[120px]">{currentNeighborhood}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* Share / Invite Neighbors button */}
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 py-1.5 px-2.5 rounded-xl transition-colors border border-emerald-200/80 shadow-2xs"
                title="Spread the word in your neighborhood"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Share</span>
              </button>
            )}

            {/* AUTH ACTIONS */}
            {currentUser ? (
              /* User Logged In */
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 rounded-xl transition-all"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.avatar}
                  </div>
                  <div className="hidden md:block text-left text-xs leading-tight">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{currentUser.name}</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    </div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[100px]">
                      {currentUser.neighborhood}
                    </div>
                  </div>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu (Closes when clicking outside or pressing Escape) */}
                {isUserMenuOpen && (
                  <>
                    {/* Fixed invisible backdrop covering the full window: clicking anywhere rolls up the menu */}
                    <div
                      className="fixed inset-0 z-40 bg-transparent cursor-default"
                      onClick={() => setIsUserMenuOpen(false)}
                      aria-hidden="true"
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs animate-fade-in">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-bold text-slate-900">{currentUser.name}</p>
                        <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{currentUser.neighborhood} ({currentUser.zipCode})</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            setActiveView('hub');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Sharing Hub & Requests</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenLocationModal();
                          }}
                          className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>Change Neighborhood Profile</span>
                        </button>

                        {onOpenShareModal && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onOpenShareModal();
                            }}
                            className="w-full text-left px-4 py-2 text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                          >
                            <Share2 className="w-4 h-4 text-emerald-600" />
                            <span>Invite Neighbors & Spread Word</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onOpenLogin('Switch demo account');
                          }}
                          className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <RotateCcw className="w-4 h-4 text-slate-400" />
                          <span>Switch Account (Demo)</span>
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onLogout();
                          }}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              /* User Logged Out (Guest Mode) */
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLogin()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                >
                  <LogIn className="w-3.5 h-3.5 text-slate-500" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs active:scale-95"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create Account</span>
                  <span className="sm:hidden">Join</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => setActiveView('explore')}
            className={`flex flex-col items-center gap-1 py-1 px-3 ${
              activeView === 'explore' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Explore</span>
          </button>
          <button
            onClick={() => setActiveView('iso')}
            className={`flex flex-col items-center gap-1 py-1 px-3 ${
              activeView === 'iso' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Requests</span>
          </button>
          {currentUser && (
            <>
              <button
                onClick={handleNavToLend}
                className={`flex flex-col items-center gap-1 py-1 px-3 ${
                  activeView === 'lend' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Item</span>
              </button>
              <button
                onClick={handleNavToHub}
                className={`flex flex-col items-center gap-1 py-1 px-3 relative ${
                  activeView === 'hub' ? 'text-emerald-700 font-semibold' : 'text-slate-600'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>My Hub</span>
                {pendingRequestsCount > 0 && (
                  <span className="absolute top-0 right-2 w-2 h-2 rounded-full bg-amber-500" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
