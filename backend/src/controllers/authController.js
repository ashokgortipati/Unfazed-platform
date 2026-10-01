import { Therapist } from '../models/Therapist.js';
import { Client } from '../models/Client.js';

/**
 * Therapist Registration
 * Session-based authentication ONLY (No JWT, No bcrypt password hashing)
 */
export const registerTherapist = async (req, res, next) => {
  try {
    const { name, email, password, specializations, languages, bio, licenseNumber, experienceYears, education } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    const existingTherapist = await Therapist.findOne({ email: email.toLowerCase() });
    if (existingTherapist) {
      return res.status(409).json({ success: false, message: 'A therapist with this email already exists.' });
    }

    const therapist = await Therapist.create({
      name,
      email: email.toLowerCase(),
      password, // Plain text as explicitly mandated: "Do NOT use bcryptjs password hashing"
      specializations: specializations || ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness'],
      languages: languages || ['English'],
      bio: bio || '',
      licenseNumber: licenseNumber || '',
      experienceYears: experienceYears || 0,
      education: education || '',
    });

    // Establish session
    req.session.user = {
      id: therapist._id.toString(),
      role: 'therapist',
      name: therapist.name,
      email: therapist.email,
    };

    res.status(201).json({
      success: true,
      message: 'Therapist registered and logged in successfully',
      user: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        role: 'therapist',
        profilePhoto: therapist.profilePhoto,
        licenseNumber: therapist.licenseNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Therapist Login
 */
export const loginTherapist = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const therapist = await Therapist.findOne({ email: email.toLowerCase() });
    if (!therapist || therapist.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid therapist email or password.' });
    }

    // Set session
    req.session.user = {
      id: therapist._id.toString(),
      role: 'therapist',
      name: therapist.name,
      email: therapist.email,
    };

    res.status(200).json({
      success: true,
      message: 'Therapist logged in successfully',
      user: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
        role: 'therapist',
        profilePhoto: therapist.profilePhoto,
        specializations: therapist.specializations,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Client Portal Login
 */
export const loginClient = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const client = await Client.findOne({ email: email.toLowerCase() });
    if (!client || client.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid client credentials.' });
    }

    if (client.status === 'inactive') {
      return res.status(403).json({ success: false, message: 'Your client account is currently inactive. Please contact your therapist.' });
    }

    // Set session
    req.session.user = {
      id: client._id.toString(),
      role: 'client',
      name: client.name,
      email: client.email,
      therapistId: client.therapist.toString(),
    };

    res.status(200).json({
      success: true,
      message: 'Client logged into portal successfully',
      user: {
        id: client._id,
        name: client.name,
        email: client.email,
        role: 'client',
        therapistId: client.therapist,
        consentAgreed: client.consentData?.agreed || false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Authenticated User Session Status
 */
export const getCurrentSession = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(200).json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    const sessionUser = req.session.user;

    if (sessionUser.role === 'therapist') {
      const therapist = await Therapist.findById(sessionUser.id).select('-password');
      if (!therapist) {
        req.session.destroy();
        return res.status(200).json({ success: true, authenticated: false, user: null });
      }
      return res.status(200).json({
        success: true,
        authenticated: true,
        user: {
          id: therapist._id,
          name: therapist.name,
          email: therapist.email,
          role: 'therapist',
          specializations: therapist.specializations,
          languages: therapist.languages,
          bio: therapist.bio,
          profilePhoto: therapist.profilePhoto,
          licenseNumber: therapist.licenseNumber,
          experienceYears: therapist.experienceYears,
          education: therapist.education,
          availability: therapist.availability,
        },
      });
    } else if (sessionUser.role === 'client') {
      const client = await Client.findById(sessionUser.id).select('-password').populate('therapist', 'name email specializations profilePhoto');
      if (!client) {
        req.session.destroy();
        return res.status(200).json({ success: true, authenticated: false, user: null });
      }
      return res.status(200).json({
        success: true,
        authenticated: true,
        user: {
          id: client._id,
          name: client.name,
          email: client.email,
          phone: client.phone,
          role: 'client',
          status: client.status,
          therapist: client.therapist,
          intakeData: client.intakeData,
          consentData: client.consentData,
        },
      });
    }

    res.status(200).json({ success: true, authenticated: false, user: null });
  } catch (error) {
    next(error);
  }
};

/**
 * User Logout - Destroys session
 */
export const logout = (req, res, next) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.clearCookie('unfazed.sid');
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } else {
    res.status(200).json({ success: true, message: 'Already logged out' });
  }
};
