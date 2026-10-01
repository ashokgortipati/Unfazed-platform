import express from 'express';
import {
  getAppointments,
  getAvailableSlots,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
} from '../controllers/appointmentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getAppointments);
router.get('/slots', getAvailableSlots);
router.post('/', createAppointment);
router.put('/:id/reschedule', rescheduleAppointment);
router.put('/:id/cancel', cancelAppointment);

export default router;
