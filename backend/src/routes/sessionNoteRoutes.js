import express from 'express';
import {
  getSessionNotes,
  getSessionNoteById,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
} from '../controllers/sessionNoteController.js';
import { requireAuth, requireTherapist } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

// Notes access: Therapist sees all their notes; Client only sees shared notes (filtered in controller)
router.get('/', getSessionNotes);
router.get('/:id', getSessionNoteById);

// Note mutation: Therapist ONLY
router.post('/', requireTherapist, createSessionNote);
router.put('/:id', requireTherapist, updateSessionNote);
router.delete('/:id', requireTherapist, deleteSessionNote);

export default router;
