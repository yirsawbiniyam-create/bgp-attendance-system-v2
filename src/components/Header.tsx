import React, { useState, useEffect } from 'react';
import { Shield, Clock, MapPin, LogOut, User as UserIcon, Calendar, CheckCircle, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import { User, CommissionSettings } from '../types';
import { toEthiopianDate, toEthiopianTime, getSlotStatus } from '../lib/ethiopianCalendar';

interface HeaderProps {
  currentUser: User | null;
  settings: CommissionSettings;
  onLogout: () => void;
  onBack?: () => void;
  onOpenDocumentation?: () => void;
  geofenceStatus: {
    withinFence: boolean;
    distanceMeters: number;
    error?: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  settings,
  onLogout,
  onBack,
  onOpenDocumentation,
  geofenceStatus
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ethDate = toEthiopianDate(currentTime);
  const ethTime = toEthiopianTime(currentTime);
  const slotStatus = getSlotStatus(currentTime);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (currentUser) {
      onLogout();
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Logo, Back Button & Commission Branding */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Prominent Back / Return Button */}
            {currentUser && (
              <button
                id="btn-header-back"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 shadow-sm transition cursor-pointer"
                title="ወደ ኋላ ተመለስ (Back)"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">ተመለስ</span>
              </button>
            )}

            <div className="relative group shrink-0">
              <img
                src={settings.logoUrl}
                alt="የፖሊስ ኮሚሽን አርማ"
                className="w-11 h-11 sm:w-13 sm:h-13 object-contain rounded-xl p-1 bg-slate-800/80 border border-slate-700 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="ሲስተሙ ንቁ ነው" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider">
                  ቤ/ጉ/ክ/ፖ/ኮ
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                  {settings.departmentName}
                </span>
              </div>
              <h1 className="text-sm sm:text-lg font-bold text-white tracking-tight leading-tight truncate">
                {settings.commissionName} የሰዓት ቁጥጥር ሲስተም
              </h1>
            </div>
          </div>


          {/* Center: Live Ethiopian Date, Time & Active Slot Window */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/70 py-1.5 px-4 rounded-xl border border-slate-700/60 shadow-inner">
            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
              <Calendar className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-medium">የኢትዮጵያ ቀን</div>
                <div className="text-xs font-semibold text-slate-200">{ethDate.formatted}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-r border-slate-700 pr-4">
              <Clock className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div className="text-left">
                <div className="text-[11px] text-slate-400 font-medium">የኢትዮጵያ ሰዓት</div>
                <div className="text-sm font-bold text-emerald-300 tracking-wide">{ethTime.formatted}</div>
              </div>
            </div>

            {/* Current Active Window Indicator */}
            <div className="flex items-center gap-2">
              {slotStatus.activeSlot ? (
                <div className="flex items-center gap-1.5 text-xs bg-emerald-900/60 text-emerald-200 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-semibold">{slotStatus.activeSlot.name} ክፍት ነው</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs bg-slate-700/60 text-slate-300 border border-slate-600/50 px-2.5 py-1 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>ቀጣይ፡ {slotStatus.nextSlot ? slotStatus.nextSlot.name : 'የተዘጋ'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: GPS Location Status, Documentation Button & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Documentation / Manual Button */}
            {onOpenDocumentation && (
              <button
                id="btn-header-manual"
                onClick={onOpenDocumentation}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 active:bg-amber-500 active:text-slate-950 text-indigo-200 hover:text-white border border-indigo-700/60 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                title="የሲስተም አጠቃቀም ሙሉ መመሪያ ሰነድ (User Manual)"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">የሲስተም መመሪያ</span>
              </button>
            )}

            {/* Geofence Status Badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-emerald-950/60 text-emerald-300 border-emerald-800"
              title="የኪሎሜትር እና የርቀት ገደብ ተነስቷል፤ ሲስተሙ በየትኛውም ቦታ ክፍት ነው"
            >
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>የኪሎሜትር ገደብ፡ ክፍት ነው</span>
            </div>

            {/* User Profile Card */}
            {currentUser && (
              <div className="flex items-center gap-2.5 bg-slate-800 py-1.5 px-3 rounded-xl border border-slate-700">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/30">
                  {currentUser.role === 'admin' ? 'አድሚን' : 'ፖሊስ'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-white leading-none">
                    {currentUser.fullName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {currentUser.rank}
                  </div>
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="ml-2 p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="ውጣ (Logout)"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
