import React, { useState, useEffect } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  MapPin, 
  Lock, 
  Mail, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { AuthService, DEFAULT_ACCOUNTS } from '../services/authService';
import { UserAccount } from '../types';
import { AUSTIN_ZIP_DATA } from '../data/austinZipData';
import { NeighborShareService } from '../services/neighborShareService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  contextReason?: string;
  onOpenTerms?: () => void;
  onRequestNewNeighborhood?: (zipCode: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
  contextReason,
  onOpenTerms,
  onRequestNewNeighborhood,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  
  // Bot Honeypot Trap State (Invisible to real users, catches bots)
  const [botHoneypot, setBotHoneypot] = useState('');

  // Google SSO Preferred Option State
  const [rememberGoogleSso, setRememberGoogleSso] = useState<boolean>(() => {
    try {
      return localStorage.getItem('neighborshare_prefer_google_sso') === 'true';
    } catch {
      return false;
    }
  });
  const lastAuthMethod = AuthService.getLastAuthMethod();
  
  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupZip, setSignupZip] = useState('78748');
  const [signupNeighborhood, setSignupNeighborhood] = useState('Shady Hollow');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available neighborhoods for current selected zip
  const currentZipData = AUSTIN_ZIP_DATA[signupZip];
  const availableNeighborhoods = currentZipData ? currentZipData.neighborhoods : [];

  // Countdown timer for brute-force lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          setLoginError('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setLoginError('');
      setSignupError('');
      setIsSubmitting(false);
      setBotHoneypot('');
      
      // Check if current email is locked
      if (loginEmail) {
        const remaining = AuthService.getLockoutRemainingSeconds(loginEmail);
        setLockoutSeconds(remaining);
      }
      
      // Auto-set default neighborhood if needed
      if (availableNeighborhoods.length > 0 && !availableNeighborhoods.includes(signupNeighborhood)) {
        setSignupNeighborhood(availableNeighborhoods[0]);
      }
    }
  }, [isOpen, initialMode]);

  // Update neighborhood when zip changes
  const handleZipChange = (newZip: string) => {
    setSignupZip(newZip);
    const data = AUSTIN_ZIP_DATA[newZip];
    if (data && data.neighborhoods.length > 0) {
      setSignupNeighborhood(data.neighborhoods[0]);
    } else {
      setSignupNeighborhood('');
    }
  };

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (lockoutSeconds > 0) {
      setLoginError(`Account temporarily locked to protect against brute-force attacks. Please wait ${lockoutSeconds} seconds.`);
      return;
    }

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const res = AuthService.login(loginEmail, loginPassword, botHoneypot);
    setIsSubmitting(false);

    if (res.success && res.user) {
      setLockoutSeconds(0);
      onSuccess(res.user);
      onClose();
    } else {
      if (res.locked && res.remainingSeconds) {
        setLockoutSeconds(res.remainingSeconds);
      }
      setLoginError(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!agreeToTerms) {
      setSignupError('Please agree to the Member Terms of Service & Liability Disclaimer to continue.');
      return;
    }

    setIsSubmitting(true);
    const res = AuthService.signup({
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      zipCode: signupZip,
      neighborhood: signupNeighborhood,
      honeypotValue: botHoneypot,
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      // Also update persisted location in NeighborShareService
      NeighborShareService.setUserLocation(res.user.neighborhood, res.user.zipCode);
      onSuccess(res.user);
      onClose();
    } else {
      setSignupError(res.error || 'Failed to create account.');
    }
  };

  const handleQuickDemoLogin = (user: UserAccount) => {
    AuthService.setCurrentUser(user);
    NeighborShareService.setUserLocation(user.neighborhood, user.zipCode);
    onSuccess(user);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setLoginError('');
    setSignupError('');
    try {
      const res = await AuthService.loginWithGoogle(signupNeighborhood, signupZip);
      setIsSubmitting(false);
      if (res.success && res.user) {
        NeighborShareService.setUserLocation(res.user.neighborhood, res.user.zipCode);
        onSuccess(res.user);
        onClose();
      } else {
        if (mode === 'login') {
          setLoginError(res.error || 'Google Sign-In failed.');
        } else {
          setSignupError(res.error || 'Google Sign-In failed.');
        }
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setLoginError(err?.message || 'Google Sign-In encounter an unexpected issue.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold">
              {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {mode === 'login' ? 'Log in to NeighborShare' : 'Create Neighbor Account'}
              </h2>
              <p className="text-[11px] text-slate-300">
                {mode === 'login' 
                  ? 'Access borrowing, garage lending, and neighbor chat' 
                  : 'Join your local Austin neighborhood sharing network'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Optional Context Callout */}
        {contextReason && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-900 font-medium">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{contextReason}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'login'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setSignupError('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              mode === 'signup'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Free Account
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Prominent Google SSO Card */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Single Sign-On (SSO)
              </span>
              {(lastAuthMethod === 'google' || rememberGoogleSso) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  <span>Preferred on this device</span>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100/80 active:bg-slate-200/60 text-slate-800 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isSubmitting ? 'Connecting Google Account...' : (mode === 'login' ? 'Continue with Google Account' : 'Sign up with Google Account')}</span>
            </button>

            <label className="flex items-center gap-2 cursor-pointer pt-0.5 select-none">
              <input
                type="checkbox"
                checked={rememberGoogleSso}
                onChange={(e) => {
                  setRememberGoogleSso(e.target.checked);
                  try {
                    localStorage.setItem('neighborshare_prefer_google_sso', e.target.checked ? 'true' : 'false');
                  } catch {}
                }}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span className="text-[11px] text-slate-600">
                Remember Google SSO as my preferred login method
              </span>
            </label>
          </div>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider relative">
              or with email & password
            </span>
          </div>

          {mode === 'login' ? (
            /* --- LOGIN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@austin.local"
                    className="w-full text-xs sm:text-sm text-slate-900 pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-slate-400">Demo accounts: password123</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs sm:text-sm text-slate-900 pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Bot Honeypot Trap (Invisible to humans) */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="user_website_hp"
                  tabIndex={-1}
                  value={botHoneypot}
                  onChange={(e) => setBotHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              {lockoutSeconds > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2.5 text-xs text-amber-950 animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold">Anti-Brute-Force Lockout Active</div>
                    <div className="text-[11px] text-amber-900/90">
                      Login cooldown in effect. Try again in <strong className="tabular-nums font-bold">{lockoutSeconds}s</strong>.
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || lockoutSeconds > 0}
                className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                <span>{lockoutSeconds > 0 ? `Locked (${lockoutSeconds}s cooldown)` : 'Log In'}</span>
              </button>

              {/* Quick Demo Login Preset Buttons */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1-Click Quick Demo Sign-In:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEFAULT_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(acc)}
                      className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/60 text-left transition-all group"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        {acc.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-800 truncate flex items-center gap-1">
                          <span>{acc.name}</span>
                          {acc.isAdmin && (
                            <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {acc.neighborhood} ({acc.zipCode})
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            /* --- CREATE ACCOUNT FORM --- */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{signupError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full text-xs sm:text-sm text-slate-900 pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="w-full text-xs text-slate-900 pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full text-xs text-slate-900 pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location Selectors: Austin Zip and Local Neighborhood */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Your Austin Neighborhood Profile</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">Austin Zip Code</label>
                    <select
                      value={signupZip}
                      onChange={(e) => handleZipChange(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {Object.keys(AUSTIN_ZIP_DATA).map((zip) => (
                        <option key={zip} value={zip}>
                          {zip} - {AUSTIN_ZIP_DATA[zip].areaName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-600">Local Neighborhood</label>
                    <select
                      value={signupNeighborhood}
                      onChange={(e) => setSignupNeighborhood(e.target.value)}
                      className="w-full text-xs font-semibold text-slate-900 px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableNeighborhoods.map((nh) => (
                        <option key={nh} value={nh}>
                          {nh}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {onRequestNewNeighborhood && (
                  <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Don't see your specific neighborhood?</span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestNewNeighborhood(signupZip);
                      }}
                      className="text-emerald-700 hover:text-emerald-800 font-bold underline"
                    >
                      Request to Add It
                    </button>
                  </div>
                )}
              </div>

              {/* Terms of Service & Liability Disclaimer Agreement */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1.5">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-amber-950 font-medium">
                  <input
                    type="checkbox"
                    required
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    className="mt-0.5 rounded border-amber-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
                  />
                  <span className="leading-relaxed">
                    I agree to the <strong className="text-amber-900 font-bold">NeighborShare Terms of Service</strong>: NeighborShare is solely a communication platform and is <strong>not responsible for the borrower's or lender's items</strong>, item condition, or safety handoffs.
                  </span>
                </label>
                {onOpenTerms && (
                  <div className="pl-6.5 text-[11px]">
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="font-bold text-emerald-700 hover:text-emerald-800 underline inline-flex items-center gap-1"
                    >
                      Read Complete Terms & Disclaimer Policy
                    </button>
                  </div>
                )}
              </div>

              {/* Bot Honeypot Trap (Invisible to humans) */}
              <div style={{ display: 'none', position: 'absolute', left: '-9999px' }} aria-hidden="true">
                <input
                  type="text"
                  name="signup_website_hp"
                  tabIndex={-1}
                  value={botHoneypot}
                  onChange={(e) => setBotHoneypot(e.target.value)}
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !agreeToTerms}
                className="w-full py-2.5 px-4 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Neighbor Account</span>
              </button>
            </form>
          )}
        </div>

        {/* Footer switch prompt & Security Assurance */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-600 space-y-1.5">
          {mode === 'login' ? (
            <div>
              New neighbor in the area?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupError('');
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Create an account
              </button>
            </div>
          ) : (
            <div>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setLoginError('');
                }}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Log in here
              </button>
            </div>
          )}

          <div className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5 pt-1 border-t border-slate-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Anti-brute-force rate limits, bot honeypot, & input sanitization active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
