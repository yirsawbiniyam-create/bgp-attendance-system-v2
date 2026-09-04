import React, { useState } from 'react';
import {
  Users,
  Clock,
  UserPlus,
  Shield,
  FileSpreadsheet,
  Moon,
  Calendar,
  Award,
  Settings,
  Search,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Printer,
  Trash2,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  Briefcase,
  Compass,
  Upload,
  BarChart3,
  Check,
  FileCheck,
  ArrowLeft
} from 'lucide-react';
import {
  User,
  AttendanceRecord,
  NightDutyShift,
  FieldDuty,
  LeaveRecord,
  CommissionSettings,
  TimeSlot
} from '../types';
import { OFFICIAL_SLOTS, toEthiopianDate, toEthiopianTime } from '../lib/ethiopianCalendar';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  attendanceRecords: AttendanceRecord[];
  nightDuties: NightDutyShift[];
  fieldDuties: FieldDuty[];
  leaves: LeaveRecord[];
  settings: CommissionSettings;
  onSaveUser: (user: User) => Promise<void>;
  onDeleteUser: (userId: string) => Promise<void>;
  onSaveNightDuty: (duty: NightDutyShift) => Promise<void>;
  onSaveFieldDuty: (field: FieldDuty) => Promise<void>;
  onSaveLeave: (leave: LeaveRecord) => Promise<void>;
  onSaveSettings: (settings: CommissionSettings) => Promise<void>;
  onViewCertificate: (user: User) => void;
  onPrintConsolidatedReport: () => void;
  onPrintIndividualReport: (user: User) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  attendanceRecords,
  nightDuties,
  fieldDuties,
  leaves,
  settings,
  onSaveUser,
  onDeleteUser,
  onSaveNightDuty,
  onSaveFieldDuty,
  onSaveLeave,
  onSaveSettings,
  onViewCertificate,
  onPrintConsolidatedReport,
  onPrintIndividualReport
}) => {
  const [activeTab, setActiveTab] = useState<
    'live_board' | 'users' | 'night_duty' | 'leave_field' | 'efficiency' | 'reports' | 'settings'
  >('live_board');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Officer Form State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<User>>({
    rank: 'ረዳት ሳጅን (Assistant Sergeant)',
    department: 'የቴክኖሎጂ ማስፋፊያ ክፍል',
    position: 'የቴክኖሎጂ ባለሙያ',
    role: 'officer',
    fullName: '',
    phone: '',
    badgeNumber: '',
    username: '',
    password: '123',
    efficiencyScore: 90,
    rankTier: 'ከፍተኛ (A)',
    additionalNotes: ''
  });

  // Night Duty / 24-hr Duty Form State
  const [showNightDutyModal, setShowNightDutyModal] = useState(false);
  const [nightDutyFormData, setNightDutyFormData] = useState<Partial<NightDutyShift>>({
    userId: users.find((u) => u.role === 'officer')?.id || '',
    shiftDate: new Date().toISOString().split('T')[0],
    shiftType: '24hr_duty',
    entryTimeWindow: 'ጠዋት 2:00 - 2:30',
    nightCheckTimeWindow: 'ሌሊት 9:00 - 9:30',
    exitTimeWindow: 'ጠዋት 2:00',
    incidentReport: '',
    patrolNotes: '',
    handoverNotes: ''
  });

  // Leave Form State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveFormData, setLeaveFormData] = useState<Partial<LeaveRecord>>({
    userId: users.find((u) => u.role === 'officer')?.id || '',
    leaveType: 'ዓመታዊ ፈቃድ',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    reason: '',
    approvedBy: currentUser.fullName
  });

  // Field Duty Form State
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [fieldFormData, setFieldFormData] = useState<Partial<FieldDuty>>({
    userId: users.find((u) => u.role === 'officer')?.id || '',
    destination: 'ባምባሲ ወረዳ ፖሊስ ጽ/ቤት',
    reason: 'የኔትወርክ እና የቴክኖሎጂ መሰረተ ልማት ዝርጋታ',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    approvedBy: currentUser.fullName
  });

  // Settings State
  const [settingsFormData, setSettingsFormData] = useState<CommissionSettings>({ ...settings });
  const [logoInputUrl, setLogoInputUrl] = useState(settings.logoUrl);

  // Efficiency Period filter
  const [efficiencyPeriod, setEfficiencyPeriod] = useState<
    'daily' | 'weekly' | 'monthly' | '3_months' | '6_months' | 'yearly'
  >('monthly');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  const ethToday = toEthiopianDate(new Date());
  const todayStr = new Date().toISOString().split('T')[0];

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle Save User
  const handleSaveUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.fullName || !userFormData.username || !userFormData.rank) {
      showToast('error', 'እባክዎ ሙሉ ስም፣ ማዕረግ እና ዩሰርኔም ያስገቡ!');
      return;
    }

    try {
      const newUser: User = {
        id: editingUser ? editingUser.id : `usr_${Date.now()}`,
        username: userFormData.username.trim(),
        password: userFormData.password || '123',
        fullName: userFormData.fullName.trim(),
        rank: userFormData.rank || 'ረዳት ሳጅን',
        department: userFormData.department || 'የቴክኖሎጂ ማስፋፊያ',
        position: userFormData.position || 'የቴክኖሎጂ ባለሙያ',
        phone: userFormData.phone || '',
        badgeNumber: userFormData.badgeNumber || `BG-POL-${Math.floor(100 + Math.random() * 900)}`,
        role: userFormData.role || 'officer',
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
        efficiencyScore: Number(userFormData.efficiencyScore) || 90,
        rankTier: userFormData.rankTier || 'ከፍተኛ (A)',
        additionalNotes: userFormData.additionalNotes || ''
      };

      await onSaveUser(newUser);
      setShowAddUserModal(false);
      setEditingUser(null);
      showToast('success', `${newUser.fullName} በተሳካ ሁኔታ በፋየር ስቶር ተመዝግቧል!`);
    } catch (e) {
      showToast('error', 'ሰራተኛውን መመዝገብ አልተቻለም፤ እባክዎ እንደገና ይሞክሩ');
    }
  };

  // Handle Delete User
  const handleDeleteUserClick = async (user: User) => {
    if (user.id === currentUser.id) {
      showToast('error', 'ዋና አስተዳዳሪውን ራስዎን ማጥፋት አይችሉም!');
      return;
    }
    if (confirm(`እርግጠኛ ነዎት "${user.rank} ${user.fullName}" ከሲስተሙ ይሰረዝ?`)) {
      await onDeleteUser(user.id);
      showToast('success', `${user.fullName} ከሲስተሙ ተሰርዟል`);
    }
  };

  // Handle Save Night Duty Schedule
  const handleSaveNightDutySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const officer = users.find((u) => u.id === nightDutyFormData.userId);
    if (!officer) {
      showToast('error', 'እባክዎ ተረኛ ሰራተኛ ይምረጡ!');
      return;
    }

    const duty: NightDutyShift = {
      id: `nd_${Date.now()}`,
      userId: officer.id,
      officerName: officer.fullName,
      rank: officer.rank,
      department: officer.department,
      shiftDate: nightDutyFormData.shiftDate || todayStr,
      ethiopianDate: ethToday.formatted,
      shiftType: '24hr_duty',
      entryTimeWindow: nightDutyFormData.entryTimeWindow || 'ጠዋት 2:00 - 2:30',
      nightCheckTimeWindow: nightDutyFormData.nightCheckTimeWindow || 'ሌሊት 9:00 - 9:30',
      exitTimeWindow: nightDutyFormData.exitTimeWindow || 'ጠዋት 2:00',
      status: 'scheduled',
      incidentReport: '',
      createdAt: new Date().toISOString()
    };

    await onSaveNightDuty(duty);
    setShowNightDutyModal(false);
    showToast('success', `ለ ${officer.fullName} የውሎና አዳር ተረኝነት ፕሮግራም ተመዝግቧል!`);
  };

  // Handle Save Leave Submit
  const handleSaveLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const officer = users.find((u) => u.id === leaveFormData.userId);
    if (!officer) return;

    const leave: LeaveRecord = {
      id: `leave_${Date.now()}`,
      userId: officer.id,
      officerName: officer.fullName,
      rank: officer.rank,
      department: officer.department,
      leaveType: leaveFormData.leaveType as any,
      startDate: leaveFormData.startDate || todayStr,
      endDate: leaveFormData.endDate || todayStr,
      reason: leaveFormData.reason || 'በአስተዳዳሪው የፀደቀ ፈቃድ',
      approvedBy: currentUser.fullName,
      status: 'approved',
      createdAt: new Date().toISOString()
    };

    await onSaveLeave(leave);
    setShowLeaveModal(false);
    showToast('success', `ለ ${officer.fullName} የፈቃድ መረጃ ተመዝግቧል!`);
  };

  // Handle Save Field Duty Submit
  const handleSaveFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const officer = users.find((u) => u.id === fieldFormData.userId);
    if (!officer) return;

    const field: FieldDuty = {
      id: `field_${Date.now()}`,
      userId: officer.id,
      officerName: officer.fullName,
      rank: officer.rank,
      department: officer.department,
      destination: fieldFormData.destination || 'ወረዳ ፖሊስ ጣቢያ',
      reason: fieldFormData.reason || 'የስራ ግዳጅ',
      startDate: fieldFormData.startDate || todayStr,
      endDate: fieldFormData.endDate || todayStr,
      approvedBy: currentUser.fullName,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await onSaveFieldDuty(field);
    setShowFieldModal(false);
    showToast('success', `ለ ${officer.fullName} የፊልድ ስራ ምዝገባ ተጠናቋል!`);
  };

  // Handle Logo Upload or Selection
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setLogoInputUrl(result);
        setSettingsFormData((prev) => ({ ...prev, logoUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Settings
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...settingsFormData,
      logoUrl: logoInputUrl
    };
    await onSaveSettings(updated);
    showToast('success', 'የኮሚሽኑ ቅንብሮች እና አርማ (Logo) በፋየር ስቶር ተቀምጠዋል!');
  };

  // Calculate Officer Efficiency Rankings based on Attendance & Conduct
  const sortedRankings = [...users]
    .filter((u) => u.role === 'officer')
    .sort((a, b) => (b.efficiencyScore ?? 90) - (a.efficiencyScore ?? 90));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Admin Title & Navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20">
                  ዋና አስተዳዳሪ (Admin Control Center)
                </span>
                <span className="text-xs text-slate-400">
                  {currentUser.rank} {currentUser.fullName}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white mt-0.5">
                የቤንሻንጉል ጉሙዝ ፖሊስ ቴክኖሎጂ ማስፋፊያ የቁጥጥር ማዕከል
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrintConsolidatedReport}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>ጠቅላላ ሪፖርት ፕሪንት (Consolidated)</span>
            </button>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  rank: 'ረዳት ሳጅን (Assistant Sergeant)',
                  department: 'የቴክኖሎጂ ማስፋፊያ ክፍል',
                  position: 'የቴክኖሎጂ ባለሙያ',
                  role: 'officer',
                  fullName: '',
                  phone: '',
                  badgeNumber: `BG-POL-${Math.floor(100 + Math.random() * 900)}`,
                  username: '',
                  password: '123',
                  efficiencyScore: 92,
                  rankTier: 'እጅግ የላቀ (A+)',
                  additionalNotes: ''
                });
                setShowAddUserModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold rounded-xl shadow transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>አዲስ ሰራተኛ መዝግብ</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation buttons */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto text-xs pb-1">
          {activeTab !== 'live_board' && (
            <button
              id="btn-admin-tab-back"
              onClick={() => setActiveTab('live_board')}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-bold bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border border-amber-500/40 cursor-pointer shadow-sm transition shrink-0"
              title="ወደ ዋና ሰሌዳ ተመለስ"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>ተመለስ</span>
            </button>
          )}

          {[
            { id: 'live_board', label: 'የቀጥታ ሰሌዳ (Live Board)', icon: Clock },
            { id: 'users', label: 'የሰራተኞች ማህደር (Staff Directory)', icon: Users },
            { id: 'night_duty', label: 'አዳር ተረኞች (Night Duty)', icon: Moon },
            { id: 'leave_field', label: 'ፈቃድና ፊልድ (Leave & Field)', icon: Compass },
            { id: 'efficiency', label: 'ኤፊሸንሲ እና ደረጃ (Efficiency)', icon: TrendingUp },
            { id: 'reports', label: 'ሪፖርቶችና ሰርትፊኬት (Reports)', icon: FileSpreadsheet },
            { id: 'settings', label: 'የኮሚሽኑ ቅንብሮች (Settings)', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            notification.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
              : 'bg-red-950/70 border-red-800 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TAB 1: LIVE ATTENDANCE BOARD */}
      {activeTab === 'live_board' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">ጠቅላላ የተመዘገቡ ሰራተኞች</div>
              <div className="text-2xl font-bold text-white mt-1">{users.filter((u) => u.role === 'officer').length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">በቴክኖሎጂ ማስፋፊያ መምሪያ</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">የዛሬ ምዝገባዎች (Check-ins)</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {attendanceRecords.filter((r) => r.date === todayStr).length}
              </div>
              <div className="text-[10px] text-emerald-500 mt-0.5">በሰዓቱ የተመዘገቡ</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">በፈቃድ / በፊልድ ላይ ያሉ</div>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {leaves.filter((l) => l.status === 'approved').length + fieldDuties.filter((f) => f.status === 'active').length}
              </div>
              <div className="text-[10px] text-amber-500 mt-0.5">ህጋዊ ፍቃድ የተሰጣቸው</div>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-[11px] text-slate-400 font-medium">የአዳር ተረኞች (ዛሬ)</div>
              <div className="text-2xl font-bold text-indigo-400 mt-1">
                {nightDuties.filter((d) => d.shiftDate === todayStr).length}
              </div>
              <div className="text-[10px] text-indigo-400 mt-0.5">የምሽትና ለሊት ጥበቃ</div>
            </div>
          </div>

          {/* Slots Status Grid for Today */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-white text-base">
                  የዛሬ የስራ ሰዓታት ክትትል ሰሌዳ ({ethToday.formatted})
                </h3>
                <p className="text-xs text-slate-400">
                  ሰራተኞች በ5ቱ የሰዓት መስኮቶች ውስጥ የገቡበት እና የወጡበት የቀጥታ ሁኔታ
                </p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                የኢትዮጵያ ሰዓት አቆጣጠር
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
              {OFFICIAL_SLOTS.map((s) => {
                const checkedCount = attendanceRecords.filter(
                  (r) => r.date === todayStr && r.slotId === s.id
                ).length;
                return (
                  <div key={s.id} className="bg-slate-800/70 p-3 rounded-xl border border-slate-700/60">
                    <div className="text-[10px] text-amber-400 font-semibold">{s.ethiopianTime}</div>
                    <div className="text-xs font-bold text-white mt-1">{s.name}</div>
                    <div className="text-sm font-bold text-emerald-400 mt-2">
                      {checkedCount} ሰራተኛ ገብቷል
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attendance Records Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">ኦፊሰር / ሰራተኛ</th>
                    <th className="px-4 py-3">ማዕረግና ክፍል</th>
                    <th className="px-4 py-3">የሰዓት መስኮት</th>
                    <th className="px-4 py-3">የገባበት ሰዓት</th>
                    <th className="px-4 py-3">ሁኔታ</th>
                    <th className="px-4 py-3">መገኛ (GPS)</th>
                    <th className="px-4 py-3 rounded-r-lg">ተግባር</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        እስካሁን የተመዘገበ የስራ ሰዓት መረጃ የለም
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.slice(0, 15).map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-semibold text-white">
                          {rec.officerName}
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          {rec.rank} • {rec.department}
                        </td>
                        <td className="px-4 py-3 text-amber-300 font-medium">
                          {rec.slotName}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          {rec.ethiopianTimeIn} ({rec.timeIn})
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rec.status === 'on_time'
                                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                                : rec.status === 'late'
                                ? 'bg-amber-950/70 text-amber-300 border border-amber-800'
                                : 'bg-red-950/70 text-red-300 border border-red-800'
                            }`}
                          >
                            {rec.status === 'on_time' ? 'በሰዓቱ ገብቷል' : rec.status === 'late' ? 'ዘግይቷል' : 'ቀሪ'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>ኮሚሽን ግቢ</span>
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              const usr = users.find((u) => u.id === rec.userId);
                              if (usr) onPrintIndividualReport(usr);
                            }}
                            className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>ፋይል</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white">
                የሰራተኞች እና የፖሊስ ኦፊሰሮች ማህደር (Staff Directory)
              </h3>
              <p className="text-xs text-slate-400">
                ሰራተኞችን መመዝገብ፣ ማስተካከል፣ መረጃዎችን ማዘመን እና የይለፍ ቃል መስጠት
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="በስም፣ በማዕረግ ወይም በስልክ ፈልግ..."
                  className="pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setShowAddUserModal(true);
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" /> አዲስ መዝግብ
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ማዕረግ እና ሙሉ ስም</th>
                  <th className="px-4 py-3">የስራ ክፍል እና መደብ</th>
                  <th className="px-4 py-3">የፖሊስ መለያ ባጅ</th>
                  <th className="px-4 py-3">ስልክ ቁጥር</th>
                  <th className="px-4 py-3">ዩሰርኔም / ሚና</th>
                  <th className="px-4 py-3">የስራ ውጤት</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">ተግባራት</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users
                  .filter(
                    (u) =>
                      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.phone.includes(searchTerm)
                  )
                  .map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white">{usr.fullName}</div>
                        <div className="text-[11px] text-amber-400 font-semibold">{usr.rank}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{usr.department}</div>
                        <div className="text-[11px] text-slate-400">{usr.position}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-200">
                        {usr.badgeNumber}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {usr.phone || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-white font-semibold">{usr.username}</div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {usr.role === 'admin' ? 'አስተዳዳሪ' : 'ኦፊሰር'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-amber-400 text-sm">
                          {usr.efficiencyScore ?? 92}%
                        </span>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {usr.rankTier ?? 'እጅግ የላቀ'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => onViewCertificate(usr)}
                          title="የምስክር ወረቀት አዘጋጅ/እይ"
                          className="p-1.5 text-amber-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Award className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintIndividualReport(usr)}
                          title="የሰራተኛውን ማህደር ፕሪንት አድርግ"
                          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingUser(usr);
                            setUserFormData({ ...usr });
                            setShowAddUserModal(true);
                          }}
                          title="አስተካክል (Edit)"
                          className="p-1.5 text-slate-300 hover:bg-slate-800 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {usr.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUserClick(usr)}
                            title="አጥፋ (Delete)"
                            className="p-1.5 text-red-400 hover:bg-slate-800 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: NIGHT DUTY ROSTER & INCIDENTS */}
      {activeTab === 'night_duty' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                የአዳር ተረኞች ፕሮግራም እና የእለት ክስተቶች ሪፖርት (Night Duty Roster & Logbook)
              </h3>
              <p className="text-xs text-slate-400">
                አስተዳዳሪው በሚሞላው ሰዓት መሰረት አዳር ተረኞች ይመዘገባሉ፤ ያጋጠሟቸውን ሁኔታዎች ይመዘግባሉ
              </p>
            </div>

            <button
              onClick={() => setShowNightDutyModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Plus className="w-4 h-4" /> አዳር ተረኛ መዝግብ
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nightDuties.length === 0 ? (
              <div className="col-span-3 text-center py-10 text-slate-500 text-xs">
                እስካሁን የተመደበ የአዳር ተረኛ የለም። አዲስ ተረኛ ለመመደብ ከላይ ያለውን አዝራር ይጫኑ።
              </div>
            ) : (
              nightDuties.map((duty) => (
                <div key={duty.id} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-white text-sm">{duty.officerName}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                      {duty.rank}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">ቀን፡</span>
                      <span className="font-semibold">{duty.shiftDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">የመግቢያ ሰዓት፡</span>
                      <span className="text-amber-300 font-bold">{duty.entryTimeWindow || 'ጠዋት 2:00 - 2:30'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">የሌሊት ቁጥጥር፡</span>
                      <span className="text-purple-300 font-bold">{duty.nightCheckTimeWindow || 'ሌሊት 9:00 - 9:30'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">አድሮ መውጫ፡</span>
                      <span className="text-amber-300 font-bold">{duty.exitTimeWindow || 'ጠዋት 2:00'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-700">
                      <span className="text-slate-400">የገባበት ሰዓት፡</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {duty.checkedInTime || 'ገና አልገባም'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">የሌሊት 9:00-9:30 ቁጥጥር፡</span>
                      <span className="text-purple-400 font-mono font-semibold">
                        {duty.nightCheckedTime || 'ገና አልተመዘገበም'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">አድሮ የወጣበት፡</span>
                      <span className="text-emerald-400 font-mono font-semibold">
                        {duty.checkedOutTime || 'ገና አልወጣም'}
                      </span>
                    </div>
                  </div>

                  {duty.incidentReport ? (
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-emerald-500/30 text-[11px] text-slate-300">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        የተረኛ ማጠቃለያ ሪፖርት (ግዴታ የተጻፈ)፡
                      </div>
                      <p className="italic text-slate-200">"{duty.incidentReport}"</p>
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10px] text-amber-300">
                      ⚠️ ሪፖርት ገና አልተጻፈም (ተረኛው ሪፖርት ሳይጽፍ አድሮ መውጣት አይችልም)
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LEAVE & FIELD MANAGEMENT */}
      {activeTab === 'leave_field' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Leaves */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  የሰራተኞች ፈቃድ ምዝገባ (Leave Management)
                </h3>
                <p className="text-xs text-slate-400">
                  ዓመታዊ፣ ህክምና ወይም አስቸኳይ ፈቃድ ሲሰጥ አስተዳዳሪው እዚህ ይመዘግባል
                </p>
              </div>

              <button
                onClick={() => setShowLeaveModal(true)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> ፈቃድ መዝግብ
              </button>
            </div>

            <div className="space-y-2">
              {leaves.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  እስካሁን የተመዘገበ የፈቃድ መረጃ የለም
                </div>
              ) : (
                leaves.map((l) => (
                  <div key={l.id} className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">{l.officerName} ({l.rank})</div>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        {l.leaveType}
                      </span>
                    </div>
                    <div className="text-slate-400">
                      የፈቃድ ጊዜ፡ <strong className="text-white">{l.startDate}</strong> እስከ <strong className="text-white">{l.endDate}</strong>
                    </div>
                    <div className="text-slate-400">ምክንያት፡ {l.reason}</div>
                    <div className="text-[10px] text-slate-500">ያፀደቀው፡ {l.approvedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Field Duties */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  የፊልድ እና ከቢሮ ውጭ የስራ ግዳጅ (Field Duty Registry)
                </h3>
                <p className="text-xs text-slate-400">
                  ወደ ስራ ሲወጡ የወጡበት ምክንያት እና ወዴት እንደሄዱ የሚመዘገብበት
                </p>
              </div>

              <button
                onClick={() => setShowFieldModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> ፊልድ መዝግብ
              </button>
            </div>

            <div className="space-y-2">
              {fieldDuties.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  እስካሁን የተመዘገበ የፊልድ ስራ የለም
                </div>
              ) : (
                fieldDuties.map((f) => (
                  <div key={f.id} className="p-3 bg-slate-800/70 rounded-xl border border-slate-700/70 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-white">{f.officerName} ({f.rank})</div>
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold">
                        ፊልድ ግዳጅ
                      </span>
                    </div>
                    <div className="text-slate-300">
                      የተላኩበት ቦታ፡ <strong className="text-emerald-400">{f.destination}</strong>
                    </div>
                    <div className="text-slate-400">የወጡበት ምክንያት፡ {f.reason}</div>
                    <div className="text-slate-400">
                      ጊዜ፡ {f.startDate} እስከ {f.endDate}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EFFICIENCY & LEADERBOARD */}
      {activeTab === 'efficiency' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                የሰራተኞች የስራ ውጤት (ኤፊሸንሲ) እና የደረጃ ሰሌዳ
              </h3>
              <p className="text-xs text-slate-400">
                የሰዓት አክባሪነት፣ የአዳር ተረኝነት እና የስራ ዲሲፕሊን ተመዝኖ በየጊዜው ደረጃ ይሰራል
              </p>
            </div>

            {/* Periodic filter selector */}
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              {[
                { id: 'daily', label: 'በየቀኑ' },
                { id: 'weekly', label: 'በየሳምንቱ' },
                { id: 'monthly', label: 'በየወሩ' },
                { id: '3_months', label: 'በየ3 ወሩ' },
                { id: '6_months', label: 'በየ6 ወሩ' },
                { id: 'yearly', label: 'በየአመቱ' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setEfficiencyPeriod(p.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    efficiencyPeriod === p.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top 3 Officers Podium */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {sortedRankings.slice(0, 3).map((officer, index) => (
              <div
                key={officer.id}
                className={`p-5 rounded-2xl border relative overflow-hidden flex flex-col justify-between ${
                  index === 0
                    ? 'bg-gradient-to-b from-amber-500/10 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-800/80 border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/20'
                          : index === 1
                          ? 'bg-slate-300 text-slate-900'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      {index === 0 ? '🏆 1ኛ ደረጃ' : index === 1 ? '🥈 2ኛ ደረጃ' : '🥉 3ኛ ደረጃ'}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-base">{officer.fullName}</h4>
                  <div className="text-xs text-slate-400">{officer.rank}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{officer.department}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase">አማካይ ውጤት</div>
                    <div className="text-xl font-black text-amber-400">{officer.efficiencyScore ?? 92}%</div>
                  </div>
                  <button
                    onClick={() => onViewCertificate(officer)}
                    className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    ሰርትፊኬት ስጥ
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Complete Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ደረጃ</th>
                  <th className="px-4 py-3">ኦፊሰር / ሰራተኛ</th>
                  <th className="px-4 py-3">ማዕረግ</th>
                  <th className="px-4 py-3">የስራ ክፍል</th>
                  <th className="px-4 py-3">የሰዓት አክባሪነት</th>
                  <th className="px-4 py-3">አማካይ ውጤት (ከ100)</th>
                  <th className="px-4 py-3">የተሰጠ ደረጃ</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">ሰርትፊኬት</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {sortedRankings.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-amber-400">{i + 1}ኛ</td>
                    <td className="px-4 py-3 font-semibold text-white">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-400">{u.rank}</td>
                    <td className="px-4 py-3 text-slate-400">{u.department}</td>
                    <td className="px-4 py-3 text-emerald-400 font-semibold">100% በሰዓቱ</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-black text-amber-400">{u.efficiencyScore ?? 90}%</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                        {u.rankTier ?? 'እጅግ የላቀ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onViewCertificate(u)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition cursor-pointer"
                      >
                        ሰርትፊኬት አዘጋጅ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & CERTIFICATES */}
      {activeTab === 'reports' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-amber-400" />
              ሪፖርቶች እና የሰርትፊኬት ማመንጫ ማዕከል
            </h3>
            <p className="text-xs text-slate-400">
              ለእያንዳንዱ ሰራተኛ የተሟላ ማህደር እና ሁሉንም የተጠቃለለ ሪፖርት ፕሪንት ማድረግ ይችላሉ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consolidated Report Card */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">
                  የኮሚሽኑ ጠቅላላ የተጠቃለለ ሪፖርት (Consolidated Master Report)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  የሁሉንም ሰራተኞች የስራ መግቢያና መውጫ፣ የፈቃድ፣ የፊልድ፣ የአዳር ተረኝነት እና የአመቱን ኤፊሸንሲ ውጤት የያዘ ይፋዊ ሪፖርት ማመንጨትና ፕሪንት ማድረግ።
                </p>
              </div>

              <button
                onClick={onPrintConsolidatedReport}
                className="mt-6 w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>ጠቅላላ የተጠቃለለውን ሪፖርት ፕሪንት አድርግ (Print)</span>
              </button>
            </div>

            {/* Individual Dossier Print Card */}
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">
                  የነጠላ ሰራተኛ የግል ማህደር እና ሰርትፊኬት (Individual Dossier & Certificate)
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  የተመረጠውን ሰራተኛ የግል የሰዓት ታሪክ፣ ያመጣውን የስራ ውጤት ከመቶ (100) እና ደረጃ የያዘ ይፋዊ ሰርትፊኬት ያትሙ።
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <div className="text-xs text-slate-400 font-medium">ሰራተኛ ይምረጡ፡</div>
                <div className="flex gap-2">
                  <select
                    id="select-officer-for-report"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                    onChange={(e) => {
                      const u = users.find((x) => x.id === e.target.value);
                      if (u) onPrintIndividualReport(u);
                    }}
                  >
                    <option value="">-- ሰራተኛ ይምረጡ --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.fullName} ({u.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: COMMISSION SETTINGS & LOGO UPLOAD */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              የኮሚሽኑ ሲስተም ቅንብሮች እና አርማ (Commission Logo & System Settings)
            </h3>
            <p className="text-xs text-slate-400">
              አድሚን በራሱ ዳሽቦርድ ላይ ገብቶ የኮሚሽኑን ሎጎ እንዲያስገባ እና በሎጊን ገጽ ላይም እንዲወጣ ማድረግ ይችላል
            </p>
          </div>

          <form onSubmit={handleSaveSettingsSubmit} className="space-y-6">
            {/* Logo Section */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                የፖሊስ ኮሚሽኑ አርማ (Official Commission Logo)
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="p-3 bg-slate-900 rounded-2xl border-2 border-amber-500/40 text-center shrink-0">
                  <img
                    src={logoInputUrl}
                    alt="Current Logo"
                    className="w-24 h-24 object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">አሁን ያለ አርማ</span>
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      አዲስ አርማ ከኮምፒውተርዎ ይጫኑ (Upload Image File)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 hover:file:bg-amber-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      ወይም የአርማ ምስል ሊንክ ያስገቡ (Image URL)
                    </label>
                    <input
                      type="text"
                      value={logoInputUrl}
                      onChange={(e) => {
                        setLogoInputUrl(e.target.value);
                        setSettingsFormData((prev) => ({ ...prev, logoUrl: e.target.value }));
                      }}
                      placeholder="https://... ወይም data:image/..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ይህ አርማ በሎጊን ገጽ፣ በዋናው ማውጫ፣ በሪፖርቶች እና በሰርትፊኬቱ ላይ ወዲያውኑ ይታያል</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Commission Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የኮሚሽኑ ይፋዊ ስም
                </label>
                <input
                  type="text"
                  value={settingsFormData.commissionName}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, commissionName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የመምሪያ / የስራ ክፍል ስም
                </label>
                <input
                  type="text"
                  value={settingsFormData.departmentName}
                  onChange={(e) =>
                    setSettingsFormData({ ...settingsFormData, departmentName: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            {/* Geofence & Location Settings */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" />
                የጂኦ-አካባቢ (GPS Geofence) እና የርቀት ገደብ
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ዋና መስሪያ ቤት ላቲትዩድ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsFormData.hqLatitude}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, hqLatitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ዋና መስሪያ ቤት ሎንጊትዩድ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={settingsFormData.hqLongitude}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, hqLongitude: parseFloat(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    የተፈቀደ የርቀት ራዲየስ (ሜትር)
                  </label>
                  <input
                    type="number"
                    value={settingsFormData.allowedRadiusMeters}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, allowedRadiusMeters: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsFormData.enforceGeofence}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, enforceGeofence: e.target.checked })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>የ500 ሜትር ርቀት ገደብን አስገድድ (Enforce 500m Geofence)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settingsFormData.enforceDesktopOnly}
                    onChange={(e) =>
                      setSettingsFormData({ ...settingsFormData, enforceDesktopOnly: e.target.checked })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-0"
                  />
                  <span>በኮምፒውተር ላይ ብቻ እንዲሰራ ገድብ (Desktop Only Policy)</span>
                </label>
              </div>
            </div>

            {/* Time Testing Simulation Mode */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-amber-300">
                  የሰዓት መስኮት ሙከራ ሁነታ (Admin Time Testing Bypass)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  ይህ ሲበራ አስተዳዳሪውና ሰራተኞች በማንኛውም ሰዓት የትኛውንም የሰዓት መስኮት መሞከርና መመዝገብ ይችላሉ።
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settingsFormData.timeSimulationEnabled}
                  onChange={(e) =>
                    setSettingsFormData({
                      ...settingsFormData,
                      timeSimulationEnabled: e.target.checked
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition cursor-pointer"
            >
              ቅንብሮችን በፋየር ስቶር አስቀምጥ (Save Settings)
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADD / EDIT OFFICER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 relative">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              {editingUser ? 'የሰራተኛ መረጃ ማስተካከያ' : 'አዲስ ሰራተኛ መመዝገቢያ ፎርም'}
            </h3>

            <form onSubmit={handleSaveUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ማዕረግ (Rank) *
                  </label>
                  <select
                    value={userFormData.rank}
                    onChange={(e) => setUserFormData({ ...userFormData, rank: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  >
                    <option value="ረዳት ሳጅን (Assistant Sergeant)">ረዳት ሳጅን (Assistant Sergeant)</option>
                    <option value="ምክትል ሳጅን (Deputy Sergeant)">ምክትል ሳጅን (Deputy Sergeant)</option>
                    <option value="ዋና ሳጅን (Chief Sergeant)">ዋና ሳጅን (Chief Sergeant)</option>
                    <option value="ረዳት ኢንስፔክተር (Assistant Inspector)">ረዳት ኢንስፔክተር (Assistant Inspector)</option>
                    <option value="ምክትል ኢንስፔክተር (Deputy Inspector)">ምክትል ኢንስፔክተር (Deputy Inspector)</option>
                    <option value="ኢንስፔክተር (Inspector)">ኢንስፔክተር (Inspector)</option>
                    <option value="ዋና ኢንስፔክተር (Chief Inspector)">ዋና ኢንስፔክተር (Chief Inspector)</option>
                    <option value="ኮማንደር (Commander)">ኮማንደር (Commander)</option>
                    <option value="ሲቪል ባለሙያ (Civilian Staff)">ሲቪል ባለሙያ (Civilian Staff)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ሙሉ ስም (Full Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                    placeholder="ምሳሌ፡ አለሙ በቀለ ታደሰ"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የስራ ክፍል (Department)
                  </label>
                  <input
                    type="text"
                    value={userFormData.department}
                    onChange={(e) => setUserFormData({ ...userFormData, department: e.target.value })}
                    placeholder="ምሳሌ፡ የቴክኖሎጂ ማስፋፊያ ክፍል"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የስራ መደብ (Job Position)
                  </label>
                  <input
                    type="text"
                    value={userFormData.position}
                    onChange={(e) => setUserFormData({ ...userFormData, position: e.target.value })}
                    placeholder="ምሳሌ፡ የኔትወርክ አስተዳዳሪ"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ስልክ ቁጥር (Phone)
                  </label>
                  <input
                    type="text"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="0911..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የፖሊስ ባጅ ቁጥር (Badge ID)
                  </label>
                  <input
                    type="text"
                    value={userFormData.badgeNumber}
                    onChange={(e) => setUserFormData({ ...userFormData, badgeNumber: e.target.value })}
                    placeholder="BG-POL-..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Login credentials generation */}
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 space-y-3">
                <div className="text-xs font-bold text-amber-400">የመግቢያ መረጃ (Login Credentials)</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      ዩሰርኔም (Username) *
                    </label>
                    <input
                      type="text"
                      required
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="ምሳሌ፡ alemu"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      የይለፍ ቃል (Password) *
                    </label>
                    <input
                      type="text"
                      required
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder="123"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የመነሻ ውጤት (Efficiency Score 0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={userFormData.efficiencyScore}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, efficiencyScore: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ተጨማሪ ማስታወሻ
                  </label>
                  <input
                    type="text"
                    value={userFormData.additionalNotes}
                    onChange={(e) =>
                      setUserFormData({ ...userFormData, additionalNotes: e.target.value })
                    }
                    placeholder="ልዩ የስራ ሀላፊነት..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow cursor-pointer"
                >
                  {editingUser ? 'መረጃውን አዘምን' : 'መዝግበህ አጽድቅ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE NIGHT DUTY */}
      {showNightDutyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400" />
              የአዳር ተረኝነት ፕሮግራም መመደቢያ
            </h3>

            <form onSubmit={handleSaveNightDutySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ተረኛ ሰራተኛ ምረጥ *
                </label>
                <select
                  value={nightDutyFormData.userId}
                  onChange={(e) => setNightDutyFormData({ ...nightDutyFormData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {users
                    .filter((u) => u.role === 'officer')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.fullName} ({u.department})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የተረኝነት ቀን (Date)
                </label>
                <input
                  type="date"
                  value={nightDutyFormData.shiftDate}
                  onChange={(e) => setNightDutyFormData({ ...nightDutyFormData, shiftDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የመግቢያ ሰዓት (ውሎና አዳር)
                  </label>
                  <input
                    type="text"
                    value={nightDutyFormData.entryTimeWindow}
                    onChange={(e) =>
                      setNightDutyFormData({ ...nightDutyFormData, entryTimeWindow: e.target.value })
                    }
                    placeholder="ጠዋት 2:00 - 2:30"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የሌሊት ቁጥጥር ሰዓት
                  </label>
                  <input
                    type="text"
                    value={nightDutyFormData.nightCheckTimeWindow || 'ሌሊት 9:00 - 9:30'}
                    onChange={(e) =>
                      setNightDutyFormData({ ...nightDutyFormData, nightCheckTimeWindow: e.target.value })
                    }
                    placeholder="ሌሊት 9:00 - 9:30"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    አድሮ መውጫ ሰዓት
                  </label>
                  <input
                    type="text"
                    value={nightDutyFormData.exitTimeWindow}
                    onChange={(e) =>
                      setNightDutyFormData({ ...nightDutyFormData, exitTimeWindow: e.target.value })
                    }
                    placeholder="ጠዋት 2:00"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNightDutyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                >
                  ተረኝነቱን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER LEAVE */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              የሰራተኛ ፈቃድ መመዝገቢያ
            </h3>

            <form onSubmit={handleSaveLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ሰራተኛ ምረጥ *
                </label>
                <select
                  value={leaveFormData.userId}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {users
                    .filter((u) => u.role === 'officer')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የፈቃድ አይነት
                </label>
                <select
                  value={leaveFormData.leaveType}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  <option value="ዓመታዊ ፈቃድ">ዓመታዊ ፈቃድ (Annual Leave)</option>
                  <option value="የህክምና ፈቃድ">የህክምና ፈቃድ (Medical Leave)</option>
                  <option value="አስቸኳይ የግል ፈቃድ">አስቸኳይ የግል ፈቃድ (Emergency Leave)</option>
                  <option value="የወሊድ ፈቃድ">የወሊድ ፈቃድ (Maternity Leave)</option>
                  <option value="የትምህርት ፈቃድ">የትምህርት ፈቃድ (Study Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    መነሻ ቀን
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.startDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ማብቂያ ቀን
                  </label>
                  <input
                    type="date"
                    value={leaveFormData.endDate}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የፈቃድ ምክንያት / ዝርዝር
                </label>
                <input
                  type="text"
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder="የፈቃዱን ምክንያት ያስገቡ..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  ፈቃዱን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REGISTER FIELD DUTY */}
      {showFieldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              የፊልድ እና ከቢሮ ውጭ የስራ ግዳጅ መመዝገቢያ
            </h3>

            <form onSubmit={handleSaveFieldSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የተመደበ ሰራተኛ *
                </label>
                <select
                  value={fieldFormData.userId}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, userId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                >
                  {users
                    .filter((u) => u.role === 'officer')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.rank} {u.fullName}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ወዴት እንደሄዱ (የተላኩበት ቦታ) *
                </label>
                <input
                  type="text"
                  required
                  value={fieldFormData.destination}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, destination: e.target.value })}
                  placeholder="ምሳሌ፡ ባምባሲ ወረዳ፣ ማኦኮሞ፣ ኩርሙክ..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  የወጡበት የስራ ምክንያት *
                </label>
                <input
                  type="text"
                  required
                  value={fieldFormData.reason}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, reason: e.target.value })}
                  placeholder="ምሳሌ፡ የቴክኖሎጂ ሲስተም ዝርጋታ እና ጥገና"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የመነሻ ቀን
                  </label>
                  <input
                    type="date"
                    value={fieldFormData.startDate}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    የመመለሻ ቀን
                  </label>
                  <input
                    type="date"
                    value={fieldFormData.endDate}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFieldModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                >
                  የፊልድ ስራውን መዝግብ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
