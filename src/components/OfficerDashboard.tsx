import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShieldCheck,
  Moon,
  FileText,
  Award,
  MapPin,
  Send,
  HelpCircle,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User, AttendanceRecord, NightDutyShift, CommissionSettings } from '../types';
import { OFFICIAL_SLOTS, toEthiopianDate, toEthiopianTime, getSlotStatus } from '../lib/ethiopianCalendar';

interface OfficerDashboardProps {
  currentUser: User;
  settings: CommissionSettings;
  attendanceRecords: AttendanceRecord[];
  nightDuties: NightDutyShift[];
  onRecordAttendance: (record: AttendanceRecord) => Promise<void>;
  onSaveNightDuty: (duty: NightDutyShift) => Promise<void>;
  onViewCertificate: (user: User) => void;
  geofenceStatus: {
    withinFence: boolean;
    distanceMeters: number;
    error?: string;
  };
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  currentUser,
  settings,
  attendanceRecords,
  nightDuties,
  onRecordAttendance,
  onSaveNightDuty,
  onViewCertificate,
  geofenceStatus
}) => {
  const [now, setNow] = useState(new Date());
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Night duty incident report form state
  const [incidentReport, setIncidentReport] = useState('');
  const [patrolNotes, setPatrolNotes] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [slotCategory, setSlotCategory] = useState<'all' | 'regular' | 'duty'>('all');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ethDate = toEthiopianDate(now);
  const ethTime = toEthiopianTime(now);
  const slotStatus = getSlotStatus(now);

  // Today's date string YYYY-MM-DD
  const todayStr = now.toISOString().split('T')[0];

  // Filter records belonging to THIS officer only
  const myRecords = attendanceRecords.filter((r) => r.userId === currentUser.id);
  const todayMyRecords = myRecords.filter((r) => r.date === todayStr);

  // Check if assigned to 24-hr duty today or active
  const myNightDutyToday = nightDuties.find(
    (d) => d.userId === currentUser.id && (d.shiftDate === todayStr || d.status === 'active' || d.status === 'scheduled')
  );

  // Auto select active slot if available
  useEffect(() => {
    if (slotStatus.activeSlot) {
      setSelectedSlotId(slotStatus.activeSlot.id);
    }
  }, [slotStatus.activeSlot]);

  // Handle Attendance Submission from Official Slots Grid
  const handleCheckIn = async (slotId: string, customType?: string) => {
    setSuccessMessage('');
    setErrorMessage('');

    const slot = OFFICIAL_SLOTS.find((s) => s.id === slotId);
    if (!slot) return;

    // Check if slot is active (unless time simulation is on)
    const isSlotCurrentlyActive = slotStatus.activeSlot?.id === slot.id || settings.timeSimulationEnabled;

    if (!isSlotCurrentlyActive) {
      setErrorMessage(
        `ይህ የሰዓት መስኮት (${slot.name} - ${slot.ethiopianTime}) አሁን ክፍት አይደለም! ሰዓቱ ሲደርስ ሲስተሙ መስራት ይጀምራል።`
      );
      return;
    }

    // MANDATORY VALIDATION: If this is duty exit (አድሮ መውጫ ጠዋት 2:00), an incident report is strictly mandatory!
    if (slot.id === 'duty_exit') {
      const reportContent = incidentReport.trim() || myNightDutyToday?.incidentReport?.trim() || notes.trim();
      if (!reportContent || reportContent.length < 5) {
        setErrorMessage(
          'ውሎ እና አደር ያደረ ተረኛ አድሮ መውጫ ሞልቶ ሲወጣ ሪፖርት ፅፎ መውጣት ግዴታ ነው! ካለበለዚያ መመዝገብ እንዳይችል ተከልክሏል። እባክዎ የእለት ክስተቶችና የርክክብ ሪፖርትዎን አስቀድመው ይፃፉ።'
        );
        return;
      }
    }

    // Check if already checked in for this slot today
    const alreadyRecorded = todayMyRecords.some((r) => r.slotId === slot.id);
    if (alreadyRecorded) {
      setErrorMessage(`ለዚህ ሰዓት (${slot.name}) አስቀድመው መዝግበዋል!`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine on-time or late status
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = slot.startHour * 60 + slot.startMinute;
      const isLate = nowMinutes > startMinutes + 5; // 5 min grace

      const recordNote = slot.id === 'duty_exit'
        ? `የውሎና አዳር ሪፖርት፡ ${incidentReport.trim() || myNightDutyToday?.incidentReport || notes.trim()}`
        : notes.trim() || undefined;

      const record: AttendanceRecord = {
        id: `att_${currentUser.id}_${slot.id}_${Date.now()}`,
        userId: currentUser.id,
        officerName: currentUser.fullName,
        rank: currentUser.rank,
        department: currentUser.department,
        date: todayStr,
        ethiopianDate: ethDate.formatted,
        slotId: slot.id,
        slotName: slot.name,
        ethiopianTimeWindow: slot.ethiopianTime,
        timeIn: now.toTimeString().split(' ')[0],
        ethiopianTimeIn: ethTime.formatted,
        status: isLate ? 'late' : 'on_time',
        note: recordNote,
        isNightShift: slot.isDutySlot,
        location: {
          latitude: 10.0658,
          longitude: 34.5385,
          distanceMeters: 0,
          withinFence: true
        },
        timestamp: Date.now()
      };

      await onRecordAttendance(record);

      // If this was a duty slot, also sync the NightDutyShift record
      if (slot.id === 'duty_entry' || slot.id === 'duty_night_check' || slot.id === 'duty_exit') {
        const duty = myNightDutyToday || {
          id: `nd_${currentUser.id}_${todayStr}`,
          userId: currentUser.id,
          officerName: currentUser.fullName,
          rank: currentUser.rank,
          department: currentUser.department,
          shiftDate: todayStr,
          ethiopianDate: ethDate.formatted,
          shiftType: '24hr_duty' as const,
          entryTimeWindow: 'ጠዋት 2:00 - 2:30',
          nightCheckTimeWindow: 'ሌሊት 9:00 - 9:30',
          exitTimeWindow: 'ጠዋት 2:00',
          status: 'active' as const,
          incidentReport: '',
          createdAt: new Date().toISOString()
        };

        const updatedDuty: NightDutyShift = {
          ...duty,
          checkedInTime: slot.id === 'duty_entry' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.checkedInTime,
          nightCheckedTime: slot.id === 'duty_night_check' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.nightCheckedTime,
          checkedOutTime: slot.id === 'duty_exit' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.checkedOutTime,
          incidentReport: slot.id === 'duty_exit' ? (incidentReport.trim() || notes.trim() || duty.incidentReport || '') : duty.incidentReport,
          status: slot.id === 'duty_exit' ? 'completed' : 'active'
        };
        await onSaveNightDuty(updatedDuty);
      }

      setNotes('');
      setSuccessMessage(
        `ምዝገባው በተሳካ ሁኔታ ተጠናቋል! ቀን፡ ${ethDate.formatted} | ሰዓት፡ ${ethTime.formatted} (${slot.name})`
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e: any) {
      setErrorMessage('የምዝገባ ስህተት አጋጥሟል፤ እባክዎ እንደገና ይሞክሩ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Night Duty Incident Report Submission
  const handleSaveNightDutyLog = async () => {
    if (!myNightDutyToday) return;

    setIsSubmitting(true);
    try {
      const updatedDuty: NightDutyShift = {
        ...myNightDutyToday,
        incidentReport: incidentReport || myNightDutyToday.incidentReport,
        patrolNotes: patrolNotes || myNightDutyToday.patrolNotes,
        handoverNotes: handoverNotes || myNightDutyToday.handoverNotes,
        status: myNightDutyToday.checkedOutTime ? 'completed' : 'active'
      };

      await onSaveNightDuty(updatedDuty);
      setSuccessMessage('የእለት ክስተቶችና ዙር ሪፖርት በተሳካ ሁኔታ በፋየር ስቶር ተመዝግቧል!');
    } catch (err) {
      setErrorMessage('የአዳር ተረኛ ሪፖርት ማስቀመጥ አልተቻለም');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 24-hr Duty Action: In (ጠዋት 2:00 - 2:30), Night Check (ሌሊት 9:00 - 9:30), Out (ጠዋት 2:00 + Mandatory Report)
  const handleNightDutyCheckIn = async (type: 'in' | 'night_check' | 'out') => {
    setSuccessMessage('');
    setErrorMessage('');

    // Ensure a duty object exists
    const duty: NightDutyShift = myNightDutyToday || {
      id: `nd_${currentUser.id}_${todayStr}`,
      userId: currentUser.id,
      officerName: currentUser.fullName,
      rank: currentUser.rank,
      department: currentUser.department,
      shiftDate: todayStr,
      ethiopianDate: ethDate.formatted,
      shiftType: '24hr_duty',
      entryTimeWindow: 'ጠዋት 2:00 - 2:30',
      nightCheckTimeWindow: 'ሌሊት 9:00 - 9:30',
      exitTimeWindow: 'ጠዋት 2:00',
      status: 'active',
      incidentReport: '',
      createdAt: new Date().toISOString()
    };

    // CRITICAL USER CONSTRAINT:
    // "ዉሎ እና ኣደር ያደረ ተረኛ አድሮ መዉጪያ ሞልቶ ሲወጣ ሪፖርት ፅፎ እእዲወጣ አድርግ ካለበለዚያ መመዝገብ እንዳይችል አድርግ"
    if (type === 'out') {
      const reportContent = incidentReport.trim() || duty.incidentReport?.trim();
      if (!reportContent || reportContent.length < 5) {
        setErrorMessage(
          'ውሎ እና አደር ያደረ ተረኛ አድሮ መውጫ ሞልቶ ሲወጣ ሪፖርት ፅፎ መውጣት ግዴታ ነው! ካለበለዚያ መመዝገብ እንዳይችል ተከልክሏል። እባክዎ የእለት ክስተቶችና የርክክብ ሪፖርትዎን ከታች ባለው ሳጥን ይፃፉ።'
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const reportText = incidentReport.trim() || duty.incidentReport || '';
      const updatedDuty: NightDutyShift = {
        ...duty,
        checkedInTime: type === 'in' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.checkedInTime,
        nightCheckedTime: type === 'night_check' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.nightCheckedTime,
        checkedOutTime: type === 'out' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : duty.checkedOutTime,
        incidentReport: reportText,
        patrolNotes: patrolNotes.trim() || duty.patrolNotes || '',
        handoverNotes: handoverNotes.trim() || duty.handoverNotes || '',
        status: type === 'out' ? 'completed' : 'active'
      };
      await onSaveNightDuty(updatedDuty);

      // Record in attendance history as well
      const slotName =
        type === 'in'
          ? 'ቀጣይ ውሎና አዳር ተረኛ መግቢያ (ጠዋት 2:00 - 2:30)'
          : type === 'night_check'
          ? 'የውሎና አዳር ሌሊት ቁጥጥር (ሌሊት 9:00 - 9:30)'
          : 'የውሎና አዳር አድሮ መውጫ (ጠዋት 2:00)';

      const attRecord: AttendanceRecord = {
        id: `att_${currentUser.id}_duty_${type}_${Date.now()}`,
        userId: currentUser.id,
        officerName: currentUser.fullName,
        rank: currentUser.rank,
        department: currentUser.department,
        date: todayStr,
        ethiopianDate: ethDate.formatted,
        slotId: type === 'in' ? 'duty_entry' : type === 'night_check' ? 'duty_night_check' : 'duty_exit',
        slotName,
        ethiopianTimeWindow: type === 'in' ? 'ጠዋት 2:00 - 2:30' : type === 'night_check' ? 'ሌሊት 9:00 - 9:30' : 'ጠዋት 2:00',
        timeIn: now.toTimeString().split(' ')[0],
        ethiopianTimeIn: ethTime.formatted,
        status: 'on_time',
        isNightShift: true,
        note: type === 'out' ? `የተረኛ ማጠቃለያ ሪፖርት፡ ${reportText}` : type === 'night_check' ? 'የሌሊት 9:00 - 9:30 ዙር ቁጥጥር ተረጋግጧል' : 'ቀጣይ ውሎና አዳር ስራ መግቢያ',
        location: {
          latitude: 10.0658,
          longitude: 34.5385,
          distanceMeters: 0,
          withinFence: true
        },
        timestamp: Date.now()
      };
      await onRecordAttendance(attRecord);

      setSuccessMessage(
        type === 'in'
          ? 'የቀጣይ ውሎና አዳር ተረኝነት መግቢያ ሰዓት (ጠዋት 2:00 - 2:30) ተመዝግቧል!'
          : type === 'night_check'
          ? 'የውሎና አዳር የሌሊት 9:00 - 9:30 ሰዓት ቁጥጥርና የዙር ፍተሻ ተመዝግቧል!'
          : 'የውሎና አዳር አድሮ መውጫ ሰዓት (ጠዋት 2:00) ከተረኛ ሪፖርት ጋር በተሳካ ሁኔታ ተመዝግቧል!'
      );

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e: any) {
      setErrorMessage('የተረኝነት ምዝገባ ስህተት አጋጥሟል፤ እባክዎ እንደገና ይሞክሩ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Officer Welcome & Summary Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner shrink-0">
              {currentUser.rank.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                  ተጠቃሚ ሰራተኛ (Police Officer)
                </span>
                <span className="text-xs text-slate-400">
                  መለያ ቁጥር፡ {currentUser.badgeNumber}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {currentUser.rank} {currentUser.fullName}
              </h2>
              <p className="text-sm text-slate-400 mt-0.5">
                {currentUser.department} • {currentUser.position}
              </p>
            </div>
          </div>

          {/* Efficiency Score Card & Certificate Quick Button */}
          <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-xl border border-slate-700/80">
            <div className="text-center pr-4 border-r border-slate-700">
              <div className="text-[11px] text-slate-400 font-medium">የስራ ውጤት (Efficiency)</div>
              <div className="text-2xl font-black text-amber-400">
                {currentUser.efficiencyScore ?? 92}<span className="text-xs text-slate-400 font-normal">/100</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-semibold">
                {currentUser.rankTier ?? 'እጅግ የላቀ (A+)'}
              </div>
            </div>

            <button
              id="btn-view-my-certificate"
              onClick={() => onViewCertificate(currentUser)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/40 transition-colors cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>የምስክር ወረቀት (Certificate) እይ</span>
            </button>
          </div>
        </div>

        {/* Live Ethiopian Clock Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-white">{ethDate.formatted}</span>
            <span className="text-slate-500">|</span>
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-300 text-sm">{ethTime.formatted}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300">
              ቦታ፡ <strong>ቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን (አሶሳ)</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-[11px] text-emerald-300 border border-emerald-800 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              የኪሎሜትር ገደብ፡ ተነስቷል (ክፍት ነው)
            </span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-800 text-red-200 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Time Slots Registration Grid with Filter Tabs */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              የዕለት የስራ እና የተረኝነት ሰዓት መቆጣጠሪያ ሰሌዳ
            </h3>
            <p className="text-xs text-slate-400">
              ጠዋት የሻይ እረፍት ከ3፡55 እስከ 4፡35 | ውሎና አዳር ጠዋት 2:00 - 2:30 መግቢያ፣ ሌሊት 9:00 - 9:30 ቁጥጥር እና ጠዋት 2:00 መውጫ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="filter-all-slots"
              onClick={() => setSlotCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                slotCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ሁሉም የሰዓት መስኮቶች ({OFFICIAL_SLOTS.length})
            </button>
            <button
              id="filter-regular-slots"
              onClick={() => setSlotCategory('regular')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                slotCategory === 'regular'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              መደበኛ ስራ (5 መስኮቶች)
            </button>
            <button
              id="filter-duty-slots"
              onClick={() => setSlotCategory('duty')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                slotCategory === 'duty'
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              ውሎና አዳር 24 ሰዓት (3 መስኮቶች)
            </button>
            {settings.timeSimulationEnabled && (
              <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                የሙከራ ሰዓት ሁነታ በርቷል
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {OFFICIAL_SLOTS.filter((s) => {
            if (slotCategory === 'regular') return s.dutyShiftType === 'regular' || !s.isDutySlot;
            if (slotCategory === 'duty') return s.isDutySlot || s.dutyShiftType === '24hr_duty';
            return true;
          }).map((slot) => {
            const isRecorded = todayMyRecords.some((r) => r.slotId === slot.id);
            const recordedData = todayMyRecords.find((r) => r.slotId === slot.id);
            const isActive = slotStatus.activeSlot?.id === slot.id || settings.timeSimulationEnabled;

            return (
              <div
                key={slot.id}
                className={`rounded-2xl p-5 border transition-all relative flex flex-col justify-between ${
                  isRecorded
                    ? 'bg-emerald-950/20 border-emerald-700/60 shadow-md'
                    : isActive
                    ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                    : 'bg-slate-900/60 border-slate-800 opacity-80'
                }`}
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {slot.isDutySlot
                        ? 'ውሎና አዳር (24 ሰዓት)'
                        : slot.type === 'check_in'
                        ? 'መግቢያ'
                        : slot.type === 'check_out'
                        ? 'መውጫ'
                        : 'እረፍት'}
                    </span>

                    {isRecorded ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ተመዝግቧል
                      </span>
                    ) : isActive ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-400" /> አሁን ክፍት ነው
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium">
                        የተዘጋ
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-white text-sm mb-1">{slot.name}</h4>
                  <div className="text-amber-400 text-xs font-semibold mb-2 flex items-center gap-1">
                    <Timer className="w-3.5 h-3.5" />
                    {slot.ethiopianTime}
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{slot.description}</p>

                  {slot.id === 'duty_exit' && (
                    <div className="mb-3 p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 text-[10px] text-amber-300 font-semibold">
                      ⚠️ ሪፖርት ፅፎ መውጣት ግዴታ ነው፤ ካልተጻፈ መመዝገብ አይቻልም
                    </div>
                  )}
                </div>

                <div>
                  {isRecorded ? (
                    <div className="bg-emerald-900/40 rounded-xl p-2.5 border border-emerald-700/40 text-[11px] text-emerald-200">
                      <div className="font-semibold">የተመዘገበበት ሰዓት፡</div>
                      <div className="font-mono text-xs text-white mt-0.5">
                        {recordedData?.ethiopianTimeIn} ({recordedData?.timeIn})
                      </div>
                      <div className="text-[10px] text-emerald-300 mt-1">
                        ሁኔታ፡ {recordedData?.status === 'late' ? 'ዘግይቶ ገብቷል' : 'በሰዓቱ ገብቷል'}
                      </div>
                    </div>
                  ) : (
                    <button
                      id={`btn-clock-${slot.id}`}
                      disabled={!isActive || isSubmitting}
                      onClick={() => handleCheckIn(slot.id)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isActive
                          ? slot.id === 'duty_exit'
                            ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-md'
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isActive
                        ? slot.id === 'duty_exit'
                          ? 'አድሮ መውጫ መዝግብ (ከሪፖርት ጋር)'
                          : 'መዝግበህ ግባ / ውጣ'
                        : 'ሰዓቱ አልደረሰም'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated 24-Hour Duty Shift and Mandatory Logbook Panel */}
      <div className="bg-slate-900 border-2 border-indigo-900/70 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <Moon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                የውሎ እና አዳር (24 ሰዓት) ተረኝነት እና የሰዓት ቁጥጥር ሰሌዳ
              </h3>
              <p className="text-xs text-slate-400">
                ከመደበኛ ስራው የተለየ አዳርና ውሎ ለሚመደቡ ሰራተኞች የተዘጋጀ ልዩ የሰዓት ቁጥጥር እና የግዴታ ሪፖርት ማቅረቢያ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              {myNightDutyToday?.checkedOutTime ? 'ተረኝነቱ ተጠናቋል' : 'ተረኛ ኦፊሰር'}
            </span>
          </div>
        </div>

        {/* 3 Step Action Windows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Step 1: Entry Window (ጠዋት 2:00 - 2:30) */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-slate-700 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  ደረጃ 1፡ መግቢያ
                </span>
                <span className="text-amber-400 font-bold text-xs">ጠዋት 2:00 - 2:30</span>
              </div>
              <h4 className="font-bold text-white text-xs mb-1">ቀጣይ ውሎና አዳር ተረኛ መግቢያ</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                የቀጣዩ ቀን ውሎና አዳር ተረኛ ወደ ስራ የሚገባበት ሰዓት
              </p>
              <div className="text-[11px] text-slate-300 py-1 border-t border-slate-700 mb-3">
                <span className="text-slate-400">የተመዘገበበት ሰዓት፡ </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {myNightDutyToday?.checkedInTime || 'ገና አልተመዘገበም'}
                </span>
              </div>
            </div>

            <button
              id="btn-night-duty-in"
              disabled={isSubmitting || !!myNightDutyToday?.checkedInTime}
              onClick={() => handleNightDutyCheckIn('in')}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                myNightDutyToday?.checkedInTime
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              {myNightDutyToday?.checkedInTime ? '✓ መግቢያ ተመዝግቧል' : 'ቀጣይ ውሎና አዳር ግባ (2:00 - 2:30)'}
            </button>
          </div>

          {/* Step 2: Night Inspection (ሌሊት 9:00 - 9:30) */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-purple-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  ደረጃ 2፡ የሌሊት ቁጥጥር
                </span>
                <span className="text-purple-300 font-bold text-xs">ሌሊት 9:00 - 9:30</span>
              </div>
              <h4 className="font-bold text-white text-xs mb-1">የሌሊት ሰዓት ቁጥጥር እና የዙር ፍተሻ</h4>
              <p className="text-[11px] text-slate-400 mb-3">
                በሌሊት 9:00 - 9:30 ተረኛው የጣቢያውንና የቢሮውን ፀጥታ አረጋግጦ ይመዘግባል
              </p>
              <div className="text-[11px] text-slate-300 py-1 border-t border-slate-700 mb-3">
                <span className="text-slate-400">የተመዘገበበት ሰዓት፡ </span>
                <span className="font-mono text-purple-400 font-bold">
                  {myNightDutyToday?.nightCheckedTime || 'ገና አልተመዘገበም'}
                </span>
              </div>
            </div>

            <button
              id="btn-night-duty-check"
              disabled={isSubmitting || !!myNightDutyToday?.nightCheckedTime}
              onClick={() => handleNightDutyCheckIn('night_check')}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                myNightDutyToday?.nightCheckedTime
                  ? 'bg-slate-800 text-purple-400 border border-purple-800'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
              }`}
            >
              <Moon className="w-4 h-4" />
              {myNightDutyToday?.nightCheckedTime
                ? '✓ ሌሊት 9:00-9:30 ተረጋግጧል'
                : 'የሌሊት 9:00 - 9:30 ቁጥጥር መዝግብ'}
            </button>
          </div>

          {/* Step 3: Exit Window (ጠዋት 2:00) + MANDATORY REPORT */}
          <div className="bg-slate-800/90 rounded-xl p-4 border border-emerald-900/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ደረጃ 3፡ አድሮ መውጫ
                </span>
                <span className="text-amber-400 font-bold text-xs">ጠዋት 2:00</span>
              </div>
              <h4 className="font-bold text-white text-xs mb-1">የውሎ እና አዳር አድሮ መውጫ</h4>
              <p className="text-[11px] text-slate-400 mb-2">
                ውሎና አዳር ያደረ ተረኛ ሪፖርት ፅፎ የሚወጣበት የሰዓት መስኮት
              </p>

              {/* Mandatory Requirement Alert */}
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200 mb-2 font-medium">
                ⚠️ <strong>ግዴታ፡</strong> አድሮ መውጫ ሞልቶ ሲወጣ ሪፖርት መፃፍ አለበት፤ ካለበለዚያ መመዝገብ እንዳይችል ተከልክሏል።
              </div>

              <div className="text-[11px] text-slate-300 py-1 border-t border-slate-700 mb-3">
                <span className="text-slate-400">የተመዘገበበት ሰዓት፡ </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {myNightDutyToday?.checkedOutTime || 'ገና አልተመዘገበም'}
                </span>
              </div>
            </div>

            {/* Check-Out Button: Strictly disabled or validates mandatory report */}
            <button
              id="btn-night-duty-out"
              disabled={
                isSubmitting ||
                !!myNightDutyToday?.checkedOutTime ||
                (!incidentReport.trim() && !myNightDutyToday?.incidentReport?.trim())
              }
              onClick={() => handleNightDutyCheckIn('out')}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                myNightDutyToday?.checkedOutTime
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-800 cursor-default'
                  : (!incidentReport.trim() && !myNightDutyToday?.incidentReport?.trim())
                  ? 'bg-red-950/60 text-red-300 border border-red-800/80 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg ring-2 ring-emerald-400/40'
              }`}
            >
              <Send className="w-4 h-4" />
              {myNightDutyToday?.checkedOutTime
                ? '✓ አድሮ ወጥቻለሁ (ተጠናቋል)'
                : (!incidentReport.trim() && !myNightDutyToday?.incidentReport?.trim())
                ? '🔒 ሪፖርት ሳትጽፉ መውጣት አይቻልም'
                : '✓ አድሮ ውጣ (ሪፖርት ተያይዟል)'}
            </button>
          </div>
        </div>

        {/* Mandatory Incident & Handover Report Box */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>የውሎና አዳር የእለት ክስተቶች፣ የጥበቃ ሁኔታ እና የስራ ርክክብ ሪፖርት</span>
              <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                መውጫ ከመመዝገቡ በፊት መፃፍ ግዴታ ነው
              </span>
            </div>

            <div className="text-xs">
              {(incidentReport.trim() || myNightDutyToday?.incidentReport?.trim()) ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ሪፖርት ተዘጋጅቷል፤ አሁን መውጫ መመዝገብ ይችላሉ
                </span>
              ) : (
                <span className="text-red-400 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> ሪፖርት ገና አልተጻፈም
                </span>
              )}
            </div>
          </div>

          {/* Quick preset templates */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">ፈጣን አብነቶች፡</span>
            <button
              type="button"
              onClick={() =>
                setIncidentReport('በተረኝነት ሰዓት የተረጋጋ ሰላማዊ አዳር ነበር፤ ምንም ዓይነት የፀጥታ ችግር አላጋጠመም፤ ሙሉ ንብረትና ሰነድ በሰላም ለተረኛ ተላልፏል።')
              }
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              + ሰላማዊ አዳር ነበር
            </button>
            <button
              type="button"
              onClick={() =>
                setIncidentReport('የሌሊት 9:00 - 9:30 ዙር ፍተሻ ተካሂዷል፤ የጣቢያው እና የቢሮዎች ጥበቃ ተረጋግጦ በሰላም በርክክብ ተላልፏል።')
              }
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              + የሌሊት ዙር ፍተሻ ተካሂዷል
            </button>
            <button
              type="button"
              onClick={() =>
                setIncidentReport('የተጠርጣሪዎች ቁጥጥርና የጣቢያው ጥበቃ ስራ በሙሉ ተከናውኗል፤ የተለየ ክስተት የለም።')
              }
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            >
              + የተጠርጣሪዎችና የጣቢያ ጥበቃ
            </button>
          </div>

          <textarea
            id="incident-report-textarea"
            value={incidentReport || myNightDutyToday?.incidentReport || ''}
            onChange={(e) => setIncidentReport(e.target.value)}
            placeholder="የእለት ክስተቶችን፣ የጥበቃ ሁኔታዎችን እና ለቀጣይ ተረኛ የሚተላለፍ የርክክብ ማስታወሻ እዚህ ይፃፉ... (ይህ ሪፖርት ካልተጻፈ አድሮ መውጣት አይቻልም)"
            className="w-full h-24 p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-400">
              ይህ ሪፖርት በፋየር ስቶር እና በኮሚሽኑ ማዕከላዊ ሰርቨር ላይ በቋሚነት ይመዘገባል።
            </span>
            <button
              id="btn-save-night-log"
              disabled={isSubmitting}
              onClick={handleSaveNightDutyLog}
              className="py-2 px-4 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              ሪፖርቱን አስቀምጥ (Save Draft)
            </button>
          </div>
        </div>
      </div>

      {/* Officer's Personal Attendance History & Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              የግል የሰዓት ምዝገባ ማህደር ታሪክ ({currentUser.fullName})
            </h3>
            <p className="text-xs text-slate-400">
              እርስዎ ብቻ የሚያዩት የግል የስራ መግቢያና መውጫ የሰዓት መረጃ
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
            አጠቃላይ ምዝገባዎች፡ {myRecords.length}
          </span>
        </div>

        {myRecords.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
            እስካሁን የተመዘገበ የስራ ሰዓት መረጃ የለም። የሰዓት መስኮቱ ሲደርስ ከላይ ባለው ሰሌዳ ላይ ይመዝገቡ።
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">ቀን (የኢትዮጵያ)</th>
                  <th className="px-4 py-3">የሰዓት መስኮት</th>
                  <th className="px-4 py-3">የተመዘገበበት ሰዓት</th>
                  <th className="px-4 py-3">ሁኔታ</th>
                  <th className="px-4 py-3">የመገኛ ሁኔታ (GPS)</th>
                  <th className="px-4 py-3 rounded-r-lg">ማስታወሻ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {myRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">
                      {rec.ethiopianDate}
                    </td>
                    <td className="px-4 py-3 text-amber-300 font-semibold">
                      {rec.slotName}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {rec.ethiopianTimeIn} ({rec.timeIn})
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                          rec.status === 'on_time'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                            : rec.status === 'late'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800'
                            : 'bg-red-950/60 text-red-300 border border-red-800'
                        }`}
                      >
                        {rec.status === 'on_time'
                          ? 'በሰዓቱ ተገኝቷል'
                          : rec.status === 'late'
                          ? 'ዘግይቶ ገብቷል'
                          : 'ቀሪ'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      <div className="flex items-center gap-1 text-emerald-400">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>በኮሚሽኑ ቅጥር ግቢ</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 italic">
                      {rec.note || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
