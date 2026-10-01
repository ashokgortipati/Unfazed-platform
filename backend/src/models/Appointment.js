import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    therapist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Therapist',
      required: [true, 'Therapist ID is required'],
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
    },
    date: {
      type: String, // Stored in YYYY-MM-DD format for precise date queries across timezones
      required: [true, 'Appointment date is required (YYYY-MM-DD)'],
    },
    startTime: {
      type: String, // HH:mm format e.g. "10:00"
      required: [true, 'Start time is required (HH:mm)'],
    },
    endTime: {
      type: String, // HH:mm format e.g. "10:50"
      required: [true, 'End time is required (HH:mm)'],
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    sessionType: {
      type: String,
      enum: ['Individual Therapy', 'Consultation', 'Follow-up', 'Crisis Session'],
      default: 'Individual Therapy',
    },
    notes: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index to speed up conflict detection queries
appointmentSchema.index({ therapist: 1, date: 1, status: 1 });
appointmentSchema.index({ client: 1, date: 1, status: 1 });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
