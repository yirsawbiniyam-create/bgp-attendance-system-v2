import React, { useState } from 'react';
import { BookOpen, X, Clock, Shield, Moon, CheckCircle2, AlertTriangle, FileText, Printer, Award, Monitor, UserCheck } from 'lucide-react';
import { CommissionSettings } from '../types';

interface SystemDocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CommissionSettings;
}

export const SystemDocumentationModal: React.FC<SystemDocumentationModalProps> = ({
  isOpen,
  onClose,
  settings
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'regular_slots' | 'duty_shifts' | 'admin_guide' | 'officer_guide'>('overview');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 uppercase">
                  ኦፊሴላዊ መመሪያ ሰነድ
                </span>
                <span className="text-xs text-slate-400">ስሪት 2.5 (Version 2.5)</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {settings.commissionName} - የሲስተም አጠቃቀም እና ሙሉ መመሪያ ሰነድ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="ሰነዱን አትም (Print Manual)"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">አትም (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 border border-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/70 border-b border-slate-800 px-6 py-2 flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" />
            አጠቃላይ መግቢያ
          </button>
          <button
            onClick={() => setActiveTab('regular_slots')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'regular_slots'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            የመደበኛ ስራ የሰዓት ሰሌዳ (5ቱ መስኮቶች)
          </button>
          <button
            onClick={() => setActiveTab('duty_shifts')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'duty_shifts'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            የውሎና አዳር (24 ሰዓት) ተረኝነት እና የግዴታ ሪፖርት
          </button>
          <button
            onClick={() => setActiveTab('officer_guide')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'officer_guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            የሰራተኛ/ኦፊሰር አጠቃቀም
          </button>
          <button
            onClick={() => setActiveTab('admin_guide')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'admin_guide'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            የአስተዳዳሪ (Admin) አጠቃቀም
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed flex-1">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  የሲስተሙ ዋና ዓላማ እና አስፈላጊነት
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  ይህ ዲጂታል የሰዓት መቆጣጠሪያና የተረኝነት ምዝገባ ሲስተም የተዘጋጀው ለ<strong>{settings.commissionName} ({settings.departmentName})</strong> ሲሆን ዋና ዓላማውም የፖሊስ አባላትንና የሲቪል ሰራተኞችን የስራ መግቢያ፣ የሻይ እረፍት፣ የምሳ መልስ፣ የስራ መውጫ እና የውሎና አዳር (24 ሰዓት) ተረኝነት በከፍተኛ ግልጽነትና ፍትሃዊነት በኢትዮጵያ ዘመን አቆጣጠር መቆጣጠር ነው።
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 font-bold">1</div>
                  <h4 className="font-bold text-white text-sm mb-1">የኢትዮጵያ ሰዓትና ቀን</h4>
                  <p className="text-xs text-slate-400">
                    ሲስተሙ 100% በሀገራችን የቀን መቁጠሪያ (መስከረም እስከ ጳጉሜን) እና በኢትዮጵያ ሰዓት አቆጣጠር (ከጠዋቱ 1:00 እስከ ምሽቱ 12:00) ይሰራል
                  </p>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 font-bold">2</div>
                  <h4 className="font-bold text-white text-sm mb-1">የኪሎሜትር ገደብ ክፍት መሆን</h4>
                  <p className="text-xs text-slate-400">
                    የኪሎሜትር (Geofence) ገደቡ ሙሉ በሙሉ የተነሳ ሲሆን ሰራተኞች በማንኛውም ቦታ ሆነው በሰዓቱ ብቻ መመዝገብ ይችላሉ
                  </p>
                </div>
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center mb-2 font-bold">3</div>
                  <h4 className="font-bold text-white text-sm mb-1">የሞባይል ስልክ ገደብ</h4>
                  <p className="text-xs text-slate-400">
                    የመረጃ ደህንነትንና ተዓማኒነትን ለመጠበቅ ሲስተሙ በስልክ ላይ እንዳይከፍት የተከለከለ ሲሆን በዴስክቶፕ ኮምፒውተር ወይም ላፕቶፕ ብቻ ይሰራል
                  </p>
                </div>
              </div>

              <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-800/60 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200">
                  <strong>ዋና የደህንነት መመሪያ፡</strong> እያንዳንዱ ኦፊሰርና ሰራተኛ በራሱ መታወቂያ ኮድ (Badge ID) ብቻ መግባትና መመዝገብ አለበት። በሌላ ሰራተኛ ምትክ መመዝገብ በሲስተሙ የተከለከለ ነው።
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REGULAR SLOTS */}
          {activeTab === 'regular_slots' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  የዕለት መደበኛ የስራ ሰዓት 5ቱ የሰዓት መስኮቶች
                </h3>
                <p className="text-xs text-slate-400">
                  መደበኛ ሰራተኞች በቀን 5 ጊዜ የሚመዘገቡባቸው የሰዓት መስኮቶች ናቸው። ሰዓቱ ሲደርስ ብቻ ሲስተሙ ክፍት ይሆናል፤ ሰዓቱ ሲያልፍ ይዘጋል።
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">ጠዋት ስራ መግቢያ (Morning Entry)</h4>
                      <p className="text-xs text-slate-400">የዕለቱ የስራ መጀመሪያ ሰዓት</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                      ጠዋት 2፡30 - 2፡45
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm">ጠዋት የሻይ እረፍት (Morning Tea Break)</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          የተስተካከለ ሰዓት
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">ሰራተኞች ለሻይ እረፍት ወጥተው የሚመለሱበት የተፈቀደ የሰዓት መስኮት</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                      ጠዋት 3፡55 - 4፡35
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">ከሰዓት ከምሳ መልስ መግቢያ (Lunch Return)</h4>
                      <p className="text-xs text-slate-400">ከምሳ እረፍት መልስ ወደ ቢሮ መመለሻ ሰዓት</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                      ከሰዓት 7፡35 - 7፡45
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      4
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">ከሰዓት የሻይ እረፍት (Afternoon Tea Break)</h4>
                      <p className="text-xs text-slate-400">የከሰዓት አጭር የእረፍት ሰዓት</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
                      ከሰዓት 9፡05 - 9፡35
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      5
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">ከስራ መውጫ ሰዓት (Work Exit)</h4>
                      <p className="text-xs text-slate-400">የዕለቱን የስራ ሰዓት አጠናቆ መውጫ ሰዓት</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm border border-emerald-500/30">
                      ከምሽቱ 11፡20 - 11፡30
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DUTY SHIFTS & MANDATORY REPORT */}
          {activeTab === 'duty_shifts' && (
            <div className="space-y-6">
              <div className="bg-indigo-950/40 p-5 rounded-2xl border border-indigo-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">
                    ልዩ የውሎ እና አዳር (24 ሰዓት) ተረኝነት እና የሰዓት ቁጥጥር ደንብ
                  </h3>
                </div>
                <p className="text-slate-300 text-sm">
                  ከመደበኛ ስራው የተለየ አዳርና ውሎ ለሚመደቡ የፖሊስ አባላትና ሰራተኞች የተዘጋጀ ሲሆን 3 ወሳኝ የሰዓት ደረጃዎችን ያካተተ ነው።
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Duty Step 1 */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      ደረጃ 1፡ መግቢያ
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">ጠዋት 2:00 - 2:30</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">ቀጣይ ውሎና አዳር ተረኛ መግቢያ</h4>
                  <p className="text-xs text-slate-400">
                    የቀጣዩ ቀን ውሎና አዳር ተረኛ ወደ ስራ ገብቶ ኃላፊነቱን የሚረከብበት የሰዓት መስኮት ነው።
                  </p>
                </div>

                {/* Duty Step 2 */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-purple-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      ደረጃ 2፡ የሌሊት ቁጥጥር
                    </span>
                    <span className="font-mono text-xs font-bold text-purple-400">ሌሊት 9:00 - 9:30</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">የሌሊት ሰዓት ቁጥጥርና የዙር ፍተሻ</h4>
                  <p className="text-xs text-slate-400">
                    በሌሊት 9፡00 እስከ 9፡30 ተረኛው የጣቢያውን፣ የቢሮዎችንና የተጠርጣሪዎችን ፀጥታና ደህንነት አረጋግጦ ይመዘግባል።
                  </p>
                </div>

                {/* Duty Step 3 */}
                <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-900/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      ደረጃ 3፡ አድሮ መውጫ
                    </span>
                    <span className="font-mono text-xs font-bold text-emerald-400">ጠዋት 2:00</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">አድሮ መውጫ (ከሪፖርት ጋር ግዴታ)</h4>
                  <p className="text-xs text-slate-400">
                    ተረኛው አድሮ ሲወጣ ሪፖርት ፅፎ የሚወጣበት ሰዓት ነው።
                  </p>
                </div>
              </div>

              {/* CRITICAL RULE: Mandatory Report */}
              <div className="bg-red-950/40 p-5 rounded-2xl border-2 border-red-800 space-y-3">
                <div className="flex items-center gap-2 text-red-300 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span>የግዴታ የተረኛ ሪፖርት ህግ (Strict Validation Rule)</span>
                </div>
                <div className="text-slate-200 text-sm leading-relaxed space-y-2">
                  <p>
                    <strong>«ውሎ እና አደር ያደረ ተረኛ አድሮ መውጫ ሞልቶ ሲወጣ ሪፖርት ፅፎ መውጣት ግዴታ ነው፤ ካለበለዚያ መመዝገብ እንዳይችል አድርግ»</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                    <li>ተረኛው አድሮ መውጫ ከመመዝገቡ በፊት በስራው ወቅት ያጋጠሙትን ክስተቶች፣ የጥበቃ ሁኔታና የርክክብ ማስታወሻ መፃፍ አለበት።</li>
                    <li>ሪፖርቱ ካልተሞላ የመውጫ ቁልፉ ይቆለፋል (Disabled ይሆናል)።</li>
                    <li>ተረኛው ሪፖርቱን ሞልቶ ሲጨርስ ብቻ የመውጫ ቁልፉ አረንጓዴ ሆኖ ይከፈትለታል።</li>
                    <li>የተፃፈው ሪፖርት በቀጥታ በፋየር ስቶር ዳታቤዝ እና በማዕከላዊ ማህደር ውስጥ ተያይዞ በቋሚነት ይመዘገባል።</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICER GUIDE */}
          {activeTab === 'officer_guide' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-amber-400" />
                የሰራተኛ/ኦፊሰር ደረጃ በደረጃ የአጠቃቀም መመሪያ
              </h3>

              <div className="space-y-4">
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">ወደ ሲስተሙ መግባት (Login)</h4>
                    <p className="text-xs text-slate-400">
                      የመግቢያ መስኮቱ ላይ ስምዎን ይምረጡ ወይም የተሰጠዎትን ልዩ የመታወቂያ ቁጥር (Badge ID) ያስገቡ (ምሳሌ፡ <code>POL-101</code>)።
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">የሰዓት ሰሌዳውን መመልከት</h4>
                    <p className="text-xs text-slate-400">
                      በመቆጣጠሪያ ሰሌዳው ላይ አሁን ክፍት የሆነው የሰዓት መስኮት በብልጭልጭ ቢጫ (Active) ሆኖ ይታያል።
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">መዝግበህ ግባ / ውጣ የሚለውን መጫን</h4>
                    <p className="text-xs text-slate-400">
                      ሰዓቱ ሲደርስ «መዝግበህ ግባ / ውጣ» የሚለውን ይጫኑ። ሲስተሙ ወዲያውኑ የገቡበትን የኢትዮጵያ ሰዓትና ቀን መዝግቦ አረንጓዴ (✓ ተመዝግቧል) ያደርገዋል።
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">4</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">የውሎና አዳር ተረኝነት ምዝገባ</h4>
                    <p className="text-xs text-slate-400">
                      ውሎና አዳር ተረኛ ከሆኑ ጠዋት 2:00-2:30 መግቢያዎን፣ ሌሊት 9:00-9:30 ቁጥጥርዎን፣ እና ጠዋት 2:00 አድሮ መውጫዎን ከሪፖርት ጋር ይመዝግቡ።
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">5</div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">የግል ታሪክና የምስክር ወረቀት መመልከት</h4>
                    <p className="text-xs text-slate-400">
                      ከስር ባለው ሰንጠረዥ የተመዘገቡበትን ታሪክ መመልከት እና ጥሩ የሰዓት አከባበር ካሎት የኮሚሽኑን የክብር የምስክር ወረቀት ማየት ይችላሉ።
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ADMIN GUIDE */}
          {activeTab === 'admin_guide' && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                የአስተዳዳሪ (Admin / Commander) አጠቃቀም መመሪያ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">1. የሰራተኞች መረጃ አስተዳደር</h4>
                  <p className="text-xs text-slate-400">
                    አዳዲስ ፖሊሶችንና ሰራተኞችን በስም፣ በማዕረግ፣ በክፍልና በመታወቂያ ቁጥር መመዝገብ፣ ማስተካከል ወይም ከስራ የተሰናበቱትን መሰረዝ ይችላሉ።
                  </p>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-indigo-400 text-sm">2. የውሎና አዳር ተረኞችን መመደብ</h4>
                  <p className="text-xs text-slate-400">
                    ለእያንዳንዱ ቀን ወይም ሳምንት ውሎና አዳር የሚገቡ ተረኞችን በሲስተሙ መመደብ፣ የሰዓት ክትትል ማድረግና ሪፖርታቸውን መገምገም ይቻላል።
                  </p>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-emerald-400 text-sm">3. ሪፖርቶችን ማመንጨትና ማተም</h4>
                  <p className="text-xs text-slate-400">
                    የዕለት፣ የሳምንትና የወር የሰዓት አከባበር ሪፖርቶችን፣ ያረፈዱትንና የቀሩትን ዝርዝር በቀላሉ በኮሚሽኑ ፎርማት ወደ PDF ማመንጨትና ማተም ይችላሉ።
                  </p>
                </div>

                <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2">
                  <h4 className="font-bold text-amber-400 text-sm">4. የምስክር ወረቀት (Recognition Certificate)</h4>
                  <p className="text-xs text-slate-400">
                    በሰዓት አከባበር ከፍተኛ ውጤት ላስመዘገቡ አባላት ይፋዊ የኮሚሽኑ ማህተምና ፊርማ ያለበት የክብር የምስክር ወረቀት ያመነጫል።
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 space-y-2 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-amber-400" />
                  የሰዓት ሙከራ ሁነታ (Admin Test Simulation Mode)
                </div>
                <p>
                  አስተዳዳሪው ሲስተሙን ለመሞከር ወይም ልዩ ፍተሻ ለማድረግ ከፈለገ «የሰዓት ሙከራ ሁነታን (Simulation)» ማብራት ይችላል። ይህ ሁነታ ሲበራ ሰዓቱ ባይደርስም እንኳን ሁሉንም የሰዓት መስኮቶች ለሙከራ ክፍት ያደርጋቸዋል።
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div>
            ቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን - የቴክኖሎጂና መረጃ ደህንነት መምሪያ
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer self-end"
          >
            ተረድቻለሁ፤ ዝጋ
          </button>
        </div>
      </div>
    </div>
  );
};
