import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Move, X } from 'lucide-react';

interface DesktopGuardProps {
  children: React.ReactNode;
  enforceDesktop?: boolean;
}

export const DesktopGuard: React.FC<DesktopGuardProps> = ({ children }) => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);
  const [dismissBanner, setDismissBanner] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsNarrowScreen(window.innerWidth < 850);
    };

    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  return (
    <div className="w-full min-w-full overflow-x-auto overflow-y-auto">
      {/* Helpful scroll & pan hint for narrow screens/mobile instead of blocking */}
      {isNarrowScreen && !dismissBanner && (
        <aside
          aria-label="Screen orientation advisory"
          className="bg-amber-950/90 text-amber-200 border-b border-amber-800/80 px-3 py-1.5 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md backdrop-blur-md print:hidden"
        >
          <div className="flex items-center gap-2">
            <Move className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <span>
              የስክሪን እይታ፡ ሙሉውን ገበታ ለማየት ወደ ላይ፣ ወደ ታች እና ወደ ጎን (ግራ/ቀኝ) ያሸብልሉ
            </span>
          </div>
          <button
            onClick={() => setDismissBanner(true)}
            className="p-1 hover:bg-amber-900/60 rounded text-amber-300 transition"
            title="ይህንን ማሳሰቢያ ዝጋ"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main app content with fully enabled horizontal and vertical scrolling */}
      <div className="min-w-full sm:min-w-[700px] md:min-w-[900px] lg:min-w-full">
        {children}
      </div>
    </div>
  );
};

