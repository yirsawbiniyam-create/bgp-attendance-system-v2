import React, { useState, useEffect } from 'react';
import { Shield, Clock, MapPin, LogOut, User as UserIcon, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { User, CommissionSettings } from '../types';
import { toEthiopianDate, toEthiopianTime, getSlotStatus } from '../lib/ethiopianCalendar';

interface HeaderProps {
  currentUser: User | null;
  settings: CommissionSettings;
  onLogout: () => void;
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

  return (
    <header id="main-header" className="bg-slate-900 text-white border-b border-slate-800 shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Commission Branding */}
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <img
                src={settings.logoUrl}
                alt="የፖሊስ ኮሚሽን አርማ"
                className="w-13 h-13 object-contain rounded-xl p-1 bg-slate-800/80 border border-slate-700 shadow-md"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="ሲስተሙ ንቁ ነው" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  ቤ/ጉ/ክ/ፖ/ኮ
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {settings.departmentName}
                </span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
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

          {/* Right: GPS Location Status & User Profile */}
          <div className="flex items-center gap-3">
            {/* Geofence Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                geofenceStatus.withinFence
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                  : 'bg-red-950/60 text-red-300 border-red-800'
              }`}
              title={`የኮሚሽኑ ክልል 500 ሜትር ራዲየስ፡ ${geofenceStatus.distanceMeters} ሜትር ርቀት`}
            >
              <MapPin className={`w-3.5 h-3.5 ${geofenceStatus.withinFence ? 'text-emerald-400' : 'text-red-400'}`} />
              <span>
                {geofenceStatus.withinFence ? (
                  <>ኮሚሽን ግቢ ዉስጥ ({geofenceStatus.distanceMeters}m)</>
                ) : (
                  <>ከግቢ ውጪ ({geofenceStatus.distanceMeters}m)</>
                )}
              </span>
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
