import React, { useState } from 'react';
import { Lock, User as UserIcon, AlertCircle, KeyRound } from 'lucide-react';
import { User, CommissionSettings } from '../types';

interface LoginModalProps {
  settings: CommissionSettings;
  users: User[];
  onLoginSuccess: (user: User) => void;
  geofenceStatus?: {
    withinFence: boolean;
    distanceMeters: number;
    error?: string;
  };
}

export const LoginModal: React.FC<LoginModalProps> = ({
  settings,
  users,
  onLoginSuccess
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('እባክዎ ዩሰርኔም እና የይለፍ ቃል (Password) ያስገቡ');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const match = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          (u.password === password.trim() || !u.password)
      );

      if (match) {
        onLoginSuccess(match);
      } else {
        setErrorMsg('የተሳሳተ ዩሰርኔም ወይም የይለፍ ቃል ነው! እባክዎ እንደገና ይሞክሩ።');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div id="login-modal-overlay" className="min-h-[calc(100vh-70px)] bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        
        {/* Top Decorative bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />

        {/* Commission Emblem and Title */}
        <div className="text-center mb-7">
          <div className="relative inline-block mb-3">
            <img
              src={settings.logoUrl}
              alt="የኮሚሽኑ አርማ"
              className="w-24 h-24 object-contain mx-auto rounded-2xl p-1.5 bg-slate-800 border-2 border-amber-500/40 shadow-xl"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-1">
            {settings.commissionName}
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            የቴክኖሎጂ ማስፋፊያ የሰዓት ቁጥጥር ሲስተም
          </h1>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form: Username & Password Only */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ዩሰርኔም (Username)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ዩሰርኔም ያስገቡ"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              የይለፍ ቃል (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="የይለፍ ቃል ያስገቡ"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            id="btn-submit-login"
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            {isLoading ? 'እየተረጋገጠ ነው...' : 'ወደ ሲስተሙ ግባ'}
          </button>
        </form>

      </div>
    </div>
  );
};
