import { Client } from '../models/Client.js';
import { Appointment } from '../models/Appointment.js';
import { SessionNote } from '../models/SessionNote.js';
import { Document } from '../models/Document.js';

/**
 * Get aggregated dashboard analytics for the logged-in therapist
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Client statistics
    const totalClients = await Client.countDocuments({ therapist: therapistId });
    const activeClients = await Client.countDocuments({ therapist: therapistId, status: 'active' });
    const inactiveClients = totalClients - activeClients;

    // 2. Appointments metrics
    const upcomingAppointments = await Appointment.find({
      therapist: therapistId,
      date: { $gte: todayStr },
      status: { $in: ['scheduled', 'rescheduled'] },
    })
      .populate('client', 'name email phone')
      .sort({ date: 1, startTime: 1 })
      .limit(6);

    const upcomingCount = await Appointment.countDocuments({
      therapist: therapistId,
      date: { $gte: todayStr },
      status: { $in: ['scheduled', 'rescheduled'] },
    });

    const completedSessionsCount = await Appointment.countDocuments({
      therapist: therapistId,
      status: 'completed',
    });

    // 3. Recent Session Notes
    const recentNotes = await SessionNote.find({ therapist: therapistId })
      .populate('client', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const totalNotes = await SessionNote.countDocuments({ therapist: therapistId });
    const totalDocuments = await Document.countDocuments({ therapist: therapistId });

    // 4. Pending Intakes / Consents
    const pendingConsentCount = await Client.countDocuments({
      therapist: therapistId,
      'consentData.agreed': { $ne: true },
    });

    res.status(200).json({
      success: true,
      stats: {
        totalClients,
        activeClients,
        inactiveClients,
        upcomingAppointmentsCount: upcomingCount,
        completedSessionsCount,
        totalNotes,
        totalDocuments,
        pendingConsentCount,
      },
      upcomingAppointments,
      recentNotes,
    });
  } catch (error) {
    next(error);
  }
};
