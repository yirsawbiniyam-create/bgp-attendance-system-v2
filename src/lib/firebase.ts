import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, AttendanceRecord, NightDutyShift, FieldDuty, LeaveRecord, CommissionSettings } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore DB (pointing to project default or specific database ID)
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? firebaseConfig.firestoreDatabaseId
    : undefined
);

// Initialize Firebase Analytics safely when supported
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {});
}

// Validate connection on startup as recommended in skill
export async function testFirebaseConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection verified');
  } catch (err: any) {
    if (err?.message?.includes('the client is offline')) {
      console.warn('Firebase client appears offline, local cache will be used');
    }
  }
}

// Default Commission logo: high-resolution SVG police shield with Ethiopian tri-color & scales of justice
export const DEFAULT_BG_POLICE_LOGO = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2b48"/>
      <stop offset="50%" stop-color="#1b4965"/>
      <stop offset="100%" stop-color="#0b1d30"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f9d423"/>
      <stop offset="50%" stop-color="#ff4e50"/>
      <stop offset="100%" stop-color="#f9d423"/>
    </linearGradient>
  </defs>
  <!-- Outer Shield -->
  <path d="M 100,10 L 175,35 C 175,120 100,185 100,185 C 100,185 25,120 25,35 Z" fill="url(#shieldGrad)" stroke="#d4af37" stroke-width="4"/>
  <!-- Inner Shield border -->
  <path d="M 100,20 L 165,42 C 165,115 100,172 100,172 C 100,172 35,115 35,42 Z" fill="none" stroke="#f4d03f" stroke-width="1.5" stroke-dasharray="3,2"/>
  
  <!-- Ethiopian Flag Ribbon Stripes -->
  <rect x="55" y="48" width="90" height="7" rx="3" fill="#078930"/>
  <rect x="55" y="56" width="90" height="7" rx="3" fill="#fcdd09"/>
  <rect x="55" y="64" width="90" height="7" rx="3" fill="#da121a"/>

  <!-- Police Star / Emblem -->
  <polygon points="100,80 107,98 126,98 111,109 116,128 100,116 84,128 89,109 74,98 93,98" fill="#f4d03f" stroke="#b7860b" stroke-width="1.5"/>
  <circle cx="100" cy="107" r="8" fill="#0f2b48" stroke="#ffffff" stroke-width="1"/>
  
  <!-- Text Ribbons -->
  <text x="100" y="148" font-family="'Noto Sans Ethiopic', sans-serif" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle">ቤ/ጉ/ክ/ፖ/ኮ</text>
  <text x="100" y="160" font-family="'Noto Sans Ethiopic', sans-serif" font-size="8" font-weight="600" fill="#f4d03f" text-anchor="middle">ቴክኖሎጂ ማስፋፊያ</text>
</svg>
`)}`;

export const DEFAULT_SETTINGS: CommissionSettings = {
  id: 'main_settings',
  commissionName: 'የቤንሻንጉል ጉሙዝ ክልል ፖሊስ ኮሚሽን',
  departmentName: 'የቴክኖሎጂ ማስፋፊያ እና የሰዓት ቁጥጥር መምሪያ',
  logoUrl: DEFAULT_BG_POLICE_LOGO,
  hqLatitude: 10.0658,
  hqLongitude: 34.5385,
  allowedRadiusMeters: 500,
  enforceGeofence: true,
  enforceDesktopOnly: true,
  timeSimulationEnabled: false
};

// Seed default Admin and Police Officers
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_01',
    username: 'Yirsawbiniyam@gmail.com',
    password: 'Bi092714@',
    fullName: 'ቢንያም ይርሳው (ዋና አስተዳዳሪ)',
    rank: 'ዋና አስተዳዳሪ (Chief Administrator)',
    department: 'የቴክኖሎጂ ማስፋፊያ እና ሲስተም አስተዳደር',
    position: 'የመምሪያ ኃላፊ እና ዋና አስተዳዳሪ',
    phone: '0927140000',
    badgeNumber: 'BG-POL-001',
    role: 'admin',
    createdAt: new Date().toISOString(),
    efficiencyScore: 100,
    rankTier: 'እጅግ የላቀ (A+)',
    additionalNotes: 'የሲስተሙ የበላይ ተቆጣጣሪ እና አስተዳዳሪ'
  },
  {
    id: 'usr_officer_01',
    username: 'alemu',
    password: '123',
    fullName: 'ኢንስፔክተር አለሙ በቀለ',
    rank: 'ኢንስፔክተር (Inspector)',
    department: 'የቴክኖሎጂ ማስፋፊያ ክፍል',
    position: 'የኔትወርክ እና የመረጃ ደህንነት ባለሙያ',
    phone: '0912345678',
    badgeNumber: 'BG-POL-108',
    role: 'officer',
    createdAt: new Date().toISOString(),
    efficiencyScore: 94,
    rankTier: 'እጅግ የላቀ (A+)',
    additionalNotes: 'ቀዳሚ የቴክኖሎጂ ክፍል አባል'
  },
  {
    id: 'usr_officer_02',
    username: 'fatima',
    password: '123',
    fullName: 'ዋና ሳጅን ፋጢማ ኡመር',
    rank: 'ዋና ሳጅን (Chief Sergeant)',
    department: 'የቴክኖሎጂ ማስፋፊያ ክፍል',
    position: 'የሲስተም ኦፕሬተር እና ዳታ ምዝገባ',
    phone: '0913987654',
    badgeNumber: 'BG-POL-245',
    role: 'officer',
    createdAt: new Date().toISOString(),
    efficiencyScore: 91,
    rankTier: 'ከፍተኛ (A)',
    additionalNotes: 'የእለት ስራ መዝጋቢ'
  },
  {
    id: 'usr_officer_03',
    username: 'yohannes',
    password: '123',
    fullName: 'ረዳት ሳጅን ዮሐንስ ጌታቸው',
    rank: 'ረዳት ሳጅን (Assistant Sergeant)',
    department: 'የወንጀል መከላከል እና ጥበቃ',
    position: 'የተረኛ ክፍል ኦፊሰር',
    phone: '0914567890',
    badgeNumber: 'BG-POL-312',
    role: 'officer',
    createdAt: new Date().toISOString(),
    efficiencyScore: 88,
    rankTier: 'ከፍተኛ (A)',
    additionalNotes: 'የአዳር ተረኛ ቡድን አባል'
  }
];

// Helper to interact with Firestore with fallback to LocalStorage
export class StorageService {
  private static USERS_KEY = 'bg_police_users';
  private static ATTENDANCE_KEY = 'bg_police_attendance';
  private static NIGHT_DUTY_KEY = 'bg_police_night_duties';
  private static FIELD_DUTY_KEY = 'bg_police_field_duties';
  private static LEAVE_KEY = 'bg_police_leaves';
  private static SETTINGS_KEY = 'bg_police_settings';

  // Load Settings
  static async getSettings(): Promise<CommissionSettings> {
    try {
      const snap = await getDoc(doc(db, 'settings', 'main_settings'));
      if (snap.exists()) {
        const data = snap.data() as CommissionSettings;
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Using local settings cache', e);
    }
    const local = localStorage.getItem(this.SETTINGS_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return DEFAULT_SETTINGS;
  }

  static async saveSettings(settings: CommissionSettings): Promise<void> {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    try {
      await setDoc(doc(db, 'settings', 'main_settings'), settings);
    } catch (e) {
      console.warn('Failed writing settings to firestore', e);
    }
  }

  // Users
  static async getUsers(): Promise<User[]> {
    let list: User[] = [];
    try {
      const snap = await getDocs(collection(db, 'users'));
      if (!snap.empty) {
        snap.forEach((d) => list.push(d.data() as User));
      }
    } catch (e) {
      console.warn('Using local users cache', e);
    }

    if (list.length === 0) {
      const local = localStorage.getItem(this.USERS_KEY);
      if (local) {
        try {
          const parsed = JSON.parse(local);
          if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
        } catch {}
      }
    }

    // Ensure the required admin user exists with requested credentials
    const adminUser = INITIAL_USERS[0];
    const existingAdminIdx = list.findIndex(
      (u) => u.username.toLowerCase() === adminUser.username.toLowerCase() || u.role === 'admin'
    );

    if (existingAdminIdx >= 0) {
      // Keep admin credentials synced with requested credentials
      list[existingAdminIdx] = {
        ...list[existingAdminIdx],
        username: adminUser.username,
        password: adminUser.password,
        role: 'admin'
      };
    } else {
      list.unshift(adminUser);
    }

    // If list was empty before, seed all initial users
    if (list.length <= 1) {
      for (const u of INITIAL_USERS) {
        if (!list.some((existing) => existing.id === u.id)) {
          list.push(u);
        }
      }
    }

    localStorage.setItem(this.USERS_KEY, JSON.stringify(list));

    // Async sync admin user to firestore
    try {
      await setDoc(doc(db, 'users', adminUser.id), adminUser);
    } catch {}

    return list;
  }

  static async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    try {
      await setDoc(doc(db, 'users', user.id), user);
    } catch (e) {
      console.warn('Firestore user write fallback', e);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    const users = (await this.getUsers()).filter((u) => u.id !== userId);
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (e) {
      console.warn('Firestore user delete fallback', e);
    }
  }

  // Attendance Records
  static async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'attendance'));
      if (!snap.empty) {
        const list: AttendanceRecord[] = [];
        snap.forEach((d) => list.push(d.data() as AttendanceRecord));
        localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Using local attendance cache', e);
    }
    const local = localStorage.getItem(this.ATTENDANCE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  static async recordAttendance(record: AttendanceRecord): Promise<void> {
    const records = await this.getAttendanceRecords();
    records.unshift(record);
    localStorage.setItem(this.ATTENDANCE_KEY, JSON.stringify(records));
    try {
      await setDoc(doc(db, 'attendance', record.id), record);
    } catch (e) {
      console.warn('Firestore attendance write fallback', e);
    }
  }

  // Night Duty
  static async getNightDuties(): Promise<NightDutyShift[]> {
    try {
      const snap = await getDocs(collection(db, 'night_duties'));
      if (!snap.empty) {
        const list: NightDutyShift[] = [];
        snap.forEach((d) => list.push(d.data() as NightDutyShift));
        localStorage.setItem(this.NIGHT_DUTY_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Using local night duties cache', e);
    }
    const local = localStorage.getItem(this.NIGHT_DUTY_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  static async saveNightDuty(duty: NightDutyShift): Promise<void> {
    const list = await this.getNightDuties();
    const idx = list.findIndex((d) => d.id === duty.id);
    if (idx >= 0) {
      list[idx] = duty;
    } else {
      list.unshift(duty);
    }
    localStorage.setItem(this.NIGHT_DUTY_KEY, JSON.stringify(list));
    try {
      await setDoc(doc(db, 'night_duties', duty.id), duty);
    } catch (e) {
      console.warn('Firestore night duty write fallback', e);
    }
  }

  // Field Duties
  static async getFieldDuties(): Promise<FieldDuty[]> {
    try {
      const snap = await getDocs(collection(db, 'field_duties'));
      if (!snap.empty) {
        const list: FieldDuty[] = [];
        snap.forEach((d) => list.push(d.data() as FieldDuty));
        localStorage.setItem(this.FIELD_DUTY_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Using local field duties cache', e);
    }
    const local = localStorage.getItem(this.FIELD_DUTY_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  static async saveFieldDuty(field: FieldDuty): Promise<void> {
    const list = await this.getFieldDuties();
    const idx = list.findIndex((f) => f.id === field.id);
    if (idx >= 0) {
      list[idx] = field;
    } else {
      list.unshift(field);
    }
    localStorage.setItem(this.FIELD_DUTY_KEY, JSON.stringify(list));
    try {
      await setDoc(doc(db, 'field_duties', field.id), field);
    } catch (e) {
      console.warn('Firestore field duty write fallback', e);
    }
  }

  // Leaves
  static async getLeaves(): Promise<LeaveRecord[]> {
    try {
      const snap = await getDocs(collection(db, 'leaves'));
      if (!snap.empty) {
        const list: LeaveRecord[] = [];
        snap.forEach((d) => list.push(d.data() as LeaveRecord));
        localStorage.setItem(this.LEAVE_KEY, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Using local leaves cache', e);
    }
    const local = localStorage.getItem(this.LEAVE_KEY);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {}
    }
    return [];
  }

  static async saveLeave(leave: LeaveRecord): Promise<void> {
    const list = await this.getLeaves();
    const idx = list.findIndex((l) => l.id === leave.id);
    if (idx >= 0) {
      list[idx] = leave;
    } else {
      list.unshift(leave);
    }
    localStorage.setItem(this.LEAVE_KEY, JSON.stringify(list));
    try {
      await setDoc(doc(db, 'leaves', leave.id), leave);
    } catch (e) {
      console.warn('Firestore leave write fallback', e);
    }
  }
}
