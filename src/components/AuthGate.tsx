import React from 'react';
import { 
  Lock, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  HeartHandshake, 
  Package, 
  Sparkles,
  MapPin
} from 'lucide-react';
import { DEFAULT_ACCOUNTS, AuthService } from '../services/authService';
import { UserAccount } from '../types';

interface AuthGateProps {
  title: string;
  description: string;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onGoogleSignIn?: () => void;
  onQuickDemoLogin?: (user: UserAccount) => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  title,
  description,
  onOpenLogin,
  onOpenSignup,
  onGoogleSignIn,
  onQuickDemoLogin,
}) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 sm:p-10 text-white relative">
          <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>Neighbor Login Required</span>
          </div>

          <div className="max-w-xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-bold">
              <Package className="w-6 h-6 text-emerald-400" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        {/* Benefits & Actions */}
        <div className="p-8 sm:p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Verified Neighbors</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Connect exclusively with verified residents in your zip code and nearby subdivisions.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Zero-Fee Peer Sharing</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Borrow power tools, lawn aerators, ladders, and party gear without buying new.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900">Porch Handoffs</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Coordinate pickup dates and flexible porch drop-offs with chat coordination.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onGoogleSignIn && (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenSignup}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
            </button>

            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-slate-800 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-all border border-slate-200 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-slate-600" />
              <span>Log In</span>
            </button>
          </div>

          {/* 1-Click Quick Demo Sign-In */}
          {onQuickDemoLogin && (
            <div className="pt-6 border-t border-slate-100">
              <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Or quickly test with a demo account:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {DEFAULT_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => onQuickDemoLogin(acc)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">
                      {acc.avatar}
                    </span>
                    <span>{acc.name}</span>
                    <span className="text-[10px] text-slate-400">({acc.neighborhood})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
