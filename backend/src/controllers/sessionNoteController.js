import { SessionNote } from '../models/SessionNote.js';
import { Client } from '../models/Client.js';
import { createNotification } from '../services/notificationService.js';

/**
 * List session notes
 * STRICT DATABASE-LEVEL FILTERING:
 * - If user is Client: ONLY notes where { client: clientId, visibility: 'shared' }
 * - Private therapist notes are NEVER queried or returned to clients.
 */
export const getSessionNotes = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    const { clientId, type, visibility } = req.query;

    const filter = {};

    if (sessionUser.role === 'client') {
      // Enforce strict database-level filtering: ONLY shared notes for this client
      filter.client = sessionUser.id;
      filter.visibility = 'shared';
    } else if (sessionUser.role === 'therapist') {
      filter.therapist = sessionUser.id;
      if (clientId) {
        filter.client = clientId;
      }
      if (visibility && visibility !== 'all') {
        filter.visibility = visibility;
      }
    }

    if (type && type !== 'all') {
      filter.type = type;
    }

    const notes = await SessionNote.find(filter)
      .populate('client', 'name email')
      .populate('appointment', 'date startTime endTime sessionType')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single session note
 * Enforces strict access control for client portal
 */
export const getSessionNoteById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    const note = await SessionNote.findById(id)
      .populate('client', 'name email')
      .populate('therapist', 'name email');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Session note not found.' });
    }

    // Role-based visibility check
    if (sessionUser.role === 'client') {
      if (note.client._id.toString() !== sessionUser.id || note.visibility !== 'shared') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Private clinical notes cannot be accessed.',
        });
      }
    } else if (sessionUser.role === 'therapist') {
      if (note.therapist._id.toString() !== sessionUser.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to note.' });
      }
    }

    res.status(200).json({ success: true, note });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new session note (Therapist only)
 */
export const createSessionNote = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const {
      clientId,
      appointmentId,
      title,
      content,
      type,
      visibility = 'private',
      treatmentGoals,
      sessionSummary,
    } = req.body;

    if (!clientId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Client ID, note title, and content are required.',
      });
    }

    // Verify client belongs to therapist
    const client = await Client.findOne({ _id: clientId, therapist: therapistId });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found in your roster.' });
    }

    const note = await SessionNote.create({
      therapist: therapistId,
      client: clientId,
      appointment: appointmentId || null,
      title,
      content,
      type: type || 'Progress',
      visibility,
      treatmentGoals: treatmentGoals || [],
      sessionSummary: sessionSummary || '',
    });

    // If note is marked shared, notify the client
    if (visibility === 'shared') {
      await createNotification({
        userId: clientId,
        userModel: 'Client',
        title: 'New Session Note Available',
        message: `Your therapist has shared a session summary note: "${title}".`,
        type: 'session',
        link: '/portal/notes',
      });
    }

    const populatedNote = await SessionNote.findById(note._id).populate('client', 'name email');

    res.status(201).json({
      success: true,
      message: `Note created successfully (${visibility})`,
      note: populatedNote,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing session note (Therapist only)
 */
export const updateSessionNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const therapistId = req.session.user.id;
    const { title, content, type, visibility, treatmentGoals, sessionSummary } = req.body;

    const note = await SessionNote.findOne({ _id: id, therapist: therapistId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized.' });
    }

    const wasPrivate = note.visibility === 'private';

    if (title) note.title = title;
    if (content) note.content = content;
    if (type) note.type = type;
    if (visibility) note.visibility = visibility;
    if (treatmentGoals) note.treatmentGoals = treatmentGoals;
    if (sessionSummary !== undefined) note.sessionSummary = sessionSummary;

    await note.save();

    // If changed from private to shared, notify client
    if (wasPrivate && note.visibility === 'shared') {
      await createNotification({
        userId: note.client,
        userModel: 'Client',
        title: 'Session Note Shared',
        message: `A note "${note.title}" has been shared with your portal.`,
        type: 'session',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session note updated successfully',
      note,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a session note (Therapist only)
 */
export const deleteSessionNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const therapistId = req.session.user.id;

    const note = await SessionNote.findOneAndDelete({ _id: id, therapist: therapistId });
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Session note deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
