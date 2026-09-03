import React, { useState, useEffect } from 'react';
import {
  User,
  AttendanceRecord,
  NightDutyShift,
  FieldDuty,
  LeaveRecord,
  CommissionSettings
} from './types';
import {
  StorageService,
  DEFAULT_SETTINGS,
  INITIAL_USERS,
  testFirebaseConnection
} from './lib/firebase';
import { verifyGeofence, GeofenceResult } from './lib/geofence';
import { DesktopGuard } from './components/DesktopGuard';
import { Header } from './components/Header';
import { LoginModal } from './components/LoginModal';
import { OfficerDashboard } from './components/OfficerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CertificateModal } from './components/CertificateModal';
import { ConsolidatedReportModal, IndividualReportModal } from './components/PrintReports';
import { NavigationScrollControls } from './components/NavigationScrollControls';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [nightDuties, setNightDuties] = useState<NightDutyShift[]>([]);
  const [fieldDuties, setFieldDuties] = useState<FieldDuty[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [settings, setSettings] = useState<CommissionSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [certificateUser, setCertificateUser] = useState<User | null>(null);
  const [showConsolidatedReport, setShowConsolidatedReport] = useState(false);
  const [individualReportUser, setIndividualReportUser] = useState<User | null>(null);

  // Geofence status
  const [geofenceStatus, setGeofenceStatus] = useState<GeofenceResult>({
    latitude: DEFAULT_SETTINGS.hqLatitude,
    longitude: DEFAULT_SETTINGS.hqLongitude,
    distanceMeters: 18,
    withinFence: true
  });

  // Load initial data from Firebase/Storage
  useEffect(() => {
    async function initData() {
      setIsLoading(true);
      try {
        await testFirebaseConnection();
        const loadedSettings = await StorageService.getSettings();
        setSettings(loadedSettings);

        const loadedUsers = await StorageService.getUsers();
        setUsers(loadedUsers);

        const loadedAttendance = await StorageService.getAttendanceRecords();
        setAttendanceRecords(loadedAttendance);

        const loadedNight = await StorageService.getNightDuties();
        setNightDuties(loadedNight);

        const loadedField = await StorageService.getFieldDuties();
        setFieldDuties(loadedField);

        const loadedLeaves = await StorageService.getLeaves();
        setLeaves(loadedLeaves);

        // Verify Geolocation with loaded settings
        const geo = await verifyGeofence(
          loadedSettings.hqLatitude,
          loadedSettings.hqLongitude,
          loadedSettings.allowedRadiusMeters
        );
        setGeofenceStatus(geo);
      } catch (err) {
        console.error('Initialization error', err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Periodic GPS geofence re-check every 30 seconds
  useEffect(() => {
    const geoTimer = setInterval(async () => {
      const geo = await verifyGeofence(
        settings.hqLatitude,
        settings.hqLongitude,
        settings.allowedRadiusMeters
      );
      setGeofenceStatus(geo);
    }, 30000);
    return () => clearInterval(geoTimer);
  }, [settings.hqLatitude, settings.hqLongitude, settings.allowedRadiusMeters]);

  // Attendance recording handler
  const handleRecordAttendance = async (record: AttendanceRecord) => {
    await StorageService.recordAttendance(record);
    const updated = await StorageService.getAttendanceRecords();
    setAttendanceRecords(updated);
  };

  // User management handlers
  const handleSaveUser = async (user: User) => {
    await StorageService.saveUser(user);
    const updated = await StorageService.getUsers();
    setUsers(updated);
  };

  const handleDeleteUser = async (userId: string) => {
    await StorageService.deleteUser(userId);
    const updated = await StorageService.getUsers();
    setUsers(updated);
  };

  // Night duty handler
  const handleSaveNightDuty = async (duty: NightDutyShift) => {
    await StorageService.saveNightDuty(duty);
    const updated = await StorageService.getNightDuties();
    setNightDuties(updated);
  };

  // Field duty handler
  const handleSaveFieldDuty = async (field: FieldDuty) => {
    await StorageService.saveFieldDuty(field);
    const updated = await StorageService.getFieldDuties();
    setFieldDuties(updated);
  };

  // Leave handler
  const handleSaveLeave = async (leave: LeaveRecord) => {
    await StorageService.saveLeave(leave);
    const updated = await StorageService.getLeaves();
    setLeaves(updated);
  };

  // Settings update handler
  const handleSaveSettings = async (newSettings: CommissionSettings) => {
    await StorageService.saveSettings(newSettings);
    setSettings(newSettings);
    const geo = await verifyGeofence(
      newSettings.hqLatitude,
      newSettings.hqLongitude,
      newSettings.allowedRadiusMeters
    );
    setGeofenceStatus(geo);
  };

  // Smart Back navigation handler
  const handleSmartBack = () => {
    if (certificateUser) {
      setCertificateUser(null);
      return;
    }
    if (showConsolidatedReport) {
      setShowConsolidatedReport(false);
      return;
    }
    if (individualReportUser) {
      setIndividualReportUser(null);
      return;
    }
    if (currentUser) {
      setCurrentUser(null);
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    }
  };

  return (
    <DesktopGuard enforceDesktop={settings.enforceDesktopOnly}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
        
        {/* Header Navigation & Live Status */}
        <Header
          currentUser={currentUser}
          settings={settings}
          onLogout={() => setCurrentUser(null)}
          onBack={handleSmartBack}
          geofenceStatus={geofenceStatus}
        />

        {/* Main Application Area */}
        <main className="flex-1">
          {isLoading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="text-sm font-semibold text-slate-300">
                  የቤጉ ፖሊስ ቴክኖሎጂ ማስፋፊያ የሰዓት ቁጥጥር ሲስተም እየተከፈተ ነው...
                </div>
              </div>
            </div>
          ) : !currentUser ? (
            /* Login Portal */
            <LoginModal
              settings={settings}
              users={users}
              onLoginSuccess={(user) => setCurrentUser(user)}
              geofenceStatus={geofenceStatus}
            />
          ) : currentUser.role === 'admin' ? (
            /* Admin Management Center */
            <AdminDashboard
              currentUser={currentUser}
              users={users}
              attendanceRecords={attendanceRecords}
              nightDuties={nightDuties}
              fieldDuties={fieldDuties}
              leaves={leaves}
              settings={settings}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onSaveNightDuty={handleSaveNightDuty}
              onSaveFieldDuty={handleSaveFieldDuty}
              onSaveLeave={handleSaveLeave}
              onSaveSettings={handleSaveSettings}
              onViewCertificate={(u) => setCertificateUser(u)}
              onPrintConsolidatedReport={() => setShowConsolidatedReport(true)}
              onPrintIndividualReport={(u) => setIndividualReportUser(u)}
            />
          ) : (
            /* Regular Police Officer Screen */
            <OfficerDashboard
              currentUser={currentUser}
              settings={settings}
              attendanceRecords={attendanceRecords}
              nightDuties={nightDuties}
              onRecordAttendance={handleRecordAttendance}
              onSaveNightDuty={handleSaveNightDuty}
              onViewCertificate={(u) => setCertificateUser(u)}
              geofenceStatus={geofenceStatus}
            />
          )}
        </main>

        {/* Modals */}
        {certificateUser && (
          <CertificateModal
            user={certificateUser}
            settings={settings}
            onClose={() => setCertificateUser(null)}
          />
        )}

        {showConsolidatedReport && (
          <ConsolidatedReportModal
            settings={settings}
            users={users}
            attendanceRecords={attendanceRecords}
            nightDuties={nightDuties}
            fieldDuties={fieldDuties}
            leaves={leaves}
            onClose={() => setShowConsolidatedReport(false)}
          />
        )}

        {individualReportUser && (
          <IndividualReportModal
            user={individualReportUser}
            settings={settings}
            attendanceRecords={attendanceRecords}
            nightDuties={nightDuties}
            fieldDuties={fieldDuties}
            leaves={leaves}
            onClose={() => setIndividualReportUser(null)}
            onViewCertificate={(u) => setCertificateUser(u)}
          />
        )}

        {/* Footer */}
        <footer className="py-4 border-t border-slate-900 text-center text-xs text-slate-500 print:hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              {settings.commissionName} • {settings.departmentName}
            </div>
            <div>
              የሰዓት ቁጥጥር እና የሰራተኞች ኤፊሸንሲ ሲስተም | አሶሳ፣ ቤንሻንጉል ጉሙዝ
            </div>
          </div>
        </footer>

        {/* Floating Back and Scroll Controls (ተመለስ / ወደ ላይ / ወደ ታች / ወደ ጎን) */}
        <NavigationScrollControls onBack={handleSmartBack} canGoBack={true} />

      </div>
    </DesktopGuard>
  );
}
