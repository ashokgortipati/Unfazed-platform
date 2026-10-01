import { Appointment } from '../models/Appointment.js';
import { Therapist } from '../models/Therapist.js';

/**
 * Converts "HH:mm" time string into total minutes since midnight
 */
export const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Converts total minutes since midnight to "HH:mm"
 */
export const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

/**
 * Checks for double-booking conflicts for a therapist or client
 * Returns conflict details if found, or null if slot is free
 */
export const checkAppointmentConflict = async ({
  therapistId,
  clientId,
  date,
  startTime,
  endTime,
  excludeAppointmentId = null,
}) => {
  const newStartMinutes = timeToMinutes(startTime);
  const newEndMinutes = timeToMinutes(endTime);

  if (newEndMinutes <= newStartMinutes) {
    return { hasConflict: true, message: 'End time must be after start time.' };
  }

  // Find active appointments on that day for therapist OR client
  const query = {
    date,
    status: { $in: ['scheduled', 'rescheduled'] },
    $or: [{ therapist: therapistId }, { client: clientId }],
  };

  if (excludeAppointmentId) {
    query._id = { $ne: excludeAppointmentId };
  }

  const existingAppointments = await Appointment.find(query).populate('client', 'name').populate('therapist', 'name');

  for (const appt of existingAppointments) {
    const existingStart = timeToMinutes(appt.startTime);
    const existingEnd = timeToMinutes(appt.endTime);

    // Overlap condition: startA < endB && endA > startB
    const hasOverlap = newStartMinutes < existingEnd && newEndMinutes > existingStart;

    if (hasOverlap) {
      const isTherapistConflict = appt.therapist._id.toString() === therapistId.toString();
      const conflictWith = isTherapistConflict
        ? `Therapist already has a session with ${appt.client?.name || 'another client'}`
        : `Client already has a session with ${appt.therapist?.name || 'another therapist'}`;

      return {
        hasConflict: true,
        message: `Conflict detected (${appt.startTime} - ${appt.endTime}): ${conflictWith}.`,
        conflictingAppointment: appt,
      };
    }
  }

  return { hasConflict: false };
};

/**
 * Calculates available time slots for a given date based on therapist schedule and existing bookings
 */
export const getAvailableSlotsForDate = async (therapistId, dateStr) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) throw new Error('Therapist not found');

  const {
    workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startHour = '09:00',
    endHour = '17:00',
    sessionDuration = 50,
    bufferTime = 10,
  } = therapist.availability || {};

  // Check day of week
  const dateObj = new Date(`${dateStr}T00:00:00Z`);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = daysOfWeek[dateObj.getUTCDay()];

  if (!workingDays.includes(dayName)) {
    return {
      available: false,
      reason: `Therapist does not work on ${dayName}s.`,
      slots: [],
    };
  }

  const dayStartMinutes = timeToMinutes(startHour);
  const dayEndMinutes = timeToMinutes(endHour);
  const totalSlotDuration = sessionDuration + bufferTime;

  // Fetch existing appointments
  const existingAppointments = await Appointment.find({
    therapist: therapistId,
    date: dateStr,
    status: { $in: ['scheduled', 'rescheduled'] },
  });

  const slots = [];
  let currentStart = dayStartMinutes;

  while (currentStart + sessionDuration <= dayEndMinutes) {
    const currentEnd = currentStart + sessionDuration;
    const startStr = minutesToTime(currentStart);
    const endStr = minutesToTime(currentEnd);

    // Check collision with any existing appointment
    const isBooked = existingAppointments.some((appt) => {
      const aStart = timeToMinutes(appt.startTime);
      const aEnd = timeToMinutes(appt.endTime);
      return currentStart < aEnd && currentEnd > aStart;
    });

    slots.push({
      startTime: startStr,
      endTime: endStr,
      isAvailable: !isBooked,
    });

    currentStart += totalSlotDuration;
  }

  return {
    available: true,
    dayName,
    slots,
  };
};
