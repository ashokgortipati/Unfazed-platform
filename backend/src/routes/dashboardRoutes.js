import express from 'express';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { requireAuth, requireTherapist } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth, requireTherapist);

router.get('/stats', getDashboardStats);

export default router;
