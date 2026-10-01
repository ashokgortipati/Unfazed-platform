import { Appointment } from '../models/Appointment.js';
import { Client } from '../models/Client.js';
import { Therapist } from '../models/Therapist.js';
import { checkAppointmentConflict, getAvailableSlotsForDate } from '../services/schedulingService.js';
import { createNotification } from '../services/notificationService.js';

/**
 * List appointments with role-based filtering (Therapist or Client)
 */
export const getAppointments = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    const { status, date, client } = req.query;

    const filter = {};

    if (sessionUser.role === 'therapist') {
      filter.therapist = sessionUser.id;
      if (client) filter.client = client;
    } else if (sessionUser.role === 'client') {
      filter.client = sessionUser.id;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (date) {
      filter.date = date;
    }

    const appointments = await Appointment.find(filter)
      .populate('client', 'name email phone')
      .populate('therapist', 'name email specializations profilePhoto')
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available slots for a given therapist and date
 */
export const getAvailableSlots = async (req, res, next) => {
  try {
    const { therapistId, date } = req.query;

    if (!therapistId || !date) {
      return res.status(400).json({
        success: false,
        message: 'Therapist ID and date (YYYY-MM-DD) are required.',
      });
    }

    const slotInfo = await getAvailableSlotsForDate(therapistId, date);
    res.status(200).json({ success: true, ...slotInfo });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment with double booking prevention
 */
export const createAppointment = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    let { therapistId, clientId, date, startTime, endTime, sessionType, notes, timezone } = req.body;

    // Resolve IDs depending on who initiated
    if (sessionUser.role === 'therapist') {
      therapistId = sessionUser.id;
    } else if (sessionUser.role === 'client') {
      clientId = sessionUser.id;
      const client = await Client.findById(clientId);
      if (!client) return res.status(404).json({ success: false, message: 'Client profile not found' });
      therapistId = client.therapist.toString();
    }

    if (!therapistId || !clientId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Therapist, Client, Date, Start Time, and End Time are required.',
      });
    }

    // Verify double-booking prevention
    const conflictResult = await checkAppointmentConflict({
      therapistId,
      clientId,
      date,
      startTime,
      endTime,
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictResult.message,
      });
    }

    const therapist = await Therapist.findById(therapistId);

    const appointment = await Appointment.create({
      therapist: therapistId,
      client: clientId,
      date,
      startTime,
      endTime,
      sessionType: sessionType || 'Individual Therapy',
      notes: notes || '',
      timezone: timezone || therapist?.availability?.timezone || 'UTC',
      status: 'scheduled',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('client', 'name email phone')
      .populate('therapist', 'name email profilePhoto');

    // Send notifications to both parties
    if (sessionUser.role === 'therapist') {
      await createNotification({
        userId: clientId,
        userModel: 'Client',
        title: 'New Appointment Scheduled',
        message: `Your therapist has scheduled a session for ${date} at ${startTime}.`,
        type: 'appointment',
        link: '/portal/appointments',
      });
    } else {
      await createNotification({
        userId: therapistId,
        userModel: 'Therapist',
        title: 'Appointment Booked by Client',
        message: `${populatedAppointment.client?.name} booked a session for ${date} at ${startTime}.`,
        type: 'appointment',
        link: '/appointments',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Appointment successfully scheduled with no conflicts',
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule appointment with conflict check
 */
export const rescheduleAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime, reason } = req.body;

    const appointment = await Appointment.findById(id).populate('client therapist');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check conflict for new time slot, excluding current appointment
    const conflictResult = await checkAppointmentConflict({
      therapistId: appointment.therapist._id,
      clientId: appointment.client._id,
      date,
      startTime,
      endTime,
      excludeAppointmentId: appointment._id,
    });

    if (conflictResult.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictResult.message,
      });
    }

    const previousDate = appointment.date;
    const previousTime = appointment.startTime;

    appointment.date = date;
    appointment.startTime = startTime;
    appointment.endTime = endTime;
    appointment.status = 'rescheduled';
    if (reason) appointment.notes += ` [Rescheduled reason: ${reason}]`;

    await appointment.save();

    // Notify the other party
    const isTherapist = req.session.user.role === 'therapist';
    const targetUserId = isTherapist ? appointment.client._id : appointment.therapist._id;
    const targetModel = isTherapist ? 'Client' : 'Therapist';

    await createNotification({
      userId: targetUserId,
      userModel: targetModel,
      title: 'Appointment Rescheduled',
      message: `Appointment originally on ${previousDate} ${previousTime} moved to ${date} ${startTime}.`,
      type: 'appointment',
    });

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findById(id).populate('client therapist');
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason || 'Cancelled by user';
    await appointment.save();

    const isTherapist = req.session.user.role === 'therapist';
    const targetUserId = isTherapist ? appointment.client._id : appointment.therapist._id;
    const targetModel = isTherapist ? 'Client' : 'Therapist';

    await createNotification({
      userId: targetUserId,
      userModel: targetModel,
      title: 'Appointment Cancelled',
      message: `Appointment on ${appointment.date} at ${appointment.startTime} was cancelled: "${appointment.cancellationReason}".`,
      type: 'appointment',
    });

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment,
    });
  } catch (error) {
    next(error);
  }
};
