import mongoose from 'mongoose';

const sessionNoteSchema = new mongoose.Schema(
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
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    type: {
      type: String,
      enum: ['Progress', 'Summary', 'Treatment Goals', 'Intake', 'Crisis', 'General'],
      default: 'Progress',
    },
    visibility: {
      type: String,
      enum: ['private', 'shared'],
      default: 'private',
      // 'private' = only therapist can see; 'shared' = therapist and client can see
    },
    treatmentGoals: {
      type: [String],
      default: [],
    },
    sessionSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

sessionNoteSchema.index({ therapist: 1, client: 1, visibility: 1 });

export const SessionNote = mongoose.model('SessionNote', sessionNoteSchema);
