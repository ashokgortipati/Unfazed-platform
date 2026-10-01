import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Therapist } from '../models/Therapist.js';
import { Client } from '../models/Client.js';
import { Appointment } from '../models/Appointment.js';
import { SessionNote } from '../models/SessionNote.js';
import { Notification } from '../models/Notification.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/unfazed_db';

export const seedDatabase = async (shouldExit = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(mongoUri);
    }
    console.log('[Seed] Database connected. Preparing demo collections...');

    await Therapist.deleteMany({});
    await Client.deleteMany({});
    await Appointment.deleteMany({});
    await SessionNote.deleteMany({});
    await Notification.deleteMany({});

    console.log('[Seed] Seeding Demo Therapist...');
    const therapist = await Therapist.create({
      name: 'Dr. Elena Vance, Psy.D.',
      email: 'dr.elena@unfazed.health',
      password: 'Password123!', // No bcrypt hashing per instructions
      specializations: ['Cognitive Behavioral Therapy (CBT)', 'Trauma & PTSD', 'Anxiety & Panic Disorders', 'Mindfulness Coaching'],
      languages: ['English', 'Spanish'],
      bio: 'Dr. Elena Vance has 10+ years of clinical experience specializing in evidence-based psychotherapy, helping clients navigate life transitions and emotional resilience.',
      profilePhoto: 'https://images.unsplash.com/photo-1594824813639-51a700d1c79a?auto=format&fit=crop&q=80&w=300',
      licenseNumber: 'PSY-CA-94821',
      experienceYears: 10,
      education: 'Doctor of Psychology (Psy.D.) - Stanford University Medical School',
      availability: {
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        startHour: '09:00',
        endHour: '17:00',
        sessionDuration: 50,
        bufferTime: 10,
        timezone: 'America/New_York',
      },
    });

    console.log('[Seed] Seeding Demo Clients...');
    const client1 = await Client.create({
      name: 'Sarah Jenkins',
      email: 'sarah.j@example.com',
      password: 'Client123!',
      phone: '+1 (555) 234-5678',
      dateOfBirth: new Date('1994-06-15'),
      status: 'active',
      therapist: therapist._id,
      intakeData: {
        emergencyContact: {
          name: 'Mark Jenkins',
          phone: '+1 (555) 876-5432',
          relationship: 'Spouse',
        },
        medicalHistory: 'Mild recurring migraines, no psychiatric hospitalizations. Currently taking multivitamin and magnesium.',
        currentSymptoms: ['Generalized Anxiety', 'Sleep disturbances', 'Workplace burnout'],
        therapyGoals: 'Develop healthy coping strategies for work-related anxiety and establish a consistent mindfulness routine.',
        previousTherapy: true,
        preferredContactMethod: 'Email',
        additionalNotes: 'Prefers afternoon appointments due to morning work meetings.',
        submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      consentData: {
        agreed: true,
        signatureName: 'Sarah Jenkins',
        signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        termsVersion: '1.0',
        ipAddress: '192.168.1.101',
      },
    });

    const client2 = await Client.create({
      name: 'David Miller',
      email: 'david.m@example.com',
      password: 'Client123!',
      phone: '+1 (555) 345-6789',
      dateOfBirth: new Date('1988-11-23'),
      status: 'active',
      therapist: therapist._id,
      intakeData: {
        emergencyContact: {
          name: 'Rachel Miller',
          phone: '+1 (555) 765-4321',
          relationship: 'Sister',
        },
        medicalHistory: 'No chronic physical illnesses.',
        currentSymptoms: ['Social anxiety', 'Imposter syndrome'],
        therapyGoals: 'Build social confidence in team leadership settings.',
        previousTherapy: false,
        preferredContactMethod: 'Phone',
        additionalNotes: '',
        submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      consentData: {
        agreed: true,
        signatureName: 'David Miller',
        signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        termsVersion: '1.0',
        ipAddress: '192.168.1.105',
      },
    });

    const client3 = await Client.create({
      name: 'Maya Patel',
      email: 'maya.p@example.com',
      password: 'Client123!',
      phone: '+1 (555) 456-7890',
      dateOfBirth: new Date('1999-03-30'),
      status: 'inactive',
      therapist: therapist._id,
      intakeData: {},
      consentData: { agreed: false },
    });

    console.log('[Seed] Seeding Demo Appointments...');
    const today = new Date();
    const formatDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(today.getDate() + offsetDays);
      return d.toISOString().split('T')[0];
    };

    const appt1 = await Appointment.create({
      therapist: therapist._id,
      client: client1._id,
      date: formatDate(1), // Tomorrow
      startTime: '10:00',
      endTime: '10:50',
      status: 'scheduled',
      timezone: 'America/New_York',
      sessionType: 'Individual Therapy',
      notes: 'Focus on weekly thought-record worksheet and review sleep hygiene steps.',
    });

    const appt2 = await Appointment.create({
      therapist: therapist._id,
      client: client2._id,
      date: formatDate(2), // In 2 days
      startTime: '14:00',
      endTime: '14:50',
      status: 'scheduled',
      timezone: 'America/New_York',
      sessionType: 'Individual Therapy',
      notes: 'Initial clinical assessment and goal setting.',
    });

    const appt3 = await Appointment.create({
      therapist: therapist._id,
      client: client1._id,
      date: formatDate(-7), // 7 days ago
      startTime: '11:00',
      endTime: '11:50',
      status: 'completed',
      timezone: 'America/New_York',
      sessionType: 'Individual Therapy',
      notes: 'Client presented calm, completed initial intake review.',
    });

    console.log('[Seed] Seeding Demo Notes...');
    // 1. Private therapist note (NEVER visible to client)
    await SessionNote.create({
      therapist: therapist._id,
      client: client1._id,
      appointment: appt3._id,
      title: 'Clinical Impression & Diagnostic Thoughts',
      content: 'Client exhibits signs of moderate generalized anxiety disorder. Subconscious perfectionism triggers avoidance behaviors when overwhelmed at work. Recommended continuation of CBT thought logs.',
      type: 'Progress',
      visibility: 'private', // STRICTLY PRIVATE: Only therapist sees this
      treatmentGoals: ['Identify cognitive distortions in high-stress work scenarios', 'Daily 10-minute progressive muscle relaxation'],
      sessionSummary: 'Reviewed baseline symptoms. Client responsive to psychoeducation on the amygdala response.',
    });

    // 2. Shared note (visible to client in Client Portal)
    await SessionNote.create({
      therapist: therapist._id,
      client: client1._id,
      appointment: appt3._id,
      title: 'Session Takeaway & Weekly Homework',
      content: 'Key focus: Notice "catastrophizing" thoughts before team meetings. Remember to practice the 4-7-8 breathing exercise whenever heart rate spikes. Great progress on identifying trigger patterns!',
      type: 'Summary',
      visibility: 'shared', // SHARED: Client can view this in client portal
      treatmentGoals: ['Practice 4-7-8 breathing twice daily', 'Record 3 thought reframings in journal'],
      sessionSummary: 'Great collaborative discussion on anxiety triggers and self-compassion practices.',
    });

    console.log('[Seed] Seeding Notifications...');
    await Notification.create({
      user: therapist._id,
      userModel: 'Therapist',
      title: 'Upcoming Session Reminder',
      message: `You have an appointment tomorrow at 10:00 with Sarah Jenkins.`,
      type: 'appointment',
      link: '/appointments',
    });

    await Notification.create({
      user: client1._id,
      userModel: 'Client',
      title: 'Appointment Confirmed',
      message: `Your session with Dr. Elena Vance is confirmed for tomorrow at 10:00.`,
      type: 'appointment',
      link: '/portal/appointments',
    });

    console.log('[Seed] Database successfully seeded with rich demo data!');
    console.log('---------------------------------------------------------');
    console.log('DEMO CREDENTIALS:');
    console.log('Therapist Login: dr.elena@unfazed.health | Password123!');
    console.log('Client Login:    sarah.j@example.com    | Client123!');
    console.log('---------------------------------------------------------');

    if (shouldExit) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed Error]:', error);
    if (shouldExit) {
      process.exit(1);
    }
  }
};

if (process.argv[1].endsWith('seedData.js')) {
  seedDatabase();
}
