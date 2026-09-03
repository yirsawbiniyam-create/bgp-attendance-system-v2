import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, AlertTriangle, ShieldCheck } from 'lucide-react';

interface DesktopGuardProps {
  children: React.ReactNode;
  enforceDesktop: boolean;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({ children, enforceDesktop }) => {
  const [isMobileScreen, setIsMobileScreen] = useState(false);
  const [bypassScreenCheck, setBypassScreenCheck] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      // Check if width is below typical desktop workstation (1024px or 800px)
      const isMobile = window.innerWidth < 900;
      setIsMobileScreen(isMobile);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  if (enforceDesktop && isMobileScreen && !bypassScreenCheck) {
    return (
      <div id="desktop-guard-screen" className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border-2 border-amber-500/50 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-20 h-20 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/40">
            <Monitor className="w-10 h-10 text-amber-400" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-semibold mb-4 border border-red-500/30">
            <Smartphone className="w-3.5 h-3.5" /> የስልክ ተጠቃሚ ገደብ (Desktop Only)
          </div>

          <h2 className="text-xl font-bold text-white mb-3">
            ይህ ሲስተም በኮምፒውተር ላይ ብቻ እንዲሰራ የተገደበ ነው!
          </h2>

          <p className="text-slate-300 text-sm leading-relaxed mb-6">
            የቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን ቴክኖሎጂ ማስፋፊያ የሰዓት ቁጥጥር ሲስተም የደህንነትና ትክክለኛ የስራ ቦታ ቁጥጥር ለማድረግ በኮምፒውተር (Desktop/Laptop Workstation) ላይ ብቻ እንዲሰራ ተደርጓል።
          </p>

          <div className="bg-slate-900/80 rounded-xl p-4 mb-6 border border-slate-700 text-left text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>የተጠቃሚ መመሪያ፡</span>
            </div>
            <p>1. እባክዎን የኮሚሽኑን ቢሮ ኮምፒውተር ይጠቀሙ።</p>
            <p>2. ስክሪንዎን በኮምፒውተር ወይም ላፕቶፕ ላይ ሙሉ በሙሉ ዘርግተው ይክፈቱ።</p>
          </div>

          <button
            id="btn-bypass-desktop-check"
            onClick={() => setBypassScreenCheck(true)}
            className="w-full py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-600 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ለሙከራና እይታ በዴስክቶፕ እይታ ቀጥል (Bypass for Preview)
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
