import React, { useState, useEffect, useMemo } from 'react';
import { 
  ItemCategory, 
  ShareItem, 
  BorrowRequest, 
  IsoRequest, 
  RequestStatus,
  NeighborhoodProposal,
  UserAccount
} from './types';
import { NeighborShareService } from './services/neighborShareService';
import { AuthService, DEFAULT_ACCOUNTS } from './services/authService';
import { calculateDistanceMiles } from './utils/distanceUtils';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ItemCard } from './components/ItemCard';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { LendItemView } from './components/LendItemView';
import { IsoBoard } from './components/IsoBoard';
import { PostIsoModal } from './components/PostIsoModal';
import { IsoResponseModal } from './components/IsoResponseModal';
import { DashboardView } from './components/DashboardView';
import { CoordinationChatModal } from './components/CoordinationChatModal';
import { LocationModal } from './components/LocationModal';
import { RequestNeighborhoodModal } from './components/RequestNeighborhoodModal';
import { AdminNeighborhoodModal } from './components/AdminNeighborhoodModal';
import { TermsOfServiceModal } from './components/TermsOfServiceModal';
import { AuthModal } from './components/AuthModal';
import { AuthGate } from './components/AuthGate';
import { ShareCommunityModal } from './components/ShareCommunityModal';
import { CustomDropdown, DropdownOption } from './components/CustomDropdown';
import { ToastContainer, ToastMessage } from './components/Toast';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Package, 
  ShieldCheck, 
  ShieldAlert,
  HeartHandshake, 
  RotateCcw,
  Navigation,
  Lock,
  UserPlus,
  LogIn,
  Share2,
  ArrowUpDown
} from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'explore' | 'iso' | 'lend' | 'hub'>('explore');
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => AuthService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authContextReason, setAuthContextReason] = useState<string>('');

  // Real user demo isolation state: real users default to FALSE (only authentic items), demo personas / guests default to TRUE
  const [showSampleItems, setShowSampleItems] = useState<boolean>(() => {
    const user = AuthService.getCurrentUser();
    return user ? user.isDemo === true : true;
  });

  // Data State
  const [items, setItems] = useState<ShareItem[]>([]);
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [isoRequests, setIsoRequests] = useState<IsoRequest[]>([]);
  const [dbVersion, setDbVersion] = useState<number>(0);
  
  // Filtering, Search & Radius
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('All');
  const [distanceRadius, setDistanceRadius] = useState<number>(5); // Default: 5-mile radius
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'newest' | 'free_first' | 'trust'>('distance');

  // Location State (persisted via NeighborShareService or active user profile)
  const initialLoc = NeighborShareService.getUserLocation();
  const [userNeighborhood, setUserNeighborhood] = useState<string>(
    currentUser?.neighborhood || initialLoc.neighborhood || 'Shady Hollow'
  );
  const [userZipCode, setUserZipCode] = useState<string>(
    currentUser?.zipCode || initialLoc.zipCode || '78748'
  );
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Neighborhood Proposal & Admin Modals
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDefaultZip, setRequestDefaultZip] = useState('78748');
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Terms of Service Modal
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Share & Community Discovery Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Item & Borrow Modals
  const [selectedItem, setSelectedItem] = useState<ShareItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPostIsoModalOpen, setIsPostIsoModalOpen] = useState(false);
  const [selectedIsoForResponse, setSelectedIsoForResponse] = useState<IsoRequest | null>(null);
  const [isIsoResponseModalOpen, setIsIsoResponseModalOpen] = useState(false);
  
  // Coordination Chat Modal
  const [chatRequest, setChatRequest] = useState<BorrowRequest | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to Auth changes and sync demo separation state
  useEffect(() => {
    const unsub = AuthService.subscribe((u) => {
      setCurrentUser(u);
      if (u) {
        setUserNeighborhood(u.neighborhood);
        setUserZipCode(u.zipCode);
        setShowSampleItems(u.isDemo === true);
      } else {
        setShowSampleItems(true);
      }
    });
    return unsub;
  }, []);

  // Load items, requests, ISOs from local storage and sync with Cloud SQL PostgreSQL backend
  useEffect(() => {
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;

    // Fast initial render from local cache
    setItems(NeighborShareService.getItems({ includeDemo, user: currentUser }));
    setRequests(NeighborShareService.getRequests({ includeDemo, user: currentUser }));
    setIsoRequests(NeighborShareService.getIsoRequests({ includeDemo, user: currentUser }));

    // Real-time synchronization from Cloud SQL PostgreSQL
    NeighborShareService.fetchAndSyncFromDatabase({ includeDemo, user: currentUser })
      .then((synced) => {
        setItems(synced.items);
        setRequests(synced.requests);
        setIsoRequests(synced.isoRequests);
      })
      .catch((err) => console.warn('Cloud SQL sync notification:', err));
  }, [currentUser, showSampleItems, dbVersion]);

  // Pending neighborhood proposals for admin badge
  const pendingProposalsCount = useMemo(() => {
    return NeighborShareService.getNeighborhoodProposals().filter((p) => p.status === 'pending').length;
  }, [dbVersion]);

  // Dynamic approved neighborhoods for Explore filter dropdown
  const approvedNeighborhoods = useMemo(() => {
    const all = NeighborShareService.getAllApprovedNeighborhoods();
    const names = Array.from(new Set(all.map((n) => n.neighborhood)));
    return names.sort();
  }, [dbVersion]);

  // Filtered Items logic with distance from user's neighborhood profile
  const itemsWithDistance = useMemo(() => {
    return items.map((item) => {
      const distance = calculateDistanceMiles(
        userZipCode,
        item.zipCode,
        userNeighborhood,
        item.neighborhood
      );
      return {
        ...item,
        distanceMiles: distance,
      };
    });
  }, [items, userZipCode, userNeighborhood]);

  const filteredItems = useMemo(() => {
    return itemsWithDistance.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      
      // Radius filter: default 5 miles of user's profile neighborhood
      const matchesRadius = distanceRadius >= 999 || item.distanceMiles <= distanceRadius;

      // Specific neighborhood filter if chosen
      let matchesNeighborhood = true;
      if (selectedNeighborhood === 'All') {
        matchesNeighborhood = true;
      } else if (selectedNeighborhood === 'my_neighborhood') {
        matchesNeighborhood = item.neighborhood === userNeighborhood;
      } else if (selectedNeighborhood === 'my_zip') {
        matchesNeighborhood = item.zipCode === userZipCode;
      } else {
        matchesNeighborhood = item.neighborhood === selectedNeighborhood;
      }

      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.neighborhood.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.zipCode.includes(searchQuery);

      return matchesCategory && matchesRadius && matchesNeighborhood && matchesSearch;
    });
  }, [itemsWithDistance, selectedCategory, distanceRadius, selectedNeighborhood, searchQuery, userNeighborhood, userZipCode]);

  // Sort logic
  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      if (sortBy === 'distance') {
        return a.distanceMiles - b.distanceMiles;
      }
      if (sortBy === 'free_first') {
        if (a.dailyFee === 0 && b.dailyFee !== 0) return -1;
        if (b.dailyFee === 0 && a.dailyFee !== 0) return 1;
        return a.dailyFee - b.dailyFee;
      }
      if (sortBy === 'trust') {
        return b.lender.trustScore - a.lender.trustScore;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [filteredItems, sortBy]);

  // Auth Modals & Prompts
  const handleOpenLogin = (reason?: string) => {
    setAuthModalMode('login');
    setAuthContextReason(reason || '');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = (reason?: string) => {
    setAuthModalMode('signup');
    setAuthContextReason(reason || '');
    setIsAuthModalOpen(true);
  };

  const handleDirectGoogleSignIn = async () => {
    try {
      const res = await AuthService.loginWithGoogle(userNeighborhood, userZipCode);
      if (res.success && res.user) {
        handleAuthSuccess(res.user);
      } else {
        handleOpenLogin(res.error || 'Please sign in with Google or your email');
      }
    } catch {
      handleOpenLogin('Please sign in to continue');
    }
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setUserNeighborhood(user.neighborhood);
    setUserZipCode(user.zipCode);
    addToast(
      'success',
      `Welcome, ${user.name}!`,
      `Connected to ${user.neighborhood} (${user.zipCode}).`
    );
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    if (activeView === 'lend' || activeView === 'hub') {
      setActiveView('explore');
    }
    addToast('info', 'Signed Out', 'You are now browsing NeighborShare as a guest.');
  };

  const handleQuickDemoLogin = (user: UserAccount) => {
    AuthService.setCurrentUser(user);
    setCurrentUser(user);
    setUserNeighborhood(user.neighborhood);
    setUserZipCode(user.zipCode);
    addToast(
      'success',
      `Logged in as ${user.name}`,
      `Profile: ${user.neighborhood} (${user.zipCode})`
    );
  };

  // Action handlers
  const handleOpenItemDetails = (item: ShareItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleCardBorrowClick = (item: ShareItem) => {
    if (!currentUser) {
      handleOpenLogin(`Please log in or create an account to borrow "${item.title}".`);
      setSelectedItem(item);
    } else {
      handleOpenItemDetails(item);
    }
  };

  const handleRequestBorrow = (params: {
    item: ShareItem;
    startDate: string;
    endDate: string;
    message: string;
    pickupPreference: 'Porch pickup' | 'Front gate handoff' | 'Flexible meet-up';
  }) => {
    if (!currentUser) {
      handleOpenLogin(`Please log in or create an account to borrow ${params.item.title}`);
      return;
    }

    NeighborShareService.createRequest(params, currentUser);
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;
    const updated = NeighborShareService.getRequests({ includeDemo, user: currentUser });
    setRequests(updated);
    addToast(
      'success',
      'Borrow Request Sent!',
      `Sent to ${params.item.lender.name}. Coordinate pickup in My Hub.`
    );
  };

  const handleAddItem = (
    itemData: Omit<ShareItem, 'id' | 'createdAt' | 'lender' | 'isMyGarageItem'>
  ) => {
    if (!currentUser) {
      handleOpenLogin('Please log in or create an account to add items to your garage.');
      return;
    }

    NeighborShareService.addItem(itemData, currentUser);
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;
    const updated = NeighborShareService.getItems({ includeDemo, user: currentUser });
    setItems(updated);
    addToast(
      'success',
      'Added to Garage!',
      `"${itemData.title}" is now available to neighbors in ${itemData.neighborhood}.`
    );
    setActiveView('explore');
  };

  const handleToggleItemAvailability = (itemId: string) => {
    NeighborShareService.toggleItemAvailability(itemId);
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;
    const updated = NeighborShareService.getItems({ includeDemo, user: currentUser });
    setItems(updated);
    addToast('info', 'Item status updated');
  };

  const handleDeleteItem = (itemId: string) => {
    NeighborShareService.deleteItem(itemId);
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;
    const updated = NeighborShareService.getItems({ includeDemo, user: currentUser });
    setItems(updated);
    addToast('info', 'Item removed from your garage');
  };

  const handlePostIso = (params: {
    title: string;
    category: ItemCategory;
    description: string;
    neededByDate: string;
    neighborhood: string;
    zipCode: string;
  }) => {
    if (!currentUser) {
      handleOpenLogin('Please log in or create an account to post a request to your neighborhood.');
      return;
    }

    NeighborShareService.addIsoRequest(params, currentUser);
    const isReal = currentUser && !currentUser.isDemo;
    const includeDemo = isReal ? showSampleItems : true;
    const updated = NeighborShareService.getIsoRequests({ includeDemo, user: currentUser });
    setIsoRequests(updated);
    addToast(
      'success',
      'Request Posted to Neighborhood!',
      'Your request is visible on the Neighbor Requests board.'
    );
  };

  const handleOpenIsoResponse = (iso: IsoRequest) => {
    if (!currentUser) {
      handleOpenLogin(`Please log in or create an account to offer to lend for "${iso.title}".`);
      return;
    }
    setSelectedIsoForResponse(iso);
    setIsIsoResponseModalOpen(true);
  };

  const handleSendIsoResponse = (isoId: string, message: string) => {
    NeighborShareService.respondToIso(isoId, message);
    const updated = NeighborShareService.getIsoRequests();
    setIsoRequests(updated);
    addToast(
      'success',
      'Offer Sent!',
      'Neighbor notified with your offer.'
    );
  };

  const handleUpdateRequestStatus = (requestId: string, status: RequestStatus) => {
    NeighborShareService.updateRequestStatus(requestId, status);
    const updatedReqs = NeighborShareService.getRequests();
    setRequests(updatedReqs);
    if (chatRequest && chatRequest.id === requestId) {
      const refreshed = updatedReqs.find((r) => r.id === requestId);
      if (refreshed) setChatRequest(refreshed);
    }
    addToast(
      'info',
      `Request updated to ${status.replace('_', ' ')}`
    );
  };

  const handleSendChatMessage = (
    requestId: string,
    text: string,
    role: 'lender' | 'borrower'
  ) => {
    NeighborShareService.sendChatMessage(requestId, text, role);
    const updatedReqs = NeighborShareService.getRequests();
    setRequests(updatedReqs);
    if (chatRequest && chatRequest.id === requestId) {
      const refreshed = updatedReqs.find((r) => r.id === requestId);
      if (refreshed) setChatRequest(refreshed);
    }
  };

  const handleOpenChat = (request: BorrowRequest) => {
    setChatRequest(request);
    setIsChatModalOpen(true);
  };

  const handleResetData = () => {
    NeighborShareService.resetToDemoData();
    setItems(NeighborShareService.getItems());
    setRequests(NeighborShareService.getRequests());
    setIsoRequests(NeighborShareService.getIsoRequests());
    setDbVersion((v) => v + 1);
    addToast('info', 'Demo data reset to default neighborhood items and directory');
  };

  // Pending incoming requests for badge
  const activeUserId = currentUser ? currentUser.id : 'user-current-me';
  const pendingIncomingCount = requests.filter(
    (r) => (r.lenderId === activeUserId || r.lenderName.includes('You')) && r.status === 'pending'
  ).length;

  const neighborhoodDropdownOptions: DropdownOption[] = [
    { value: 'All', label: 'All in Selected Radius', group: 'Radius Scope' },
    { value: 'my_neighborhood', label: `Only ${userNeighborhood} (${userZipCode})`, group: 'Radius Scope' },
    { value: 'my_zip', label: `Within Zip Code ${userZipCode}`, group: 'Radius Scope' },
    ...approvedNeighborhoods.map((nh) => ({
      value: nh,
      label: nh,
      group: 'Specific Neighborhoods',
    })),
  ];

  const sortDropdownOptions: DropdownOption[] = [
    { value: 'distance', label: 'Nearest to You' },
    { value: 'newest', label: 'Newest First' },
    { value: 'free_first', label: 'Free to Borrow First' },
    { value: 'trust', label: 'Highest Neighbor Trust' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* 3-Zone Top Navigation with Full Auth Integration */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        pendingRequestsCount={pendingIncomingCount}
        currentNeighborhood={userNeighborhood}
        currentZipCode={userZipCode}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAdminModal={() => {
          if (!currentUser?.isAdmin) {
            handleOpenLogin('Admin access required. Please sign in as Community Admin (admin@neighborshare.austin).');
          } else {
            setIsAdminModalOpen(true);
          }
        }}
        pendingProposalsCount={pendingProposalsCount}
        currentUser={currentUser}
        onOpenLogin={handleOpenLogin}
        onOpenSignup={() => handleOpenSignup()}
        onLogout={handleLogout}
        onOpenShareModal={() => setIsShareModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'explore' && (
          <div className="space-y-10 pb-16">
            {/* Hero Banner with Dynamic Location */}
            <HeroBanner
              userNeighborhood={userNeighborhood}
              userZipCode={userZipCode}
              onExploreClick={() => {
                const el = document.getElementById('explore-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onPostIsoClick={() => {
                if (!currentUser) {
                  handleOpenLogin('Please log in or create an account to post an item request to neighbors.');
                } else {
                  setIsPostIsoModalOpen(true);
                }
              }}
              onShareClick={() => setIsShareModalOpen(true)}
            />

            {/* Guest Banner if not logged in */}
            {!currentUser && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 mb-2">
                <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-900/60 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Browsing as Neighbor Guest</span>
                        <span className="text-[10px] font-semibold bg-emerald-500/30 text-emerald-200 px-2 py-0.2 rounded-full">
                          Login required to borrow & lend
                        </span>
                      </h2>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Log in or create a free account to send borrow requests, list your garage items, and chat with neighbors.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenLogin()}
                      className="px-4 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800/90 hover:bg-slate-800 rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Log In</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenSignup()}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter & Item Catalog Section */}
            <div id="explore-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                  {/* Controls bar: Search, Categories, Radius & Neighborhood */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder="Search drills, pressure washers, ladders, chairs, tents, neighborhoods..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full text-xs sm:text-sm font-medium text-slate-900 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Neighborhood Dropdown & Sort Custom Dropdowns with Click-Outside */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <CustomDropdown
                          value={selectedNeighborhood}
                          onChange={(val) => setSelectedNeighborhood(val)}
                          options={neighborhoodDropdownOptions}
                          icon={<MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          labelPrefix="Neighborhood"
                          placeholder="Select neighborhood"
                        />

                        <CustomDropdown
                          value={sortBy}
                          onChange={(val) => setSortBy(val as any)}
                          options={sortDropdownOptions}
                          icon={<ArrowUpDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                          labelPrefix="Sort"
                          placeholder="Sort by"
                        />

                        <button
                          type="button"
                          onClick={() => setIsLocationModalOpen(true)}
                          className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline px-1"
                        >
                          Change My Location
                        </button>
                      </div>
                    </div>

                {/* 5-Mile Neighborhood Radius Selector */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Neighborhood Radius:</span>
                    </span>
                    {[
                      { label: '5 Miles (Surrounding)', value: 5, badge: 'Recommended' },
                      { label: '2 Miles (Immediate)', value: 2 },
                      { label: '10 Miles (Extended)', value: 10 },
                      { label: 'All Austin Metro', value: 999 },
                    ].map((rad) => {
                      const isActive = distanceRadius === rad.value;
                      return (
                        <button
                          key={rad.value}
                          type="button"
                          onClick={() => setDistanceRadius(rad.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-2xs scale-102'
                              : 'bg-slate-100/90 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                          }`}
                        >
                          <span>{rad.label}</span>
                          {rad.badge && !isActive && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                              {rad.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>
                      Centered on <strong>{userNeighborhood}</strong> ({userZipCode})
                    </span>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  {['All', 'Tools', 'Outdoor', 'Kitchen', 'Party', 'Camping', 'Other'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {cat === 'All' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Available Items Near You</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {sortedItems.length} items
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Items listed within {distanceRadius >= 999 ? 'Austin metro' : `${distanceRadius} miles`} of your profile in {userNeighborhood} ({userZipCode})
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {currentUser && !currentUser.isDemo && (
                    <button
                      type="button"
                      onClick={() => setShowSampleItems(!showSampleItems)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        showSampleItems
                          ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                      title="Toggle sample items for demonstration"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showSampleItems ? 'Showcase Items: On' : 'Showcase Items: Off'}</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="inline-flex items-center gap-1 text-xs text-amber-800 font-semibold bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
                    title="View NeighborShare terms of service and member liability waiver"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>Member Terms Policy</span>
                  </button>

                  <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Zero Commission</span>
                  </div>
                </div>
              </div>

              {/* Real User Sample Items Info Banner */}
              {currentUser && !currentUser.isDemo && showSampleItems && (
                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-indigo-900 gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>
                      <strong>Showcase mode is active:</strong> You are seeing sample demonstration items alongside authentic neighbor listings.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSampleItems(false)}
                    className="font-bold underline text-indigo-700 hover:text-indigo-900 shrink-0"
                  >
                    Hide Showcase Items
                  </button>
                </div>
              )}

              {/* Items Grid */}
              {sortedItems.length === 0 ? (
                currentUser && !currentUser.isDemo && !showSampleItems ? (
                  <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Welcome to {userNeighborhood}! No authentic items listed yet.
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                        Demo data is separated so real users only see authentic items entered by actual neighbors. Be the first neighbor in {userNeighborhood} to list something, or preview sample items to see how it works!
                      </p>
                    </div>
                    <div className="flex justify-center gap-3 pt-2 flex-wrap">
                      <button
                        onClick={() => setActiveView('lend')}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
                      >
                        + List First Item in Your Garage
                      </button>
                      <button
                        onClick={() => setShowSampleItems(true)}
                        className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        Preview Sample Showcase Items
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
                    <Package className="w-10 h-10 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                      No items found within {distanceRadius >= 999 ? 'metro area' : `${distanceRadius} miles`} of {userNeighborhood}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Try expanding your radius to 10 miles or All Austin Metro, or post a request on the Neighbor Requests board so nearby neighbors can help!
                    </p>
                    <div className="flex justify-center gap-2 pt-2 flex-wrap">
                      <button
                        onClick={() => setDistanceRadius(10)}
                        className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200"
                      >
                        Expand to 10-Mile Radius
                      </button>
                      <button
                        onClick={() => {
                          setDistanceRadius(5);
                          setSearchQuery('');
                          setSelectedCategory('All');
                          setSelectedNeighborhood('All');
                        }}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            handleOpenLogin('Please log in or create an account to post an item request.');
                          } else {
                            setIsPostIsoModalOpen(true);
                          }
                        }}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Ask Neighbors for an Item
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {sortedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      distanceMiles={item.distanceMiles}
                      onSelect={handleOpenItemDetails}
                      onRequestBorrow={handleCardBorrowClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Embedded ISO Board on Home Feed */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <div className="border-t border-slate-200 pt-10">
                <IsoBoard
                  isoRequests={isoRequests}
                  currentUser={currentUser}
                  onRequireLogin={handleOpenLogin}
                  onOpenPostModal={() => setIsPostIsoModalOpen(true)}
                  onOpenResponseModal={handleOpenIsoResponse}
                />
              </div>
            </div>
          </div>
        )}

        {/* View 2: Dedicated ISO Board View */}
        {activeView === 'iso' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <IsoBoard
              isoRequests={isoRequests}
              currentUser={currentUser}
              onRequireLogin={handleOpenLogin}
              onOpenPostModal={() => setIsPostIsoModalOpen(true)}
              onOpenResponseModal={handleOpenIsoResponse}
            />
          </div>
        )}

        {/* View 3: Lend an Item ("Add to Your Garage") - PROTECTED FEATURE */}
        {activeView === 'lend' && (
          !currentUser ? (
            <AuthGate
              title="Add Items to Your Neighborhood Garage"
              description="Listing lawn equipment, power tools, camping gear, or party supplies requires a verified neighbor account so your neighbors know who they are borrowing from."
              onOpenLogin={() => handleOpenLogin('Log in to list items in your garage')}
              onOpenSignup={() => handleOpenSignup()}
              onGoogleSignIn={handleDirectGoogleSignIn}
              onQuickDemoLogin={handleQuickDemoLogin}
            />
          ) : (
            <LendItemView
              onItemAdded={handleAddItem}
              onCancel={() => setActiveView('explore')}
              currentNeighborhood={userNeighborhood}
              currentZipCode={userZipCode}
              onRequestNewNeighborhood={(zip) => {
                setRequestDefaultZip(zip);
                setIsRequestModalOpen(true);
              }}
              onOpenTerms={() => setIsTermsModalOpen(true)}
            />
          )
        )}

        {/* View 4: My Hub / Dashboard - PROTECTED FEATURE */}
        {activeView === 'hub' && (
          !currentUser ? (
            <AuthGate
              title="Neighbor Sharing Hub & Messages"
              description="Your Hub keeps track of your active borrow requests, items currently borrowed, and direct neighbor pickup chats. Please log in or create an account to view your hub."
              onOpenLogin={() => handleOpenLogin('Log in to view your sharing hub')}
              onOpenSignup={() => handleOpenSignup()}
              onGoogleSignIn={handleDirectGoogleSignIn}
              onQuickDemoLogin={handleQuickDemoLogin}
            />
          ) : (
            <DashboardView
              requests={requests}
              garageItems={items}
              currentUser={currentUser}
              onOpenChat={handleOpenChat}
              onUpdateStatus={handleUpdateRequestStatus}
              onToggleAvailability={handleToggleItemAvailability}
              onDeleteItem={handleDeleteItem}
              onNavigateToLend={() => setActiveView('lend')}
              onOpenAdminModal={() => setIsAdminModalOpen(true)}
              pendingProposalsCount={pendingProposalsCount}
            />
          )
        )}
      </main>

      {/* Footer with Terms of Service Policy Link */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img
              src="/favicon.svg"
              alt="NeighborShare icon"
              className="w-6 h-6 rounded-md shadow-2xs"
            />
            <span className="font-bold text-slate-800">NeighborShare</span>
            <span>— "Why buy when you can borrow from a neighbor?"</span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsTermsModalOpen(true)}
              className="text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 underline underline-offset-2"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Terms of Service & Liability Disclaimer</span>
            </button>
            <span className="text-slate-300" aria-hidden="true">·</span>

            {/* Share & Invite Neighbors / SEO Discovery Modal */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share & Invite Neighbors</span>
            </button>

            {/* Only show "Request New Neighborhood" if user is logged in */}
            {currentUser && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <button
                  onClick={() => {
                    setRequestDefaultZip(userZipCode);
                    setIsRequestModalOpen(true);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold"
                >
                  Request New Neighborhood
                </button>
              </>
            )}

            {/* Only show "Admin Console" and "Reset Demo Data" if user is logged in AND has admin role */}
            {currentUser?.isAdmin && (
              <>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <button
                  onClick={() => setIsAdminModalOpen(true)}
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin Console</span>
                  {pendingProposalsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {pendingProposalsCount}
                    </span>
                  )}
                </button>
                <span className="text-slate-300" aria-hidden="true">·</span>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Reset mock data to default"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo Data</span>
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* Item Details & Borrow Request Modal */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          isOpen={isDetailModalOpen}
          currentUser={currentUser}
          onOpenLogin={handleOpenLogin}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
          }}
          onSubmitBorrowRequest={handleRequestBorrow}
          onOpenTerms={() => setIsTermsModalOpen(true)}
          distanceMiles={calculateDistanceMiles(
            userZipCode,
            selectedItem.zipCode,
            userNeighborhood,
            selectedItem.neighborhood
          )}
        />
      )}

      {/* Post ISO Request Modal */}
      <PostIsoModal
        isOpen={isPostIsoModalOpen}
        onClose={() => setIsPostIsoModalOpen(false)}
        onSubmit={handlePostIso}
        userNeighborhood={userNeighborhood}
        userZipCode={userZipCode}
        onRequestNewNeighborhood={(zip) => {
          setRequestDefaultZip(zip);
          setIsRequestModalOpen(true);
        }}
      />

      {/* ISO Response Modal ("I Have This!") */}
      <IsoResponseModal
        iso={selectedIsoForResponse}
        isOpen={isIsoResponseModalOpen}
        onClose={() => {
          setIsIsoResponseModalOpen(false);
          setSelectedIsoForResponse(null);
        }}
        onSendResponse={handleSendIsoResponse}
      />

      {/* Coordination Chat Modal */}
      <CoordinationChatModal
        request={chatRequest}
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setChatRequest(null);
        }}
        onSendMessage={handleSendChatMessage}
        onUpdateStatus={handleUpdateRequestStatus}
      />

      {/* Location / Neighborhood Switcher Modal (Verified DB Only) */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentNeighborhood={userNeighborhood}
        currentZipCode={userZipCode}
        onSelectLocation={(neighborhood, zip) => {
          setUserNeighborhood(neighborhood);
          setUserZipCode(zip);
          NeighborShareService.setUserLocation(neighborhood, zip);
          setSelectedNeighborhood('All');
          addToast('success', 'Location Updated', `Set profile neighborhood to ${neighborhood} (${zip})`);
        }}
        onRequestNewNeighborhood={(zip) => {
          setRequestDefaultZip(zip);
          setIsRequestModalOpen(true);
        }}
        onOpenAdminReview={() => setIsAdminModalOpen(true)}
        pendingProposalsCount={pendingProposalsCount}
      />

      {/* User Submission Modal: Request to Add a New Neighborhood & Zip */}
      <RequestNeighborhoodModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        defaultZip={requestDefaultZip}
        onRequestSubmitted={(proposal) => {
          setDbVersion((v) => v + 1);
          addToast(
            'success',
            'Neighborhood Request Submitted!',
            `"${proposal.neighborhoodName}" in ${proposal.zipCode} sent for admin review.`
          );
        }}
      />

      {/* Admin Review & Approval Modal */}
      <AdminNeighborhoodModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onProposalUpdated={() => {
          setDbVersion((v) => v + 1);
          addToast('info', 'Directory Updated', 'Neighborhood changes saved to database.');
        }}
        onOpenNewProposalModal={() => {
          setIsAdminModalOpen(false);
          setIsRequestModalOpen(true);
        }}
      />

      {/* Terms of Service & Liability Waiver Modal (Modeled after Nextdoor Member Policy) */}
      <TermsOfServiceModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAccept={() => {
          addToast('success', 'Terms Accepted', 'Member agreement and peer-to-peer policy confirmed.');
        }}
        showAcceptButton={true}
      />

      {/* Authentication & Create Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authModalMode}
        contextReason={authContextReason}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onRequestNewNeighborhood={(zip) => {
          setRequestDefaultZip(zip);
          setIsRequestModalOpen(true);
        }}
      />

      {/* Share / Invite Neighbors & SEO Discovery Modal */}
      <ShareCommunityModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        neighborhoodName={userNeighborhood}
        zipCode={userZipCode}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
