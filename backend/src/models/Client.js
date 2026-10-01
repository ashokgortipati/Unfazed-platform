import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Client password is required for portal access'],
      // Strict constraint: NO password hashing / NO bcryptjs per user instruction
    },
    phone: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: true,
    },
    intakeData: {
      emergencyContact: {
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        relationship: { type: String, default: '' },
      },
      medicalHistory: { type: String, default: '' },
      currentSymptoms: { type: [String], default: [] },
      therapyGoals: { type: String, default: '' },
      previousTherapy: { type: Boolean, default: false },
      preferredContactMethod: { type: String, default: 'Email' },
      additionalNotes: { type: String, default: '' },
      submittedAt: { type: Date },
    },
    consentData: {
      agreed: { type: Boolean, default: false },
      signedAt: { type: Date },
      signatureName: { type: String, default: '' },
      termsVersion: { type: String, default: '1.0' },
      ipAddress: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

export const Client = mongoose.model('Client', clientSchema);
