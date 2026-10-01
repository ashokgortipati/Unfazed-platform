import express from 'express';
import {
  getClients,
  addClient,
  getClientById,
  updateClient,
  deleteClient,
  submitIntakeForm,
  submitConsentForm,
} from '../controllers/clientController.js';
import { requireAuth, requireTherapist, requireTherapistOrClient } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Therapist-only management
router.get('/', requireTherapist, getClients);
router.post('/', requireTherapist, addClient);
router.put('/:id', requireTherapist, updateClient);
router.delete('/:id', requireTherapist, deleteClient);

// Shared / Role-authorized routes
router.get('/:id', requireTherapistOrClient, getClientById);
router.post('/:clientId/intake', requireTherapistOrClient, submitIntakeForm);
router.post('/:clientId/consent', requireTherapistOrClient, submitConsentForm);

export default router;
