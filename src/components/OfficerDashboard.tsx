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

  // Check if assigned to night duty today
  const myNightDutyToday = nightDuties.find(
    (d) => d.userId === currentUser.id && d.shiftDate === todayStr
  );

  // Auto select active slot if available
  useEffect(() => {
    if (slotStatus.activeSlot) {
      setSelectedSlotId(slotStatus.activeSlot.id);
    }
  }, [slotStatus.activeSlot]);

  // Handle Attendance Submission
  const handleCheckIn = async (slotId: string, customType?: string) => {
    setSuccessMessage('');
    setErrorMessage('');

    // Check Geofence constraint if enforced
    if (settings.enforceGeofence && !geofenceStatus.withinFence) {
      setErrorMessage(
        `ከኮሚሽኑ ቅጥር ግቢ 500 ሜትር ራዲየስ ውጪ ስለሆኑ (${geofenceStatus.distanceMeters}m ርቀት) መመዝገብ አይችሉም!`
      );
      return;
    }

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
        note: notes.trim() || undefined,
        location: {
          latitude: geofenceStatus.withinFence ? 10.0658 : 0,
          longitude: geofenceStatus.withinFence ? 34.5385 : 0,
          distanceMeters: geofenceStatus.distanceMeters,
          withinFence: geofenceStatus.withinFence
        },
        timestamp: Date.now()
      };

      await onRecordAttendance(record);
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

  const handleNightDutyCheckIn = async (type: 'in' | 'out') => {
    if (!myNightDutyToday) return;
    setIsSubmitting(true);
    try {
      const updatedDuty: NightDutyShift = {
        ...myNightDutyToday,
        checkedInTime: type === 'in' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : myNightDutyToday.checkedInTime,
        checkedOutTime: type === 'out' ? `${ethTime.formatted} (${now.toLocaleTimeString()})` : myNightDutyToday.checkedOutTime,
        status: type === 'out' ? 'completed' : 'active'
      };
      await onSaveNightDuty(updatedDuty);
      setSuccessMessage(
        type === 'in'
          ? 'የአዳር ተረኝነት መግቢያ ሰዓት ተመዝግቧል!'
          : 'የአዳር ተረኝነት ስራ መውጫ ሰዓት ተመዝግቧል!'
      );
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
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
              ርቀት፡ {geofenceStatus.distanceMeters}m / 500m
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

      {/* Official 5 Time Slots Registration Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              የዕለት መደበኛ የስራ ሰዓት መቆጣጠሪያ ሰሌዳ
            </h3>
            <p className="text-xs text-slate-400">
              በተጠቀሰው ሰዓት ብቻ ይሰራል፤ ሰዓቱ ሲያልቅ ሲስተሙ ይዘጋል። ሰዓቱ ሲደርስ መዝግበው ይግቡ/ይውጡ።
            </p>
          </div>

          {settings.timeSimulationEnabled && (
            <span className="text-xs px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              የሙከራ ሰዓት ሁነታ በርቷል (Admin Test Mode)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {OFFICIAL_SLOTS.map((slot) => {
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
                      {slot.type === 'check_in'
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
                  <p className="text-[11px] text-slate-400 mb-4">{slot.description}</p>
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
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isActive ? 'መዝግበህ ግባ / ውጣ' : 'ሰዓቱ አልደረሰም'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Night Duty Shift and Occurrence Logbook (If Assigned) */}
      {myNightDutyToday ? (
        <div className="bg-slate-900 border-2 border-indigo-900/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  የአዳር ተረኝነት ፕሮግራም እና የእለት ክስተቶች ሪፖርት
                </h3>
                <p className="text-xs text-slate-400">
                  ዛሬ አዳር ተረኛ ስለሆኑ የስራ መግቢያና መውጫ ሰዓትዎን እና ያጋጠሙ ክስተቶችን ይመዝግቡ
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              ተረኛ ኦፊሰር
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shift hours details */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-2 text-xs">
              <div className="text-slate-300 font-semibold mb-2">የአዳር ተረኝነት የሰዓት ሰሌዳ፡</div>
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">መግቢያ ሰዓት፡</span>
                <span className="text-amber-300 font-bold">{myNightDutyToday.entryTimeWindow}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700">
                <span className="text-slate-400">መውጫ ሰዓት፡</span>
                <span className="text-amber-300 font-bold">{myNightDutyToday.exitTimeWindow}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">የተመዘገበበት መግቢያ፡</span>
                <span className="text-emerald-400 font-mono">
                  {myNightDutyToday.checkedInTime || 'ገና አልተመዘገበም'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">የተመዘገበበት መውጫ፡</span>
                <span className="text-emerald-400 font-mono">
                  {myNightDutyToday.checkedOutTime || 'ገና አልተመዘገበም'}
                </span>
              </div>

              {/* Night check-in and check-out buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  id="btn-night-duty-in"
                  disabled={isSubmitting || !!myNightDutyToday.checkedInTime}
                  onClick={() => handleNightDutyCheckIn('in')}
                  className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {myNightDutyToday.checkedInTime ? '✓ አዳር ገብቻለሁ' : 'አዳር ግባ (Check-In)'}
                </button>
                <button
                  id="btn-night-duty-out"
                  disabled={isSubmitting || !!myNightDutyToday.checkedOutTime}
                  onClick={() => handleNightDutyCheckIn('out')}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                >
                  {myNightDutyToday.checkedOutTime ? '✓ አዳር ወጥቻለሁ' : 'አዳር ውጣ (Check-Out)'}
                </button>
              </div>
            </div>

            {/* Night incident and occurrence reporting */}
            <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="text-slate-300 font-semibold text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                የእለት ክስተቶችና የጥበቃ ሪፖርት መመዝገቢያ (Logbook)
              </div>
              <textarea
                value={incidentReport || myNightDutyToday.incidentReport || ''}
                onChange={(e) => setIncidentReport(e.target.value)}
                placeholder="በስራው ወቅት ያጋጠሙ ክስተቶች፣ ልዩ ሁኔታዎች ወይም የተከናወኑ ዙሮች ካሉ እዚህ ይፃፉ..."
                className="w-full h-20 p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                id="btn-save-night-log"
                disabled={isSubmitting}
                onClick={handleSaveNightDutyLog}
                className="w-full py-2 px-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                የእለት ሪፖርቱን በፋየር ስቶር አስቀምጥ
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
