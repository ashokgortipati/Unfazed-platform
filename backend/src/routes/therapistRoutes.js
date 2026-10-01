import express from 'express';
import {
  getTherapistProfile,
  updateTherapistProfile,
  updateAvailability,
} from '../controllers/therapistController.js';
import { requireAuth, requireTherapist } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireTherapist);

router.get('/profile', getTherapistProfile);
router.put('/profile', updateTherapistProfile);
router.put('/availability', updateAvailability);

export default router;
