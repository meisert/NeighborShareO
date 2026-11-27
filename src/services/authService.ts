import { UserAccount } from '../types/index.ts';
import { sanitizeText, isBotSubmission } from '../utils/securityUtils.ts';
import { auth, googleAuthProvider } from '../lib/firebase.ts';
import { signInWithPopup } from 'firebase/auth';
import { DEFAULT_ACCOUNTS } from '../data/mockData.ts';

export { DEFAULT_ACCOUNTS };

const STORAGE_KEYS = {
  USERS: 'neighborshare_auth_users_v2',
  CURRENT_USER: 'neighborshare_auth_current_user_v2',
  RATE_LIMITS: 'neighborshare_auth_rate_limits_v1',
  LAST_AUTH_METHOD: 'neighborshare_last_auth_method_v1',
};

// Brute-force & Credential Stuffing Mitigation Settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 seconds lockout

interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

export class AuthService {
  private static listeners: Array<(user: UserAccount | null) => void> = [];

  private static getStored<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // storage unavailable
    }
    return defaultValue;
  }

  private static setStored<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }

  // --- BRUTE-FORCE RATE LIMITING ---

  private static getRateLimitRecords(): Record<string, RateLimitRecord> {
    return this.getStored<Record<string, RateLimitRecord>>(STORAGE_KEYS.RATE_LIMITS, {});
  }

  private static saveRateLimitRecord(email: string, record: RateLimitRecord): void {
    const records = this.getRateLimitRecords();
    records[email] = record;
    this.setStored(STORAGE_KEYS.RATE_LIMITS, records);
  }

  private static clearRateLimitRecord(email: string): void {
    const records = this.getRateLimitRecords();
    if (records[email]) {
      delete records[email];
      this.setStored(STORAGE_KEYS.RATE_LIMITS, records);
    }
  }

  /**
   * Returns remaining lockout seconds if currently locked out, or 0 if not locked.
   */
  public static getLockoutRemainingSeconds(email: string): number {
    if (!email) return 0;
    const records = this.getRateLimitRecords();
    const cleanEmail = email.trim().toLowerCase();
    const record = records[cleanEmail];
    if (!record || !record.lockedUntil) return 0;

    const remainingMs = record.lockedUntil - Date.now();
    return remainingMs > 0 ? Math.ceil(remainingMs / 1000) : 0;
  }

  public static getAllUsers(): UserAccount[] {
    return this.getStored<UserAccount[]>(STORAGE_KEYS.USERS, DEFAULT_ACCOUNTS);
  }

  public static getCurrentUser(): UserAccount | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  }

  public static setCurrentUser(user: UserAccount | null): void {
    if (user) {
      this.setStored(STORAGE_KEYS.CURRENT_USER, user);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      } catch {
        // ignore
      }
    }
    this.notifyListeners(user);
  }

  public static getLastAuthMethod(): 'google' | 'email' | null {
    return this.getStored<'google' | 'email' | null>(STORAGE_KEYS.LAST_AUTH_METHOD, null);
  }

  public static setLastAuthMethod(method: 'google' | 'email'): void {
    this.setStored(STORAGE_KEYS.LAST_AUTH_METHOD, method);
  }

  /**
   * Attempt Login with Brute-Force Rate Limiting & Honeypot Bot Detection
   */
  public static login(
    email: string,
    password?: string,
    honeypotValue?: string
  ): { 
    success: boolean; 
    user?: UserAccount; 
    error?: string; 
    locked?: boolean;
    remainingSeconds?: number;
  } {
    // 1. Bot Honeypot Check
    if (isBotSubmission(honeypotValue)) {
      return {
        success: false,
        error: 'Automated submission rejected.',
      };
    }

    const cleanEmail = sanitizeText(email).toLowerCase();
    const cleanPass = password?.trim() || '';

    // 2. Brute-Force Lockout Guard
    const lockoutSec = this.getLockoutRemainingSeconds(cleanEmail);
    if (lockoutSec > 0) {
      return {
        success: false,
        locked: true,
        remainingSeconds: lockoutSec,
        error: `Too many failed attempts. Account temporarily locked for security. Try again in ${lockoutSec}s.`,
      };
    }

    const users = this.getAllUsers();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      this.recordFailedAttempt(cleanEmail);
      return {
        success: false,
        error: `No account found for "${email}". Please verify or create an account.`,
      };
    }

    // 3. Password Verification
    if (found.password && cleanPass && found.password !== cleanPass) {
      const record = this.recordFailedAttempt(cleanEmail);
      const remainingAttempts = Math.max(0, MAX_LOGIN_ATTEMPTS - record.attempts);

      if (remainingAttempts === 0) {
        return {
          success: false,
          locked: true,
          remainingSeconds: 60,
          error: 'Account locked for 60 seconds due to 5 consecutive failed attempts (anti-brute-force defense).',
        };
      }

      return {
        success: false,
        error: `Incorrect password. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining before temporary security lockout.`,
      };
    }

    // Success: Clear failed attempts and establish session
    this.clearRateLimitRecord(cleanEmail);
    this.setLastAuthMethod('email');
    this.setCurrentUser(found);

    return {
      success: true,
      user: found,
    };
  }

  private static recordFailedAttempt(email: string): RateLimitRecord {
    const records = this.getRateLimitRecords();
    const current = records[email] || { attempts: 0, lockedUntil: 0 };
    const newAttempts = current.attempts + 1;
    let lockedUntil = 0;

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    }

    const updated: RateLimitRecord = {
      attempts: newAttempts,
      lockedUntil,
    };

    this.saveRateLimitRecord(email, updated);
    return updated;
  }

  /**
   * Create Account with Honeypot Trap, Input Sanitization & Length Guards
   */
  public static signup(params: {
    name: string;
    email: string;
    password: string;
    neighborhood: string;
    zipCode: string;
    bio?: string;
    honeypotValue?: string;
  }): { success: boolean; user?: UserAccount; error?: string } {
    // 1. Bot Honeypot Check
    if (isBotSubmission(params.honeypotValue)) {
      return {
        success: false,
        error: 'Automated submission rejected.',
      };
    }

    // 2. Input Sanitization
    const cleanName = sanitizeText(params.name, 100);
    const cleanEmail = sanitizeText(params.email, 120).toLowerCase();
    const cleanPass = params.password.trim();
    const cleanZip = sanitizeText(params.zipCode, 10);
    const cleanNh = sanitizeText(params.neighborhood, 80);
    const cleanBio = sanitizeText(params.bio || '', 300);

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'Please enter a valid full name.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (!cleanPass || cleanPass.length < 4) {
      return { success: false, error: 'Password should be at least 4 characters.' };
    }
    if (!cleanZip) {
      return { success: false, error: 'Please select a valid zip code.' };
    }
    if (!cleanNh) {
      return { success: false, error: 'Please select your local neighborhood.' };
    }

    const users = this.getAllUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: `An account with ${cleanEmail} already exists. Please log in instead.`,
      };
    }

    // Generate Initials Avatar safely
    const parts = cleanName.split(' ').filter(Boolean);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : cleanName.slice(0, 2).toUpperCase() || 'NB';

    const newUser: UserAccount = {
      id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      neighborhood: cleanNh,
      zipCode: cleanZip,
      avatar: initials,
      trustScore: 100,
      totalLends: 0,
      isVerifiedNeighbor: true,
      isAdmin: false,
      isDemo: false, // Strictly REAL account
      bio: cleanBio || `Neighbor in ${cleanNh} (${cleanZip})`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newUser, ...users];
    this.setStored(STORAGE_KEYS.USERS, updated);
    this.setLastAuthMethod('email');
    this.setCurrentUser(newUser);

    // Sync to Cloud SQL backend
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch((err) => console.error('Cloud SQL user sync error:', err));

    return {
      success: true,
      user: newUser,
    };
  }

  /**
   * Google Sign-In with Firebase Popup & Cloud SQL Sync
   */
  public static async loginWithGoogle(defaultNeighborhood?: string, defaultZip?: string): Promise<{
    success: boolean;
    user?: UserAccount;
    error?: string;
  }> {
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      const name = firebaseUser.displayName || 'Google Neighbor';
      const email = firebaseUser.email || '';
      const parts = name.split(' ').filter(Boolean);
      const initials = parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase() || 'GN';

      const existingUsers = this.getAllUsers();
      let account = existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!account) {
        account = {
          id: firebaseUser.uid,
          name,
          email,
          neighborhood: defaultNeighborhood || 'Shady Hollow',
          zipCode: defaultZip || '78748',
          avatar: initials,
          trustScore: 100,
          totalLends: 0,
          isVerifiedNeighbor: true,
          isAdmin: false,
          isDemo: false, // Real Google account
          authProvider: 'google',
          bio: `Verified neighbor in ${defaultNeighborhood || 'Austin'}`,
          createdAt: new Date().toISOString(),
        };
        this.setStored(STORAGE_KEYS.USERS, [account, ...existingUsers]);
      } else {
        account = {
          ...account,
          authProvider: 'google',
        };
      }

      this.setLastAuthMethod('google');
      this.setCurrentUser(account);

      // Sync to Cloud SQL
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(account),
      }).catch((err) => console.warn('Cloud SQL user sync notification:', err));

      return { success: true, user: account };
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      const code = error?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return { success: false, error: 'Sign-in window closed. Click "Continue with Google" to try again.' };
      }
      if (code === 'auth/popup-blocked') {
        return { success: false, error: 'Popup was blocked by your browser. Please allow popups for Google Sign-In and retry.' };
      }
      if (code === 'auth/unauthorized-domain') {
        return { success: false, error: 'This domain is not yet authorized in Firebase Auth. Add your app domain in Firebase Console.' };
      }
      return { success: false, error: error.message || 'Google Sign-In failed' };
    }
  }

  public static logout(): void {
    this.setCurrentUser(null);
  }

  public static updateUserProfile(
    userId: string,
    updates: Partial<UserAccount>
  ): UserAccount | null {
    const users = this.getAllUsers();
    let updatedUser: UserAccount | null = null;

    const newUsers = users.map((u) => {
      if (u.id === userId) {
        const cleanUpdates: Partial<UserAccount> = { ...updates };
        if (updates.name) cleanUpdates.name = sanitizeText(updates.name, 100);
        if (updates.bio) cleanUpdates.bio = sanitizeText(updates.bio, 300);
        if (updates.neighborhood) cleanUpdates.neighborhood = sanitizeText(updates.neighborhood, 80);
        if (updates.zipCode) cleanUpdates.zipCode = sanitizeText(updates.zipCode, 10);

        updatedUser = { ...u, ...cleanUpdates };
        return updatedUser;
      }
      return u;
    });

    if (updatedUser) {
      this.setStored(STORAGE_KEYS.USERS, newUsers);
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(updatedUser);
      }
    }

    return updatedUser;
  }

  public static subscribe(callback: (user: UserAccount | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private static notifyListeners(user: UserAccount | null): void {
    this.listeners.forEach((listener) => {
      try {
        listener(user);
      } catch {
        // ignore
      }
    });
  }
}
