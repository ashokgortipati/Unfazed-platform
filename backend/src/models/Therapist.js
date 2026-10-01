import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Therapist name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // Strict constraint: NO password hashing / NO bcryptjs per user instruction
    },
    specializations: {
      type: [String],
      default: ['Cognitive Behavioral Therapy (CBT)', 'Mindfulness-Based Therapy', 'Anxiety & Stress Management'],
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    bio: {
      type: String,
      default: 'Licensed Clinical Psychologist dedicated to helping individuals build resilience, emotional clarity, and lifelong wellness.',
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1594824813639-51a700d1c79a?auto=format&fit=crop&q=80&w=300',
    },
    licenseNumber: {
      type: String,
      default: 'PSY-98421-CA',
    },
    experienceYears: {
      type: Number,
      default: 8,
    },
    education: {
      type: String,
      default: 'Psy.D. in Clinical Psychology, Stanford University',
    },
    availability: {
      workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
      startHour: {
        type: String,
        default: '09:00',
      },
      endHour: {
        type: String,
        default: '17:00',
      },
      sessionDuration: {
        type: Number,
        default: 50, // in minutes
      },
      bufferTime: {
        type: Number,
        default: 10, // buffer time between appointments in minutes
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Therapist = mongoose.model('Therapist', therapistSchema);
