import fs from 'fs';
import path from 'path';
import { Document } from '../models/Document.js';
import { Client } from '../models/Client.js';
import { createNotification } from '../services/notificationService.js';

/**
 * Upload a document (Therapist or Client)
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a file to upload.' });
    }

    const sessionUser = req.session.user;
    const { title, category, clientId, visibility = 'private' } = req.body;

    let targetTherapistId;
    let targetClientId;
    let effectiveVisibility = visibility;

    if (sessionUser.role === 'therapist') {
      targetTherapistId = sessionUser.id;
      targetClientId = clientId || null;
    } else {
      // Client uploading
      targetClientId = sessionUser.id;
      const client = await Client.findById(sessionUser.id);
      if (!client) return res.status(404).json({ success: false, message: 'Client not found' });
      targetTherapistId = client.therapist;
      effectiveVisibility = 'shared'; // Files uploaded by client are always shared with their therapist
    }

    const document = await Document.create({
      title: title || req.file.originalname,
      originalName: req.file.originalname,
      filename: req.file.filename,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: category || 'Other',
      uploadedBy: sessionUser.id,
      uploadedByModel: sessionUser.role === 'therapist' ? 'Therapist' : 'Client',
      therapist: targetTherapistId,
      client: targetClientId,
      visibility: effectiveVisibility,
    });

    // Notify other party
    if (sessionUser.role === 'therapist' && targetClientId && effectiveVisibility === 'shared') {
      await createNotification({
        userId: targetClientId,
        userModel: 'Client',
        title: 'New Document Shared',
        message: `Your therapist uploaded a new document: "${document.title}".`,
        type: 'system',
        link: '/portal/documents',
      });
    } else if (sessionUser.role === 'client') {
      await createNotification({
        userId: targetTherapistId,
        userModel: 'Therapist',
        title: 'Client Document Uploaded',
        message: `Client ${sessionUser.name} uploaded a file: "${document.title}".`,
        type: 'system',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      document,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List documents with access control
 */
export const getFiles = async (req, res, next) => {
  try {
    const sessionUser = req.session.user;
    const { clientId, category } = req.query;

    const filter = {};

    if (sessionUser.role === 'client') {
      // Client can only view files where they are the client AND visibility is shared
      filter.client = sessionUser.id;
      filter.visibility = 'shared';
    } else if (sessionUser.role === 'therapist') {
      filter.therapist = sessionUser.id;
      if (clientId) {
        filter.client = clientId;
      }
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    const documents = await Document.find(filter)
      .populate('client', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Download a file with access check
 */
export const downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Access control check
    if (sessionUser.role === 'client') {
      if (doc.client?.toString() !== sessionUser.id || doc.visibility !== 'shared') {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    } else if (sessionUser.role === 'therapist') {
      if (doc.therapist?.toString() !== sessionUser.id) {
        return res.status(403).json({ success: false, message: 'Unauthorized access.' });
      }
    }

    if (!fs.existsSync(doc.filePath)) {
      return res.status(404).json({ success: false, message: 'File not found on server disk.' });
    }

    res.download(doc.filePath, doc.originalName);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a document
 */
export const deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Only therapist or the original uploader can delete
    if (sessionUser.role === 'therapist' && doc.therapist.toString() !== sessionUser.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }
    if (sessionUser.role === 'client' && doc.uploadedBy.toString() !== sessionUser.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    // Remove from disk if exists
    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
