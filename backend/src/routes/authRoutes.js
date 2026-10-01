import express from 'express';
import {
  registerTherapist,
  loginTherapist,
  loginClient,
  getCurrentSession,
  logout,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register-therapist', registerTherapist);
router.post('/login-therapist', loginTherapist);
router.post('/login-client', loginClient);
router.get('/me', getCurrentSession);
router.post('/logout', logout);

export default router;
