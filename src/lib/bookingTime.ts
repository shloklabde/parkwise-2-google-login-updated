/**
 * Utilities for parsing, validating, and comparing booking reservation dates and times.
 */

export interface TimeWindow {
  start: Date | null;
  end: Date | null;
}

/**
 * Normalizes a slot ID or label into its canonical bay name (e.g. 'slot_A1' -> 'A1', 'A1' -> 'A1').
 */
export function normalizeSlotLabel(labelOrId: string): string {
  if (!labelOrId) return '';
  return String(labelOrId)
    .replace(/^(slot_)+/i, '')
    .trim()
    .toUpperCase();
}

/**
 * Parses time string (e.g., "6:00 AM", "08:00 PM", "8 AM", "14:30") into hours (0-23) and minutes (0-59).
 */
export function parseTimeString(timeStr?: string): { hours: number; minutes: number } | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3] ? match[3].toUpperCase() : null;

  if (meridian === 'PM') {
    if (hours < 12) hours += 12;
  } else if (meridian === 'AM') {
    if (hours === 12) hours = 0;
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return { hours, minutes };
}

/**
 * Parses a date string and optional time string into a JavaScript Date object.
 * Supports:
 * - ISO formats: "2026-09-21"
 * - Delimited: "21-09-2026", "21/09/2026"
 * - Word formats: "21 Sep 2026", "September 21, 2026"
 */
export function parseBookingDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null;
  const trimmedDate = dateStr.trim();

  let year: number;
  let month: number; // 0-indexed
  let day: number;

  const parts = trimmedDate.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      day = parseInt(parts[2], 10);
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10) - 1;
      year = parseInt(parts[2], 10);
    } else {
      const parsed = new Date(trimmedDate);
      if (isNaN(parsed.getTime())) return null;
      year = parsed.getFullYear();
      month = parsed.getMonth();
      day = parsed.getDate();
    }
  } else {
    const parsed = new Date(trimmedDate);
    if (isNaN(parsed.getTime())) return null;
    year = parsed.getFullYear();
    month = parsed.getMonth();
    day = parsed.getDate();
  }

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const timeParsed = parseTimeString(timeStr);
    if (timeParsed) {
      hours = timeParsed.hours;
      minutes = timeParsed.minutes;
    }
  }

  const result = new Date(year, month, day, hours, minutes, 0, 0);
  return isNaN(result.getTime()) ? null : result;
}

/**
 * Extracts the start and end Date objects for a reservation.
 */
export function getBookingTimeWindow(booking: {
  date: string;
  startTime?: string;
  endTime?: string;
  time?: string;
  duration?: number;
}): TimeWindow {
  let startTimeStr = booking.startTime;
  let endTimeStr = booking.endTime;

  if ((!startTimeStr || !endTimeStr) && booking.time && booking.time.includes('-')) {
    const segments = booking.time.split('-');
    if (!startTimeStr && segments[0]) startTimeStr = segments[0].trim();
    if (!endTimeStr && segments[1]) endTimeStr = segments[1].trim();
  }

  if (!startTimeStr) startTimeStr = '10:00 AM';
  if (!endTimeStr) {
    // If end time not given, compute from start + duration
    const startParsed = parseTimeString(startTimeStr);
    if (startParsed && typeof booking.duration === 'number' && booking.duration > 0) {
      const endHour = (startParsed.hours + booking.duration) % 24;
      const meridian = endHour >= 12 ? 'PM' : 'AM';
      const displayHour = endHour % 12 || 12;
      endTimeStr = `${displayHour.toString().padStart(2, '0')}:${startParsed.minutes.toString().padStart(2, '0')} ${meridian}`;
    } else {
      endTimeStr = '12:00 PM';
    }
  }

  const start = parseBookingDateTime(booking.date, startTimeStr);
  const end = parseBookingDateTime(booking.date, endTimeStr);

  return { start, end };
}

/**
 * Determines whether a booking's reservation time window has passed.
 * e.g., if reservation was for 21 Sept 6:00 AM - 8:00 AM, and now it is 9:00 AM, this returns true.
 */
export function isBookingPastEndTime(
  booking: {
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    status?: string;
    duration?: number;
  },
  now: Date = new Date(),
): boolean {
  const status = String(booking.status || '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') {
    return true;
  }

  const { end } = getBookingTimeWindow(booking);
  if (!end) return false;

  return now.getTime() >= end.getTime();
}

/**
 * Determines whether a booking is currently active (the clock is currently inside the booking window).
 */
export function isBookingCurrentlyActive(
  booking: {
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    status?: string;
    duration?: number;
  },
  now: Date = new Date(),
): boolean {
  const status = String(booking.status || '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') {
    return false;
  }

  const { start, end } = getBookingTimeWindow(booking);
  if (!start || !end) return false;

  const nowMs = now.getTime();
  return nowMs >= start.getTime() && nowMs < end.getTime();
}

/**
 * Checks whether a booking conflicts/overlaps with a specified date and time window.
 */
export function isBookingInConflict(
  existingBooking: {
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    status?: string;
    duration?: number;
  },
  targetDate: string,
  targetStartTime: string,
  targetEndTime: string,
): boolean {
  const status = String(existingBooking.status || '').toLowerCase();
  if (status === 'completed' || status === 'cancelled') {
    return false;
  }

  const existingWindow = getBookingTimeWindow(existingBooking);
  const targetStart = parseBookingDateTime(targetDate, targetStartTime);
  const targetEnd = parseBookingDateTime(targetDate, targetEndTime);

  if (!existingWindow.start || !existingWindow.end || !targetStart || !targetEnd) {
    return false;
  }

  // Standard interval overlap: [startA, endA) overlaps [startB, endB) iff startA < endB && endA > startB
  return (
    existingWindow.start.getTime() < targetEnd.getTime() &&
    existingWindow.end.getTime() > targetStart.getTime()
  );
}

/**
 * Returns true if a slot currently has an ACTIVE reservation right now.
 * If all reservations for this slot are in the past or cancelled, returns false.
 */
export function isSlotCurrentlyReserved(
  slotLabelOrId: string,
  bookings: Array<{
    slot?: string;
    slotNumber?: string;
    slotId?: string;
    date: string;
    startTime?: string;
    endTime?: string;
    time?: string;
    status?: string;
    duration?: number;
  }>,
  now: Date = new Date(),
): boolean {
  const targetLabel = normalizeSlotLabel(slotLabelOrId);
  if (!targetLabel) return false;

  return bookings.some((booking) => {
    const bookingSlot = normalizeSlotLabel(booking.slotNumber || booking.slot || booking.slotId || '');
    if (bookingSlot !== targetLabel) return false;
    return isBookingCurrentlyActive(booking, now);
  });
}
