import { Therapist } from '../models/Therapist.js';

/**
 * Get Profile of logged in therapist
 */
export const getTherapistProfile = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const therapist = await Therapist.findById(therapistId).select('-password');
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }

    res.status(200).json({ success: true, therapist });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Therapist Profile details
 */
export const updateTherapistProfile = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const {
      name,
      specializations,
      languages,
      bio,
      profilePhoto,
      licenseNumber,
      experienceYears,
      education,
      availability,
    } = req.body;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist profile not found' });
    }

    if (name) therapist.name = name;
    if (specializations) therapist.specializations = specializations;
    if (languages) therapist.languages = languages;
    if (bio !== undefined) therapist.bio = bio;
    if (profilePhoto) therapist.profilePhoto = profilePhoto;
    if (licenseNumber !== undefined) therapist.licenseNumber = licenseNumber;
    if (experienceYears !== undefined) therapist.experienceYears = experienceYears;
    if (education !== undefined) therapist.education = education;
    if (availability) {
      therapist.availability = {
        ...therapist.availability.toObject(),
        ...availability,
      };
    }

    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Therapist profile updated successfully',
      therapist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Availability & Scheduling Rules (working hours, buffer time, duration)
 */
export const updateAvailability = async (req, res, next) => {
  try {
    const therapistId = req.session.user.id;
    const { workingDays, startHour, endHour, sessionDuration, bufferTime, timezone } = req.body;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    therapist.availability = {
      workingDays: workingDays || therapist.availability.workingDays,
      startHour: startHour || therapist.availability.startHour,
      endHour: endHour || therapist.availability.endHour,
      sessionDuration: sessionDuration !== undefined ? sessionDuration : therapist.availability.sessionDuration,
      bufferTime: bufferTime !== undefined ? bufferTime : therapist.availability.bufferTime,
      timezone: timezone || therapist.availability.timezone,
    };

    await therapist.save();

    res.status(200).json({
      success: true,
      message: 'Availability settings updated successfully',
      availability: therapist.availability,
    });
  } catch (error) {
    next(error);
  }
};
