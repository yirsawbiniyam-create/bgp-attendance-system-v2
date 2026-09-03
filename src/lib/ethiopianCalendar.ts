/**
 * Ethiopian Date and Time utilities
 * 
 * Ethiopian Time starts at 06:00 AM (12:00 Local/ጠዋት).
 * User specified exact slots:
 * 1. ጠዋት መግቢያ: 2:30 - 2:45 (08:30 - 08:45 AM)
 * 2. ጠዋት ሻይ እረፍት: 4:05 - 6:25 (10:05 AM - 12:25 PM)
 * 3. ከምሳ መልስ መግቢያ: 7:35 - 7:45 (01:35 PM - 01:45 PM / 13:35 - 13:45)
 * 4. ከሰዓት ሻይ እረፍት: 9:05 - 9:35 (03:05 PM - 03:35 PM / 15:05 - 15:35)
 * 5. ከስራ መውጫ: 11:20 - 11:30 (05:20 PM - 05:30 PM / 17:20 - 17:30)
 */

import { TimeSlot } from '../types';

export const ETHIOPIAN_MONTHS = [
  'መስከረም',
  'ጥቅምት',
  'ኅዳር',
  'ታኅሣሥ',
  'ጥር',
  'የካቲት',
  'መጋቢት',
  'ሚያዝያ',
  'ግንቦት',
  'ሰኔ',
  'ሐምሌ',
  'ነሐሴ',
  'ጳጉሜን'
];

export const ETHIOPIAN_DAYS = [
  'እሑድ',
  'ሰኞ',
  'ማክሰኞ',
  'ረቡዕ',
  'ሐሙስ',
  'ዓርብ',
  'ቅዳሜ'
];

export const OFFICIAL_SLOTS: TimeSlot[] = [
  {
    id: 'morning_entry',
    name: 'ጠዋት መግቢያ (ስራ መጀመሪያ)',
    description: 'ጠዋት ወደ መስሪያ ቤት መግቢያ የሰዓት መቆጣጠሪያ',
    ethiopianTime: 'ጠዋት 2:30 - 2:45',
    startHour: 8,
    startMinute: 30,
    endHour: 8,
    endMinute: 45,
    type: 'check_in'
  },
  {
    id: 'morning_tea',
    name: 'ጠዋት ሻይ እረፍት (መውጫ/መመለሻ)',
    description: 'የጠዋት የሻይ እረፍት መቆጣጠሪያ ሰዓት',
    ethiopianTime: 'ጠዋት 4:05 - 6:25',
    startHour: 10,
    startMinute: 5,
    endHour: 12,
    endMinute: 25,
    type: 'tea_break'
  },
  {
    id: 'lunch_return',
    name: 'ከምሳ መልስ መግቢያ',
    description: 'ከምሳ እረፍት መልስ ወደ ቢሮ መግቢያ መቆጣጠሪያ',
    ethiopianTime: 'ከሰዓት 7:35 - 7:45',
    startHour: 13,
    startMinute: 35,
    endHour: 13,
    endMinute: 45,
    type: 'lunch_return'
  },
  {
    id: 'afternoon_tea',
    name: 'ከሰዓት ሻይ እረፍት',
    description: 'የከሰዓት የሻይ እረፍት መቆጣጠሪያ',
    ethiopianTime: 'ከሰዓት 9:05 - 9:35',
    startHour: 15,
    startMinute: 5,
    endHour: 15,
    endMinute: 35,
    type: 'afternoon_break'
  },
  {
    id: 'work_exit',
    name: 'ከስራ መውጫ (ስራ ማብቂያ)',
    description: 'የቀኑ መደበኛ ስራ ማብቂያ የሰዓት መቆጣጠሪያ',
    ethiopianTime: 'ከምሽቱ 11:20 - 11:30',
    startHour: 17,
    startMinute: 20,
    endHour: 17,
    endMinute: 30,
    type: 'check_out'
  }
];

/**
 * Converts a Gregorian Date to approximate Ethiopian Date
 */
export function toEthiopianDate(date: Date = new Date()): {
  year: number;
  month: number;
  monthName: string;
  day: number;
  dayName: string;
  formatted: string;
} {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1;
  const gDay = date.getDate();
  const dayName = ETHIOPIAN_DAYS[date.getDay()];

  // Ethiopian calendar year is either 7 or 8 years behind Gregorian
  let ethYear = gYear - 8;
  let ethMonth = 1;
  let ethDay = 1;

  // New year starts September 11 (or 12 in leap year)
  const isLeapGregorian = (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0;
  const newYearDay = isLeapGregorian ? 12 : 11;

  // Calculate day of year
  const startOfYear = new Date(gYear, 0, 1);
  const diffDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  // Determine Ethiopian Date
  if (gMonth > 9 || (gMonth === 9 && gDay >= newYearDay)) {
    ethYear = gYear - 7;
    // After Meskerem 1
    const meskerem1 = new Date(gYear, 8, newYearDay);
    const daysSinceNewYear = Math.floor((date.getTime() - meskerem1.getTime()) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
  } else {
    ethYear = gYear - 8;
    const prevMeskerem1 = new Date(gYear - 1, 8, 11);
    const daysSinceNewYear = Math.floor((date.getTime() - prevMeskerem1.getTime()) / (1000 * 60 * 60 * 24));
    ethMonth = Math.floor(daysSinceNewYear / 30) + 1;
    ethDay = (daysSinceNewYear % 30) + 1;
    if (ethMonth > 13) ethMonth = 13;
  }

  if (ethMonth > 13) ethMonth = 13;
  const monthName = ETHIOPIAN_MONTHS[Math.max(0, Math.min(12, ethMonth - 1))];

  return {
    year: ethYear,
    month: ethMonth,
    monthName,
    day: ethDay,
    dayName,
    formatted: `${dayName}፣ ${monthName} ${ethDay} ቀን ${ethYear} ዓ.ም`
  };
}

/**
 * Converts a Gregorian time (Date or HH:MM) to Ethiopian Time String
 * Example: 08:35 AM -> "ጠዋት 2:35"
 */
export function toEthiopianTime(date: Date = new Date()): {
  hours: number;
  minutes: number;
  period: string;
  formatted: string;
} {
  const gHours = date.getHours();
  const minutes = date.getMinutes();
  const minutesFormatted = minutes < 10 ? `0${minutes}` : `${minutes}`;

  // In Ethiopian time: 06:00 is 12:00
  let ethHours = (gHours - 6 + 24) % 12;
  if (ethHours === 0) ethHours = 12;

  let period = 'ጠዋት';
  if (gHours >= 6 && gHours < 12) {
    period = 'ጠዋት';
  } else if (gHours >= 12 && gHours < 18) {
    period = 'ከሰዓት';
  } else if (gHours >= 18 && gHours < 24) {
    period = 'ምሽት';
  } else {
    period = 'ለሊት';
  }

  return {
    hours: ethHours,
    minutes,
    period,
    formatted: `${period} ${ethHours}:${minutesFormatted}`
  };
}

/**
 * Determines current active slot or next upcoming slot
 */
export function getSlotStatus(now: Date = new Date()): {
  activeSlot: TimeSlot | null;
  nextSlot: TimeSlot | null;
  timeRemainingSeconds: number;
  isWithinAllowedTime: boolean;
} {
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  let activeSlot: TimeSlot | null = null;
  let nextSlot: TimeSlot | null = null;
  let minMinutesUntilNext = Infinity;

  for (const slot of OFFICIAL_SLOTS) {
    const startMinutes = slot.startHour * 60 + slot.startMinute;
    const endMinutes = slot.endHour * 60 + slot.endMinute;

    if (currentTotalMinutes >= startMinutes && currentTotalMinutes <= endMinutes) {
      activeSlot = slot;
      break;
    } else if (startMinutes > currentTotalMinutes) {
      const diff = startMinutes - currentTotalMinutes;
      if (diff < minMinutesUntilNext) {
        minMinutesUntilNext = diff;
        nextSlot = slot;
      }
    }
  }

  if (!nextSlot && !activeSlot && OFFICIAL_SLOTS.length > 0) {
    // Wrap to first slot tomorrow
    nextSlot = OFFICIAL_SLOTS[0];
  }

  let timeRemainingSeconds = 0;
  if (activeSlot) {
    const endMinutes = activeSlot.endHour * 60 + activeSlot.endMinute;
    const currentSeconds = now.getSeconds();
    timeRemainingSeconds = (endMinutes - currentTotalMinutes) * 60 - currentSeconds;
  }

  return {
    activeSlot,
    nextSlot,
    timeRemainingSeconds: Math.max(0, timeRemainingSeconds),
    isWithinAllowedTime: activeSlot !== null
  };
}
