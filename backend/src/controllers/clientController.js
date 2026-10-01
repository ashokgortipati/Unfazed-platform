import { Client } from '../models/Client.js';
import { Appointment } from '../models/Appointment.js';
import { SessionNote } from '../models/SessionNote.js';
import { createNotification } from '../services/notificationService.js';

/**
 * List all clients for the logged in therapist with search & filter
 */
export const getClients = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const { search, status } = req.query;

    const filter = { therapist: therapistId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
    }

    const clients = await Client.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clients.length,
      clients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new client under the therapist
 */
export const addClient = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const { name, email, password, phone, dateOfBirth, status, intakeData, consentData } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and portal password are required.',
      });
    }

    const existingClient = await Client.findOne({ email: email.toLowerCase() });
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'A client with this email already exists.',
      });
    }

    const client = await Client.create({
      name,
      email: email.toLowerCase(),
      password, // Plain text as explicitly mandated (no bcryptjs)
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      status: status || 'active',
      therapist: therapistId,
      intakeData: intakeData || {},
      consentData: consentData || { agreed: false },
    });

    // Send notification
    await createNotification({
      userId: therapistId,
      userModel: 'Therapist',
      title: 'New Client Registered',
      message: `Client ${client.name} has been added to your patient roster.`,
      type: 'intake',
    });

    res.status(201).json({
      success: true,
      message: 'Client added successfully',
      client: {
        id: client._id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        status: client.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single client details by ID (for therapist or the client themselves)
 */
export const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user;

    // Security check: If client, ensure they can only view their own profile
    if (sessionUser.role === 'client' && sessionUser.id !== id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const client = await Client.findById(id).select('-password');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    // Security check: If therapist, ensure this client belongs to them
    if (sessionUser.role === 'therapist' && client.therapist.toString() !== sessionUser.id) {
      return res.status(403).json({ success: false, message: 'Client does not belong to this therapist.' });
    }

    res.status(200).json({ success: true, client });
  } catch (error) {
    next(error);
  }
};

/**
 * Update client profile / status
 */
export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const therapistId = req.session.user.id;
    const { name, phone, dateOfBirth, status, password } = req.body;

    const client = await Client.findOne({ _id: id, therapist: therapistId });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found or unauthorized.' });
    }

    if (name) client.name = name;
    if (phone !== undefined) client.phone = phone;
    if (dateOfBirth !== undefined) client.dateOfBirth = dateOfBirth;
    if (status) client.status = status;
    if (password) client.password = password; // updated if specified

    await client.save();

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      client,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete client and clean up associated records
 */
export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const therapistId = req.session.user.id;

    const client = await Client.findOneAndDelete({ _id: id, therapist: therapistId });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found or unauthorized.' });
    }

    // Clean up related appointments and session notes
    await Appointment.deleteMany({ client: id });
    await SessionNote.deleteMany({ client: id });

    res.status(200).json({
      success: true,
      message: 'Client and associated history removed successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit or update Intake Questionnaire
 * Callable by both client (self) or therapist
 */
export const submitIntakeForm = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const sessionUser = req.session.user;

    // Check authorization
    if (sessionUser.role === 'client' && sessionUser.id !== clientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const {
      emergencyContact,
      medicalHistory,
      currentSymptoms,
      therapyGoals,
      previousTherapy,
      preferredContactMethod,
      additionalNotes,
    } = req.body;

    client.intakeData = {
      emergencyContact: emergencyContact || client.intakeData?.emergencyContact || {},
      medicalHistory: medicalHistory !== undefined ? medicalHistory : client.intakeData?.medicalHistory,
      currentSymptoms: currentSymptoms || client.intakeData?.currentSymptoms || [],
      therapyGoals: therapyGoals !== undefined ? therapyGoals : client.intakeData?.therapyGoals,
      previousTherapy: previousTherapy !== undefined ? previousTherapy : client.intakeData?.previousTherapy,
      preferredContactMethod: preferredContactMethod || client.intakeData?.preferredContactMethod || 'Email',
      additionalNotes: additionalNotes !== undefined ? additionalNotes : client.intakeData?.additionalNotes,
      submittedAt: new Date(),
    };

    await client.save();

    // Notify therapist if submitted by client
    if (sessionUser.role === 'client') {
      await createNotification({
        userId: client.therapist,
        userModel: 'Therapist',
        title: 'Intake Questionnaire Submitted',
        message: `${client.name} has submitted their clinical intake questionnaire.`,
        type: 'intake',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Intake questionnaire saved successfully',
      intakeData: client.intakeData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit Digital Consent Form
 */
export const submitConsentForm = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const sessionUser = req.session.user;

    if (sessionUser.role === 'client' && sessionUser.id !== clientId) {
      return res.status(403).json({ success: false, message: 'Unauthorized action.' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found.' });
    }

    const { signatureName, agreed, termsVersion = '1.0' } = req.body;

    if (!agreed || !signatureName) {
      return res.status(400).json({
        success: false,
        message: 'Must agree to terms and provide a legal typed signature.',
      });
    }

    client.consentData = {
      agreed: true,
      signatureName,
      signedAt: new Date(),
      termsVersion,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    };

    await client.save();

    // Notify therapist
    await createNotification({
      userId: client.therapist,
      userModel: 'Therapist',
      title: 'Consent Agreement Signed',
      message: `${client.name} has signed the informed consent agreement.`,
      type: 'intake',
    });

    res.status(200).json({
      success: true,
      message: 'Consent agreement signed and recorded successfully',
      consentData: client.consentData,
    });
  } catch (error) {
    next(error);
  }
};
