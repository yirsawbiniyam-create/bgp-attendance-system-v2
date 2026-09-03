import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Navigation } from 'lucide-react';

interface NavigationScrollControlsProps {
  onBack?: () => void;
  canGoBack?: boolean;
}

export const NavigationScrollControls: React.FC<NavigationScrollControlsProps> = ({
  onBack,
  canGoBack = true
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight || document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const handleScrollLeft = () => {
    window.scrollBy({
      left: -350,
      behavior: 'smooth'
    });
  };

  const handleScrollRight = () => {
    window.scrollBy({
      left: 350,
      behavior: 'smooth'
    });
  };

  const handleBackAction = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <div
      id="navigation-scroll-controller"
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 print:hidden select-none"
    >
      {/* Expand/Collapse Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/40 rounded-full shadow-2xl backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition transform active:scale-95"
        title="የመቆጣጠሪያ ቁልፎች (ተመለስ / ወደ ላይ / ወደ ታች / ወደ ጎን)"
      >
        <Navigation className="w-3.5 h-3.5 text-amber-400" />
        <span>{isExpanded ? 'መቆጣጠሪያዎችን ደብቅ' : 'ተመለስ / ማሸብለያ'}</span>
      </button>

      {/* Floating Control Panel */}
      {isExpanded && (
        <div className="bg-slate-900/95 backdrop-blur-md border-2 border-amber-500/50 rounded-2xl p-2 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          
          {/* 1. Back / Return Button */}
          {canGoBack && (
            <button
              id="btn-nav-back"
              onClick={handleBackAction}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer transition active:scale-95 border border-red-500/40"
              title="ወደ ኋላ ተመለስ (Back)"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ተመለስ (Back)</span>
            </button>
          )}

          {/* 2. Vertical Scroll (ወደ ላይ / ወደ ታች) */}
          <div className="flex items-center gap-1.5 justify-between bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              id="btn-scroll-top"
              onClick={handleScrollToTop}
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
              title="ወደ ላይ ውጣ (Scroll to Top)"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>ወደ ላይ</span>
            </button>
            <button
              id="btn-scroll-bottom"
              onClick={handleScrollToBottom}
              className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-[11px] font-bold rounded-lg transition cursor-pointer"
              title="ወደ ታች ውረድ (Scroll to Bottom)"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>ወደ ታች</span>
            </button>
          </div>

          {/* 3. Horizontal Scroll (ወደ ጎን - ግራ / ቀኝ) */}
          <div className="flex items-center gap-1.5 justify-between bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              id="btn-scroll-left"
              onClick={handleScrollLeft}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold rounded-lg transition cursor-pointer"
              title="ወደ ግራ ጎን አሸብልል"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>ወደ ግራ</span>
            </button>
            <span className="text-[10px] text-slate-400 font-semibold px-1">ጎን</span>
            <button
              id="btn-scroll-right"
              onClick={handleScrollRight}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[10px] font-bold rounded-lg transition cursor-pointer"
              title="ወደ ቀኝ ጎን አሸብልል"
            >
              <span>ወደ ቀኝ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
