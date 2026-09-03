import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, ShieldAlert, Ban, AlertOctagon } from 'lucide-react';
import { DEFAULT_BG_POLICE_LOGO } from '../lib/firebase';

interface DesktopGuardProps {
  children: React.ReactNode;
  enforceDesktop?: boolean;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({ children, enforceDesktop = true }) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      // 1. User agent check for mobile devices
      const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
      const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);

      // 2. Touch screen + narrow width check
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = width < 850;

      // Restrict if mobile user agent OR narrow mobile screen
      if (isMobileUA || (isNarrow && hasTouch) || width < 768) {
        setIsMobileDevice(true);
      } else {
        setIsMobileDevice(false);
      }
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Strict Mobile Blocking Screen
  if (enforceDesktop && isMobileDevice) {
    return (
      <main
        id="mobile-restricted-screen"
        className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 selection:bg-red-500 selection:text-white"
      >
        <div className="max-w-md w-full bg-slate-900 border-2 border-red-600/70 rounded-3xl p-6 sm:p-8 shadow-2xl text-center relative overflow-hidden">
          
          {/* Top warning ribbon */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 animate-pulse" />

          {/* Police Emblem & Restricted Badge */}
          <div className="relative inline-block mb-4">
            <img
              src={DEFAULT_BG_POLICE_LOGO}
              alt="የፖሊስ ኮሚሽን አርማ"
              className="w-20 h-20 object-contain mx-auto rounded-2xl p-1 bg-slate-800 border border-slate-700 shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-slate-900 shadow-lg">
              <Ban className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Header Title */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-bold mb-3 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            የስልክ ተጠቃሚ ገደብ (Mobile Access Prohibited)
          </div>

          <h1 className="text-lg sm:text-xl font-black text-white mb-2 tracking-tight">
            ይህ ሲስተም በሞባይል ስልክ ላይ አይከፍትም!
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-5">
            የቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የቴክኖሎጂ ማስፋፊያ የሰዓት ቁጥጥር ሲስተም፤ ለስራ ቦታ ደህንነት፣ ለትክክለኛ አካባቢ ቁጥጥር እና ለኦፊሴላዊ ሰነድ ጥበቃ በኮምፒውተር (Desktop / Laptop) ላይ ብቻ እንዲሰራ ተገድቧል።
          </p>

          {/* Visual comparison illustration */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/60 flex flex-col items-center justify-center">
              <div className="relative mb-1.5">
                <Smartphone className="w-8 h-8 text-red-400" />
                <Ban className="w-5 h-5 text-red-500 absolute -top-1 -right-2" />
              </div>
              <span className="text-[11px] font-bold text-red-300">ስልክ (Phone)</span>
              <span className="text-[10px] text-red-400/80">አይፈቀድም (Blocked)</span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col items-center justify-center">
              <Monitor className="w-8 h-8 text-emerald-400 mb-1.5" />
              <span className="text-[11px] font-bold text-emerald-300">ኮምፒውተር (Desktop)</span>
              <span className="text-[10px] text-emerald-400/80">ይፈቀዳል (Allowed)</span>
            </div>
          </div>

          {/* Instruction Box */}
          <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 text-left text-xs text-slate-300 space-y-2 mb-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span>የአሰራር መመሪያ፡</span>
            </div>
            <p className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>እባክዎን በኮሚሽኑ ቢሮ የተመደበልዎትን ዴስክቶፕ ወይም ላፕቶፕ ኮምፒውተር ይጠቀሙ።</span>
            </p>
            <p className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">•</span>
              <span>በሞባይል ስልክ የሰዓት መግቢያና መውጫ መመዝገብ በጥብቅ የተከለከለ ነው።</span>
            </p>
          </div>

          {/* Detected Device Info */}
          <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <span>የተገኘው ስክሪን መጠን፡ {screenWidth}px</span>
            <span>•</span>
            <span className="text-red-400 font-semibold">መዳረሻው ተዘግቷል</span>
          </div>

        </div>
      </main>
    );
  }

  // Desktop / Laptop: Full Application with smooth horizontal and vertical navigation
  return (
    <div className="w-full min-w-full overflow-x-auto overflow-y-auto">
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
};


