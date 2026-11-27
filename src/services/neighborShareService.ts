import { ShareItem, BorrowRequest, IsoRequest, ChatMessage, RequestStatus, NeighborhoodProposal, UserAccount } from '../types';
import { INITIAL_ITEMS, INITIAL_REQUESTS, INITIAL_ISO_REQUESTS, CURRENT_USER, MY_INITIAL_GARAGE_ITEM } from '../data/mockData';
import { APP_IMAGES } from '../assets/images';
import { AUSTIN_ZIP_DATA, INITIAL_NEIGHBORHOOD_PROPOSALS, ZipNeighborhoodInfo } from '../data/austinZipData';
import { AuthService } from './authService';
import { sanitizeText } from '../utils/securityUtils';

const STORAGE_KEYS = {
  ITEMS: 'neighborshare_items_v3_austin',
  REQUESTS: 'neighborshare_requests_v2_austin',
  ISO: 'neighborshare_iso_v2_austin',
  NEIGHBORHOODS: 'neighborshare_neighborhoods_db_v2',
  PROPOSALS: 'neighborshare_proposals_v2',
  USER_LOCATION: 'neighborshare_user_location_v2',
};

export class NeighborShareService {
  private static getStoredData<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
          return defaultValue;
        }
        return parsed;
      }
    } catch {
      // LocalStorage access fallback
    }
    return defaultValue;
  }

  private static setStoredData<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage quota or error handling
    }
  }

  // --- ITEMS API ---

  public static getItems(options?: { includeDemo?: boolean; user?: UserAccount | null }): ShareItem[] {
    const defaultList = [
      MY_INITIAL_GARAGE_ITEM,
      ...INITIAL_ITEMS.map((item) => ({ ...item, isDemo: true })),
    ];
    const allItems = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, defaultList);

    // Normalize any items missing isDemo
    const normalized = allItems.map((item) => ({
      ...item,
      isDemo: item.isDemo !== undefined ? item.isDemo : true,
    }));

    const activeUser = options?.user !== undefined ? options.user : AuthService.getCurrentUser();

    // Isolation rule:
    // If includeDemo is explicitly provided, respect it.
    // Otherwise: Real users (isDemo === false) ONLY see real items (isDemo: false).
    // Demo personas or unauthenticated guests see demo items.
    const shouldIncludeDemo = options?.includeDemo !== undefined
      ? options.includeDemo
      : (activeUser ? activeUser.isDemo === true : true);

    if (shouldIncludeDemo) {
      return normalized;
    }
    return normalized.filter((item) => item.isDemo === false);
  }

  public static getItemById(id: string): ShareItem | undefined {
    const defaultList = [
      MY_INITIAL_GARAGE_ITEM,
      ...INITIAL_ITEMS.map((item) => ({ ...item, isDemo: true })),
    ];
    const all = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, defaultList);
    return all.find((item) => item.id === id);
  }

  public static addItem(
    itemData: Omit<ShareItem, 'id' | 'createdAt' | 'lender' | 'isMyGarageItem'>,
    user?: UserAccount | null
  ): ShareItem {
    const defaultList = [
      MY_INITIAL_GARAGE_ITEM,
      ...INITIAL_ITEMS.map((item) => ({ ...item, isDemo: true })),
    ];
    const items = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, defaultList);
    const active = user !== undefined ? user : AuthService.getCurrentUser();
    
    // Strict isolation: if logged in as a real user, isDemo is false!
    const isDemo = active ? active.isDemo === true : true;
    
    const lenderId = active ? active.id : CURRENT_USER.id;
    const lenderName = active ? `${active.name} (You)` : `${CURRENT_USER.name} (You)`;
    const lenderAvatar = active ? active.avatar : CURRENT_USER.avatar;
    const lenderTrust = active ? active.trustScore : CURRENT_USER.trustScore;
    const lenderLends = active ? active.totalLends + 1 : CURRENT_USER.totalLends + 1;
    const lenderNh = itemData.neighborhood || (active ? active.neighborhood : CURRENT_USER.neighborhood);
    const lenderZip = itemData.zipCode || (active ? active.zipCode : CURRENT_USER.zipCode);

    const newItem: ShareItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isMyGarageItem: true,
      isDemo: isDemo,
      lender: {
        id: lenderId,
        name: lenderName,
        avatar: lenderAvatar,
        trustScore: lenderTrust,
        totalLends: lenderLends,
        responseTime: 'within 15 mins',
        neighborhood: lenderNh,
        zipCode: lenderZip,
        isVerifiedNeighbor: true,
      },
    };

    const updated = [newItem, ...items];
    this.setStoredData(STORAGE_KEYS.ITEMS, updated);

    // Sync to Cloud SQL backend
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    }).catch((err) => console.error('Cloud SQL item sync error:', err));

    return newItem;
  }

  public static toggleItemAvailability(id: string): ShareItem | undefined {
    const defaultList = [
      MY_INITIAL_GARAGE_ITEM,
      ...INITIAL_ITEMS.map((item) => ({ ...item, isDemo: true })),
    ];
    const items = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, defaultList);
    let updatedItem: ShareItem | undefined;
    const updated = items.map((item) => {
      if (item.id === id) {
        updatedItem = { ...item, isAvailable: !item.isAvailable };
        return updatedItem;
      }
      return item;
    });
    this.setStoredData(STORAGE_KEYS.ITEMS, updated);

    fetch(`/api/items/${id}/toggle`, { method: 'PATCH' }).catch((err) =>
      console.error('Cloud SQL toggle error:', err)
    );

    return updatedItem;
  }

  public static deleteItem(id: string): void {
    const defaultList = [
      MY_INITIAL_GARAGE_ITEM,
      ...INITIAL_ITEMS.map((item) => ({ ...item, isDemo: true })),
    ];
    const items = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, defaultList);
    const updated = items.filter((item) => item.id !== id);
    this.setStoredData(STORAGE_KEYS.ITEMS, updated);

    fetch(`/api/items/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Cloud SQL delete error:', err)
    );
  }

  // --- BORROW REQUESTS API ---

  public static getRequests(options?: { includeDemo?: boolean; user?: UserAccount | null }): BorrowRequest[] {
    const all = this.getStoredData<BorrowRequest[]>(
      STORAGE_KEYS.REQUESTS,
      INITIAL_REQUESTS.map((r) => ({ ...r, isDemo: true }))
    );
    const normalized = all.map((r) => ({
      ...r,
      isDemo: r.isDemo !== undefined ? r.isDemo : true,
    }));

    const activeUser = options?.user !== undefined ? options.user : AuthService.getCurrentUser();
    const shouldIncludeDemo = options?.includeDemo !== undefined
      ? options.includeDemo
      : (activeUser ? activeUser.isDemo === true : true);

    if (shouldIncludeDemo) {
      return normalized;
    }
    return normalized.filter((r) => r.isDemo === false);
  }

  public static createRequest(
    params: {
      item: ShareItem;
      startDate: string;
      endDate: string;
      message: string;
      pickupPreference: 'Porch pickup' | 'Front gate handoff' | 'Flexible meet-up';
    },
    user?: UserAccount | null
  ): BorrowRequest {
    const allStored = this.getStoredData<BorrowRequest[]>(
      STORAGE_KEYS.REQUESTS,
      INITIAL_REQUESTS.map((r) => ({ ...r, isDemo: true }))
    );
    const active = user !== undefined ? user : AuthService.getCurrentUser();
    const isDemo = active ? active.isDemo === true : true;
    const borrowerId = active ? active.id : CURRENT_USER.id;
    const borrowerName = active ? `${active.name} (You)` : `${CURRENT_USER.name} (You)`;
    const borrowerNh = active ? active.neighborhood : CURRENT_USER.neighborhood;
    const borrowerTrust = active ? active.trustScore : CURRENT_USER.trustScore;

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1);

    const newRequest: BorrowRequest = {
      id: `req-${Date.now()}`,
      itemId: params.item.id,
      itemTitle: params.item.title,
      itemCategory: params.item.category,
      itemImageUrl: params.item.imageUrl,
      lenderId: params.item.lender.id,
      lenderName: params.item.lender.name,
      borrowerId: borrowerId,
      borrowerName: borrowerName,
      borrowerNeighborhood: borrowerNh,
      borrowerTrustScore: borrowerTrust,
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays,
      dailyFee: params.item.dailyFee,
      deposit: params.item.refundableDeposit,
      message: params.message,
      pickupPreference: params.pickupPreference,
      status: 'pending',
      isDemo: isDemo,
      createdAt: new Date().toISOString(),
      handoffAddress: `${params.item.neighborhood} (address shared after approval)`,
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: borrowerId,
          senderName: active ? active.name : CURRENT_USER.name,
          senderRole: 'borrower',
          text: params.message || `Hi! I would love to borrow your ${params.item.title} from ${params.startDate} to ${params.endDate}.`,
          timestamp: 'Just now',
        },
      ],
    };

    const updated = [newRequest, ...allStored];
    this.setStoredData(STORAGE_KEYS.REQUESTS, updated);

    // Sync to Cloud SQL
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest),
    }).catch((err) => console.error('Cloud SQL request sync error:', err));

    return newRequest;
  }

  public static updateRequestStatus(requestId: string, status: RequestStatus): BorrowRequest | undefined {
    const allStored = this.getStoredData<BorrowRequest[]>(
      STORAGE_KEYS.REQUESTS,
      INITIAL_REQUESTS.map((r) => ({ ...r, isDemo: true }))
    );
    let updatedReq: BorrowRequest | undefined;
    const updated = allStored.map((req) => {
      if (req.id === requestId) {
        const autoMessage: ChatMessage | null =
          status === 'approved'
            ? {
                id: `msg-auto-${Date.now()}`,
                senderId: req.lenderId,
                senderName: req.lenderName,
                senderRole: 'lender',
                text: `Request Approved! You're welcome to pick up at ${req.handoffAddress || 'my front porch'}. Please text or message when you are on your way!`,
                timestamp: 'Just now',
              }
            : status === 'picked_up'
            ? {
                id: `msg-auto-${Date.now()}`,
                senderId: req.borrowerId,
                senderName: req.borrowerName,
                senderRole: 'borrower',
                text: 'Item successfully picked up! Thanks so much neighbor.',
                timestamp: 'Just now',
              }
            : status === 'returned'
            ? {
                id: `msg-auto-${Date.now()}`,
                senderId: req.lenderId,
                senderName: req.lenderName,
                senderRole: 'lender',
                text: 'Item marked returned in good condition. Deposit returned. Thank you!',
                timestamp: 'Just now',
              }
            : null;

        updatedReq = {
          ...req,
          status,
          messages: autoMessage ? [...req.messages, autoMessage] : req.messages,
        };
        return updatedReq;
      }
      return req;
    });

    this.setStoredData(STORAGE_KEYS.REQUESTS, updated);

    fetch(`/api/requests/${requestId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch((err) => console.error('Cloud SQL request status update error:', err));

    return updatedReq;
  }

  public static sendChatMessage(requestId: string, text: string, senderRole: 'lender' | 'borrower'): ChatMessage | null {
    const cleanText = sanitizeText(text, 1000);
    if (!cleanText) return null;
    const allStored = this.getStoredData<BorrowRequest[]>(
      STORAGE_KEYS.REQUESTS,
      INITIAL_REQUESTS.map((r) => ({ ...r, isDemo: true }))
    );
    let addedMsg: ChatMessage | null = null;

    const updated = allStored.map((req) => {
      if (req.id === requestId) {
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          senderId: senderRole === 'lender' ? req.lenderId : CURRENT_USER.id,
          senderName: senderRole === 'lender' ? req.lenderName : `${CURRENT_USER.name}`,
          senderRole,
          text: cleanText,
          timestamp: 'Just now',
        };
        addedMsg = newMsg;
        return {
          ...req,
          messages: [...req.messages, newMsg],
        };
      }
      return req;
    });

    this.setStoredData(STORAGE_KEYS.REQUESTS, updated);

    if (addedMsg) {
      fetch(`/api/requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addedMsg),
      }).catch((err) => console.error('Cloud SQL message sync error:', err));
    }

    return addedMsg;
  }

  // --- ISO (IN SEARCH OF) API ---

  public static getIsoRequests(options?: { includeDemo?: boolean; user?: UserAccount | null }): IsoRequest[] {
    const all = this.getStoredData<IsoRequest[]>(
      STORAGE_KEYS.ISO,
      INITIAL_ISO_REQUESTS.map((iso) => ({ ...iso, isDemo: true }))
    );
    const normalized = all.map((iso) => ({
      ...iso,
      isDemo: iso.isDemo !== undefined ? iso.isDemo : true,
    }));

    const activeUser = options?.user !== undefined ? options.user : AuthService.getCurrentUser();
    const shouldIncludeDemo = options?.includeDemo !== undefined
      ? options.includeDemo
      : (activeUser ? activeUser.isDemo === true : true);

    if (shouldIncludeDemo) {
      return normalized;
    }
    return normalized.filter((iso) => iso.isDemo === false);
  }

  public static addIsoRequest(
    params: {
      title: string;
      category: IsoRequest['category'];
      description: string;
      neededByDate: string;
      neighborhood: string;
      zipCode: string;
    },
    user?: UserAccount | null
  ): IsoRequest {
    const allStored = this.getStoredData<IsoRequest[]>(
      STORAGE_KEYS.ISO,
      INITIAL_ISO_REQUESTS.map((iso) => ({ ...iso, isDemo: true }))
    );
    const active = user !== undefined ? user : AuthService.getCurrentUser();
    const isDemo = active ? active.isDemo === true : true;
    const posterName = active ? active.name : CURRENT_USER.name;
    const posterTrust = active ? active.trustScore : CURRENT_USER.trustScore;
    const posterAvatar = active ? active.avatar : CURRENT_USER.avatar;
    const posterNh = params.neighborhood || (active ? active.neighborhood : CURRENT_USER.neighborhood);
    const posterZip = params.zipCode || (active ? active.zipCode : CURRENT_USER.zipCode);

    const newIso: IsoRequest = {
      id: `iso-${Date.now()}`,
      title: params.title,
      category: params.category,
      description: params.description,
      neededByDate: params.neededByDate,
      neighborhood: posterNh,
      zipCode: posterZip,
      posterName: posterName,
      posterTrustScore: posterTrust,
      posterAvatar: posterAvatar,
      responsesCount: 0,
      createdAt: new Date().toISOString(),
      status: 'open',
      isDemo: isDemo,
    };

    const updated = [newIso, ...allStored];
    this.setStoredData(STORAGE_KEYS.ISO, updated);

    // Sync to Cloud SQL
    fetch('/api/iso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIso),
    }).catch((err) => console.error('Cloud SQL ISO sync error:', err));

    return newIso;
  }

  public static respondToIso(isoId: string, _offerMessage: string): boolean {
    const list = this.getStoredData<IsoRequest[]>(
      STORAGE_KEYS.ISO,
      INITIAL_ISO_REQUESTS.map((iso) => ({ ...iso, isDemo: true }))
    );
    let updated = false;
    const mapped = list.map((item) => {
      if (item.id === isoId) {
        updated = true;
        return {
          ...item,
          responsesCount: item.responsesCount + 1,
        };
      }
      return item;
    });

    if (updated) {
      this.setStoredData(STORAGE_KEYS.ISO, mapped);
      fetch(`/api/iso/${isoId}/respond`, { method: 'POST' }).catch((err) =>
        console.error('Cloud SQL ISO respond error:', err)
      );
    }
    return updated;
  }

  /**
   * Sync active data with Cloud SQL PostgreSQL backend
   */
  public static async fetchAndSyncFromDatabase(options?: {
    includeDemo?: boolean;
    user?: UserAccount | null;
  }): Promise<{ items: ShareItem[]; requests: BorrowRequest[]; isoRequests: IsoRequest[] }> {
    try {
      const activeUser = options?.user !== undefined ? options.user : AuthService.getCurrentUser();
      const shouldIncludeDemo = options?.includeDemo !== undefined
        ? options.includeDemo
        : (activeUser ? activeUser.isDemo === true : true);

      const [itemsRes, reqsRes, isoRes] = await Promise.all([
        fetch(`/api/items?includeDemo=${shouldIncludeDemo}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/requests?includeDemo=${shouldIncludeDemo}`).then((r) => (r.ok ? r.json() : null)),
        fetch(`/api/iso?includeDemo=${shouldIncludeDemo}`).then((r) => (r.ok ? r.json() : null)),
      ]);

      if (Array.isArray(itemsRes) && itemsRes.length > 0) {
        // Merge fetched items with local items
        const existing = this.getStoredData<ShareItem[]>(STORAGE_KEYS.ITEMS, []);
        const map = new Map<string, ShareItem>();
        existing.forEach((i) => map.set(i.id, i));
        itemsRes.forEach((i: ShareItem) => map.set(i.id, i));
        const merged = Array.from(map.values());
        this.setStoredData(STORAGE_KEYS.ITEMS, merged);
      }

      if (Array.isArray(reqsRes) && reqsRes.length > 0) {
        const existing = this.getStoredData<BorrowRequest[]>(STORAGE_KEYS.REQUESTS, []);
        const map = new Map<string, BorrowRequest>();
        existing.forEach((r) => map.set(r.id, r));
        reqsRes.forEach((r: BorrowRequest) => map.set(r.id, r));
        const merged = Array.from(map.values());
        this.setStoredData(STORAGE_KEYS.REQUESTS, merged);
      }

      if (Array.isArray(isoRes) && isoRes.length > 0) {
        const existing = this.getStoredData<IsoRequest[]>(STORAGE_KEYS.ISO, []);
        const map = new Map<string, IsoRequest>();
        existing.forEach((iso) => map.set(iso.id, iso));
        isoRes.forEach((iso: IsoRequest) => map.set(iso.id, iso));
        const merged = Array.from(map.values());
        this.setStoredData(STORAGE_KEYS.ISO, merged);
      }
    } catch (e) {
      console.warn('Sync with Cloud SQL skipped or offline:', e);
    }

    return {
      items: this.getItems(options),
      requests: this.getRequests(options),
      isoRequests: this.getIsoRequests(options),
    };
  }

  // --- NEIGHBORHOOD DATABASE & ADMIN APPROVAL API ---

  public static getNeighborhoodsDatabase(): Record<string, ZipNeighborhoodInfo> {
    return this.getStoredData<Record<string, ZipNeighborhoodInfo>>(
      STORAGE_KEYS.NEIGHBORHOODS,
      AUSTIN_ZIP_DATA
    );
  }

  public static getNeighborhoodsForZip(zip: string): { areaName: string; neighborhoods: string[] } | null {
    const cleanZip = zip.trim();
    if (!cleanZip) return null;
    const db = this.getNeighborhoodsDatabase();
    if (db[cleanZip]) {
      return db[cleanZip];
    }
    return null;
  }

  public static addNeighborhoodToZip(zip: string, neighborhoodName: string, areaName?: string): void {
    const cleanZip = sanitizeText(zip, 10);
    const cleanNh = sanitizeText(neighborhoodName, 80);
    if (!cleanZip || !cleanNh) return;
    const db = this.getNeighborhoodsDatabase();
    if (db[cleanZip]) {
      if (!db[cleanZip].neighborhoods.includes(cleanNh)) {
        db[cleanZip].neighborhoods.push(cleanNh);
      }
    } else {
      db[cleanZip] = {
        zip: cleanZip,
        areaName: areaName ? sanitizeText(areaName, 80) : `Community Area (${cleanZip})`,
        neighborhoods: [cleanNh],
      };
    }
    this.setStoredData(STORAGE_KEYS.NEIGHBORHOODS, db);
  }

  public static getAllApprovedNeighborhoods(): { neighborhood: string; zip: string; area: string }[] {
    const db = this.getNeighborhoodsDatabase();
    const result: { neighborhood: string; zip: string; area: string }[] = [];
    Object.values(db).forEach((entry) => {
      entry.neighborhoods.forEach((nh) => {
        result.push({
          neighborhood: nh,
          zip: entry.zip,
          area: entry.areaName,
        });
      });
    });
    return result;
  }

  public static getNeighborhoodProposals(): NeighborhoodProposal[] {
    return this.getStoredData<NeighborhoodProposal[]>(
      STORAGE_KEYS.PROPOSALS,
      INITIAL_NEIGHBORHOOD_PROPOSALS
    );
  }

  public static submitNeighborhoodProposal(params: {
    zipCode: string;
    neighborhoodName: string;
    areaName?: string;
    requesterName: string;
    requesterEmail?: string;
    notes?: string;
  }): NeighborhoodProposal {
    const current = this.getNeighborhoodProposals();
    const cleanZip = sanitizeText(params.zipCode, 10);
    const cleanNh = sanitizeText(params.neighborhoodName, 80);
    const cleanArea = sanitizeText(params.areaName || '', 100);
    const cleanReqName = sanitizeText(params.requesterName, 80);
    const cleanEmail = sanitizeText(params.requesterEmail || '', 120);
    const cleanNotes = sanitizeText(params.notes || '', 500);

    const newProposal: NeighborhoodProposal = {
      id: `prop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      zipCode: cleanZip,
      neighborhoodName: cleanNh,
      areaName: cleanArea || `Austin Area (${cleanZip})`,
      requesterName: cleanReqName || CURRENT_USER.name,
      requesterEmail: cleanEmail || 'neighbor@austin.local',
      notes: cleanNotes,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    const updated = [newProposal, ...current];
    this.setStoredData(STORAGE_KEYS.PROPOSALS, updated);
    return newProposal;
  }

  public static approveNeighborhoodProposal(
    proposalId: string,
    adminName: string = 'Community Admin'
  ): { success: boolean; proposal?: NeighborhoodProposal } {
    const proposals = this.getNeighborhoodProposals();
    let targetProposal: NeighborhoodProposal | undefined;

    const updatedProposals = proposals.map((p) => {
      if (p.id === proposalId) {
        targetProposal = {
          ...p,
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminName,
        };
        return targetProposal;
      }
      return p;
    });

    if (!targetProposal) return { success: false };

    this.setStoredData(STORAGE_KEYS.PROPOSALS, updatedProposals);

    // Add neighborhood to the active database for that zip code
    const db = this.getNeighborhoodsDatabase();
    const zip = targetProposal.zipCode;
    const nhName = targetProposal.neighborhoodName;

    if (db[zip]) {
      if (!db[zip].neighborhoods.includes(nhName)) {
        db[zip] = {
          ...db[zip],
          neighborhoods: [...db[zip].neighborhoods, nhName].sort(),
        };
      }
    } else {
      db[zip] = {
        zip,
        areaName: targetProposal.areaName || `Austin Area (${zip})`,
        neighborhoods: [nhName],
      };
    }

    this.setStoredData(STORAGE_KEYS.NEIGHBORHOODS, db);
    return { success: true, proposal: targetProposal };
  }

  public static rejectNeighborhoodProposal(
    proposalId: string,
    reason: string = 'Out of community coverage or duplicate entry',
    adminName: string = 'Community Admin'
  ): { success: boolean; proposal?: NeighborhoodProposal } {
    const proposals = this.getNeighborhoodProposals();
    let targetProposal: NeighborhoodProposal | undefined;

    const updated = proposals.map((p) => {
      if (p.id === proposalId) {
        targetProposal = {
          ...p,
          status: 'rejected',
          rejectionReason: reason,
          reviewedAt: new Date().toISOString(),
          reviewedBy: adminName,
        };
        return targetProposal;
      }
      return p;
    });

    if (!targetProposal) return { success: false };

    this.setStoredData(STORAGE_KEYS.PROPOSALS, updated);
    return { success: true, proposal: targetProposal };
  }

  // --- USER LOCATION PERSISTENCE ---

  public static getUserLocation(): { neighborhood: string; zipCode: string } {
    const active = AuthService.getCurrentUser();
    if (active && active.neighborhood && active.zipCode) {
      return {
        neighborhood: active.neighborhood,
        zipCode: active.zipCode,
      };
    }
    const stored = this.getStoredData<{ neighborhood?: string; zipCode?: string }>(
      STORAGE_KEYS.USER_LOCATION,
      {
        neighborhood: 'Shady Hollow',
        zipCode: '78748',
      }
    );
    return {
      neighborhood: (stored && typeof stored === 'object' && stored.neighborhood) || 'Shady Hollow',
      zipCode: (stored && typeof stored === 'object' && stored.zipCode) || '78748',
    };
  }

  public static setUserLocation(neighborhood: string, zipCode: string): void {
    this.setStoredData(STORAGE_KEYS.USER_LOCATION, { neighborhood, zipCode });
    const active = AuthService.getCurrentUser();
    if (active) {
      AuthService.updateUserProfile(active.id, { neighborhood, zipCode });
    }
  }

  public static resetToDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.ITEMS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.ISO);
    localStorage.removeItem(STORAGE_KEYS.NEIGHBORHOODS);
    localStorage.removeItem(STORAGE_KEYS.PROPOSALS);
    localStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
  }
}
