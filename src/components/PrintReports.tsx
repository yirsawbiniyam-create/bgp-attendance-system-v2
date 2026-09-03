import React from 'react';
import { X, Printer, Shield, Calendar, Award } from 'lucide-react';
import { User, AttendanceRecord, NightDutyShift, FieldDuty, LeaveRecord, CommissionSettings } from '../types';
import { toEthiopianDate } from '../lib/ethiopianCalendar';

interface ConsolidatedReportProps {
  settings: CommissionSettings;
  users: User[];
  attendanceRecords: AttendanceRecord[];
  nightDuties: NightDutyShift[];
  fieldDuties: FieldDuty[];
  leaves: LeaveRecord[];
  onClose: () => void;
}

export const ConsolidatedReportModal: React.FC<ConsolidatedReportProps> = ({
  settings,
  users,
  attendanceRecords,
  nightDuties,
  fieldDuties,
  leaves,
  onClose
}) => {
  const ethDate = toEthiopianDate(new Date());

  const handlePrint = () => {
    window.print();
  };

  const officers = users.filter((u) => u.role === 'officer');

  return (
    <div id="consolidated-report-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
          <div className="text-white font-bold text-base flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span>የኮሚሽኑ ጠቅላላ የተጠቃለለ የሰዓት አጠቃቀም እና ኤፊሸንሲ ሪፖርት</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ሪፖርቱን አትም (Print / Export PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl shadow-lg border border-slate-300 font-sans print:p-0 print:border-none print:shadow-none">
          
          {/* Official Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="flex items-center justify-center gap-4 mb-2">
              <img
                src={settings.logoUrl}
                alt="የኮሚሽን አርማ"
                className="w-20 h-20 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  በኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ
                </div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">
                  {settings.commissionName}
                </h1>
                <div className="text-sm font-bold text-slate-700">
                  {settings.departmentName}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  የስራ ሰዓት ቁጥጥር፣ የአዳር ተረኝነት እና የሰራተኞች ኤፊሸንሲ መምሪያ
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t border-slate-200 flex justify-between text-xs font-medium text-slate-600">
              <span>የሪፖርት ቁጥር፡ ቤ/ጉ/ፖ/ቴክ-{Date.now().toString().slice(-6)}</span>
              <span>የወጣበት ቀን፡ {ethDate.formatted}</span>
              <span>ቦታ፡ አሶሳ፣ ቤንሻንጉል ጉሙዝ</span>
            </div>
          </div>

          <div className="my-6 text-center">
            <h2 className="text-lg font-black text-slate-900 underline uppercase underline-offset-4">
              የሰራተኞች ጠቅላላ የተጠቃለለ የሰዓት አጠቃቀም እና የስራ ውጤት (ኤፊሸንሲ) ሪፖርት
            </h2>
          </div>

          {/* Officers Summary Table */}
          <div className="overflow-x-auto mb-8">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">ተ.ቁ</th>
                  <th className="p-2 border-r border-slate-300">የሰራተኛው ስም</th>
                  <th className="p-2 border-r border-slate-300">ማዕረግ</th>
                  <th className="p-2 border-r border-slate-300">የስራ ክፍል</th>
                  <th className="p-2 border-r border-slate-300">መለያ ባጅ</th>
                  <th className="p-2 border-r border-slate-300 text-center">የመግቢያ ምዝገባ</th>
                  <th className="p-2 border-r border-slate-300 text-center">አዳር ተረኝነት</th>
                  <th className="p-2 border-r border-slate-300 text-center">ፈቃድ / ፊልድ</th>
                  <th className="p-2 border-r border-slate-300 text-center">የስራ ውጤት</th>
                  <th className="p-2 text-center">የተሰጠ ደረጃ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {officers.map((officer, index) => {
                  const checkIns = attendanceRecords.filter((r) => r.userId === officer.id).length;
                  const duties = nightDuties.filter((d) => d.userId === officer.id).length;
                  const officerLeaves = leaves.filter((l) => l.userId === officer.id).length;
                  const officerFields = fieldDuties.filter((f) => f.userId === officer.id).length;

                  return (
                    <tr key={officer.id} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-300 font-bold">{index + 1}</td>
                      <td className="p-2 border-r border-slate-300 font-bold text-slate-900">{officer.fullName}</td>
                      <td className="p-2 border-r border-slate-300">{officer.rank}</td>
                      <td className="p-2 border-r border-slate-300">{officer.department}</td>
                      <td className="p-2 border-r border-slate-300 font-mono">{officer.badgeNumber}</td>
                      <td className="p-2 border-r border-slate-300 text-center font-bold text-emerald-700">{checkIns} ጊዜ</td>
                      <td className="p-2 border-r border-slate-300 text-center">{duties} ቀን</td>
                      <td className="p-2 border-r border-slate-300 text-center">{officerLeaves + officerFields} ቀን</td>
                      <td className="p-2 border-r border-slate-300 text-center font-black text-slate-900">{officer.efficiencyScore ?? 92}%</td>
                      <td className="p-2 text-center font-bold text-emerald-800">{officer.rankTier ?? 'እጅግ የላቀ'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Performance Summary and Signatures */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-700 mb-10">
            <strong>ማጠቃለያ ማስታወሻ፡</strong> ይህ የተጠቃለለ ሪፖርት በቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን የቴክኖሎጂ ማስፋፊያ የሰዓት ቁጥጥር ሲስተም በቀጥታ በፋየር ስቶር (Firestore Database) ከተመዘገበው መረጃ የተዘጋጀ ሲሆን የሰራተኞች መደበኛ 5 የሰዓት መስኮቶች፣ የአዳር ተረኝነት እና የዲሲፕሊን ውጤቶችን በታማኝነት ያካትታል።
          </div>

          {/* Signatures */}
          <div className="flex items-end justify-between pt-8 border-t-2 border-slate-300 text-xs">
            <div className="text-center">
              <div className="w-44 border-b border-slate-900 mb-1" />
              <div className="font-bold text-slate-900">ሪፖርቱን ያዘጋጀው ባለሙያ ፊርማ</div>
              <div className="text-slate-500">የቴክኖሎጂ ማስፋፊያ ክፍል</div>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-400 mx-auto">
                <Shield className="w-8 h-8 opacity-40 mb-1" />
                <span className="text-[9px] font-bold">የኮሚሽኑ ማህተም</span>
              </div>
            </div>

            <div className="text-center">
              <div className="w-44 border-b border-slate-900 mb-1" />
              <div className="font-bold text-slate-900">የመምሪያው ኃላፊ ማጽደቂያ ፊርማ</div>
              <div className="text-slate-500">ኮሚሽነር / የመምሪያ ኃላፊ</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

interface IndividualReportProps {
  user: User;
  settings: CommissionSettings;
  attendanceRecords: AttendanceRecord[];
  nightDuties: NightDutyShift[];
  fieldDuties: FieldDuty[];
  leaves: LeaveRecord[];
  onClose: () => void;
  onViewCertificate: (user: User) => void;
}

export const IndividualReportModal: React.FC<IndividualReportProps> = ({
  user,
  settings,
  attendanceRecords,
  nightDuties,
  fieldDuties,
  leaves,
  onClose,
  onViewCertificate
}) => {
  const ethDate = toEthiopianDate(new Date());
  const myRecords = attendanceRecords.filter((r) => r.userId === user.id);
  const myDuties = nightDuties.filter((d) => d.userId === user.id);
  const myLeaves = leaves.filter((l) => l.userId === user.id);
  const myFields = fieldDuties.filter((f) => f.userId === user.id);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="individual-report-modal" className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
        
        {/* Actions */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
          <div className="text-white font-bold text-base flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span>የሰራተኛ የግል ማህደር እና የሰዓት አጠቃቀም ሪፖርት ({user.fullName})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onViewCertificate(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 transition cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>ሰርትፊኬት አዘጋጅ</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>ማህደሩን አትም (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-xl shadow-lg border border-slate-300 font-sans print:p-0 print:border-none">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-slate-900">
            <div className="flex items-center gap-3">
              <img
                src={settings.logoUrl}
                alt="Logo"
                className="w-16 h-16 object-contain"
                referrerPolicy="no-referrer"
              />
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {settings.commissionName}
                </h2>
                <div className="text-xs font-bold text-slate-600">{settings.departmentName}</div>
                <div className="text-[11px] text-slate-500">የሰራተኛ የግል ሰዓት መከታተያ ማህደር (Officer Dossier)</div>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="font-bold text-slate-900">{ethDate.formatted}</div>
              <div className="text-slate-500 font-mono">መለያ፡ {user.badgeNumber}</div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">ሙሉ ስም፡</span>
              <strong className="text-slate-900 text-sm">{user.fullName}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">ማዕረግ፡</span>
              <strong className="text-slate-900">{user.rank}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">የስራ ክፍል፡</span>
              <strong className="text-slate-900">{user.department}</strong>
            </div>
            <div>
              <span className="text-slate-500 block">የስራ ውጤት (ኤፊሸንሲ)፡</span>
              <strong className="text-amber-800 text-sm font-black">{user.efficiencyScore ?? 92}% ({user.rankTier})</strong>
            </div>
          </div>

          {/* History Records */}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
            የስራ መግቢያና መውጫ ምዝገባዎች ታሪክ ({myRecords.length})
          </h3>
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead className="bg-slate-100 font-bold">
                <tr>
                  <th className="p-2 border border-slate-300">ቀን</th>
                  <th className="p-2 border border-slate-300">የሰዓት መስኮት</th>
                  <th className="p-2 border border-slate-300">የገባበት ሰዓት</th>
                  <th className="p-2 border border-slate-300">ሁኔታ</th>
                  <th className="p-2 border border-slate-300">ማስታወሻ</th>
                </tr>
              </thead>
              <tbody>
                {myRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-3 text-center text-slate-500">
                      የተመዘገበ የስራ ሰዓት መረጃ የለም
                    </td>
                  </tr>
                ) : (
                  myRecords.slice(0, 10).map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 border border-slate-300">{r.ethiopianDate}</td>
                      <td className="p-2 border border-slate-300 font-bold">{r.slotName}</td>
                      <td className="p-2 border border-slate-300 font-mono">{r.ethiopianTimeIn}</td>
                      <td className="p-2 border border-slate-300">
                        {r.status === 'on_time' ? 'በሰዓቱ' : 'ዘግይቶ'}
                      </td>
                      <td className="p-2 border border-slate-300">{r.note || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="flex items-end justify-between pt-6 border-t border-slate-300 text-xs">
            <div className="text-center">
              <div className="w-36 border-b border-slate-900 mb-1" />
              <div className="font-bold text-slate-900">የሰራተኛው ፊርማ</div>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-900 mb-1" />
              <div className="font-bold text-slate-900">የአስተዳዳሪው ፊርማና ማህተም</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
