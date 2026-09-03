import React from 'react';
import { X, Printer, Award, CheckCircle2, Shield } from 'lucide-react';
import { User, CommissionSettings } from '../types';
import { toEthiopianDate } from '../lib/ethiopianCalendar';

interface CertificateModalProps {
  user: User;
  settings: CommissionSettings;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  user,
  settings,
  onClose
}) => {
  const ethDate = toEthiopianDate(new Date());

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="certificate-modal-overlay" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        
        {/* Top Actions */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Award className="w-5 h-5 text-amber-400" />
            <span>የሰራተኛ የብቃትና የታታሪነት የምስክር ወረቀት (Certificate)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-print-certificate"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ሰርትፊኬቱን ፕሪንት አድርግ (Print)</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Canvas */}
        <div
          id="printable-certificate"
          className="bg-stone-50 text-slate-900 p-8 sm:p-12 rounded-xl shadow-inner border-8 border-double border-amber-600 relative overflow-hidden font-serif"
        >
          {/* Ornate corner marks */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-700" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-700" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-700" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-700" />

          {/* Header Banner */}
          <div className="text-center relative z-10">
            <img
              src={settings.logoUrl}
              alt="የፖሊስ ኮሚሽን አርማ"
              className="w-24 h-24 object-contain mx-auto mb-3"
              referrerPolicy="no-referrer"
            />
            <div className="text-xs font-bold text-amber-900 tracking-widest uppercase">
              በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {settings.commissionName}
            </h1>
            <div className="text-sm font-bold text-slate-700 mt-0.5">
              {settings.departmentName}
            </div>

            {/* Ribbon Line */}
            <div className="flex items-center justify-center gap-2 my-4">
              <div className="h-0.5 w-16 bg-gradient-to-r from-transparent to-amber-700" />
              <div className="w-2.5 h-2.5 bg-amber-600 rotate-45" />
              <div className="h-0.5 w-16 bg-gradient-to-l from-transparent to-amber-700" />
            </div>

            <div className="inline-block px-6 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-sm tracking-wide border border-amber-300">
              የታታሪነት እና የላቀ የስራ አፈፃፀም የምስክር ወረቀት
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="mt-8 text-center max-w-2xl mx-auto space-y-4 text-slate-800">
            <p className="text-sm italic">
              ይህ የምስክር ወረቀት በቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የሰዓት ቁጥጥር እና የዲሲፕሊን መመሪያ መሰረት ለተመዘገቡት፡
            </p>

            <div className="py-2">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 underline decoration-amber-600 decoration-2 underline-offset-8">
                {user.rank} {user.fullName}
              </div>
              <div className="text-xs text-slate-600 mt-2 font-sans font-medium">
                የስራ ክፍል፡ {user.department} | የስራ መደብ፡ {user.position} | መለያ ባጅ፡ {user.badgeNumber}
              </div>
            </div>

            <p className="text-sm leading-relaxed text-slate-700">
              በስራ ሰዓት አጠቃቀም፣ በሰዓቱ መግባትና መውጣት፣ በታማኝነት እና በላቀ የስራ ዲሲፕሊን ባሳዩት የላቀ ተሳትፎ እና ቁርጠኝነት
              አማካይ የውጤት ነጥብ <strong className="text-amber-900 text-lg font-black">{user.efficiencyScore ?? 92}/100</strong> በማምጣት
              የ <strong className="text-emerald-900 text-lg font-black">"{user.rankTier ?? 'እጅግ የላቀ (A+)'}"</strong> ደረጃ
              አሸናፊ ሆነው ስለተገኙ ይህ የክብርና የታታሪነት የምስክር ወረቀት ተበርክቶላቸዋል።
            </p>
          </div>

          {/* Scores & Statistics Box */}
          <div className="mt-8 max-w-lg mx-auto grid grid-cols-3 gap-3 text-center bg-amber-50/80 p-3 rounded-xl border border-amber-200">
            <div>
              <div className="text-[10px] text-slate-600 font-sans uppercase">የስራ ውጤት</div>
              <div className="text-lg font-black text-slate-900">{user.efficiencyScore ?? 92}%</div>
            </div>
            <div className="border-x border-amber-300">
              <div className="text-[10px] text-slate-600 font-sans uppercase">የተሰጠው ደረጃ</div>
              <div className="text-xs font-black text-emerald-800 mt-1">{user.rankTier ?? 'እጅግ የላቀ'}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-600 font-sans uppercase">የሰዓት አክባሪነት</div>
              <div className="text-lg font-black text-amber-900">100%</div>
            </div>
          </div>

          {/* Footer Signatures and Official Seal */}
          <div className="mt-12 pt-6 border-t border-amber-200 flex items-end justify-between px-4 sm:px-8">
            <div className="text-center">
              <div className="w-36 border-b-2 border-slate-900 mb-1" />
              <div className="text-xs font-bold text-slate-900">የክፍሉ ኃላፊ ፊርማ</div>
              <div className="text-[10px] text-slate-600 font-sans">የቴክኖሎጂ ማስፋፊያ መምሪያ</div>
            </div>

            {/* Official Seal Mockup */}
            <div className="w-24 h-24 rounded-full border-4 border-amber-700/80 flex flex-col items-center justify-center p-1 text-center rotate-[-6deg] bg-amber-100/30">
              <div className="text-[7px] font-bold text-amber-900 uppercase tracking-tighter">
                ቤ/ጉ/ክ/ፖ/ኮ ዋና ማህተም
              </div>
              <Shield className="w-6 h-6 text-amber-800 my-0.5" />
              <div className="text-[8px] font-black text-amber-900">ጸድቋል</div>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-slate-900 font-sans mb-1">{ethDate.formatted}</div>
              <div className="w-36 border-b-2 border-slate-900 mb-1" />
              <div className="text-xs font-bold text-slate-900">የተሰጠበት ቀን</div>
              <div className="text-[10px] text-slate-600 font-sans">አሶሳ፣ ቤንሻንጉል ጉሙዝ</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
