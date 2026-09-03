export type UserRole = 'admin' | 'officer';

export type AttendanceStatus = 'on_time' | 'late' | 'absent' | 'permission' | 'field';

export interface User {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  rank: string; // ማዕረግ (e.g., ረዳት ሳጅን፣ ዋና ሳጅን፣ ኢንስፔክተር፣ ረዳት ኮሚሽነር)
  department: string; // የስራ ክፍል (e.g., ቴክኖሎጂ ማስፋፊያ፣ ወንጀል መከላከል፣ ትራፊክ ቁጥጥር)
  position: string; // የስራ መደብ (e.g., የኔትወርክ ባለሙያ፣ የዳታቤዝ አስተዳዳሪ)
  phone: string; // ስልክ ቁጥር
  badgeNumber: string; // የፖሊስ ባጅ/መለያ ቁጥር
  role: UserRole;
  createdAt: string;
  efficiencyScore?: number; // 0-100
  rankTier?: string; // e.g. "እጅግ የላቀ (A+)", "ከፍተኛ (A)"
  additionalNotes?: string;
}

export interface TimeSlot {
  id: string;
  name: string; // Amharic name (e.g. "ጠዋት መግቢያ")
  description: string;
  ethiopianTime: string; // e.g. "2:30 - 2:45"
  startHour: number; // 24h format (e.g., 8)
  startMinute: number; // 30
  endHour: number; // 8
  endMinute: number; // 45
  type: 'check_in' | 'tea_break' | 'lunch_return' | 'afternoon_break' | 'check_out';
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  officerName: string;
  rank: string;
  department: string;
  date: string; // YYYY-MM-DD
  ethiopianDate: string; // e.g. "ነሐሴ 28 ቀን 2016"
  slotId: string;
  slotName: string;
  ethiopianTimeWindow: string;
  timeIn: string; // HH:mm:ss
  ethiopianTimeIn: string; // e.g. "ጠዋት 2:35"
  status: AttendanceStatus;
  note?: string;
  isNightShift?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    distanceMeters: number;
    withinFence: boolean;
  };
  timestamp: number;
}

export interface NightDutyShift {
  id: string;
  userId: string;
  officerName: string;
  rank: string;
  department: string;
  shiftDate: string; // Date of night duty
  ethiopianDate: string;
  entryTimeWindow: string; // e.g. "12:00 - 12:30 ምሽት"
  exitTimeWindow: string; // e.g. "12:00 - 12:30 ጠዋት"
  checkedInTime?: string;
  checkedOutTime?: string;
  status: 'scheduled' | 'active' | 'completed' | 'missed';
  incidentReport?: string; // የእለት ክስተቶችና ሪፖርት
  patrolNotes?: string; // የጥበቃና ዙር ማስታወሻ
  handoverNotes?: string; // የስራ ርክክብ
  createdAt: string;
}

export interface FieldDuty {
  id: string;
  userId: string;
  officerName: string;
  rank: string;
  department: string;
  destination: string; // ወዴት እንደሄዱ (e.g., ባምባሲ ወረዳ፣ ማኦኮሞ ልዩ ወረዳ)
  reason: string; // የወጡበት ምክንያት (e.g., የቴክኖሎጂ መሰረተ ልማት ዝርጋታ)
  startDate: string;
  endDate: string;
  approvedBy: string;
  status: 'active' | 'completed';
  createdAt: string;
}

export interface LeaveRecord {
  id: string;
  userId: string;
  officerName: string;
  rank: string;
  department: string;
  leaveType: 'ዓመታዊ ፈቃድ' | 'የህክምና ፈቃድ' | 'አስቸኳይ የግል ፈቃድ' | 'የወሊድ ፈቃድ' | 'የትምህርት ፈቃድ';
  startDate: string;
  endDate: string;
  reason: string;
  approvedBy: string;
  status: 'approved' | 'pending';
  createdAt: string;
}

export interface CommissionSettings {
  id: string;
  commissionName: string;
  departmentName: string;
  logoUrl: string;
  hqLatitude: number;
  hqLongitude: number;
  allowedRadiusMeters: number;
  enforceGeofence: boolean;
  enforceDesktopOnly: boolean;
  timeSimulationEnabled: boolean;
  simulatedTimeSlot?: string;
}

export interface EfficiencyPeriod {
  periodType: 'daily' | 'weekly' | 'monthly' | '3_months' | '6_months' | 'yearly';
  title: string;
}
