import mongoose from 'mongoose';
import { seedDatabase } from '../utils/seedData.js';

let mongoMemoryInstance = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  // If explicit remote MongoDB URI (e.g. Atlas) is provided and not default localhost
  if (mongoUri && !mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
    try {
      console.log(`[Database] Connecting to MongoDB Atlas: ${mongoUri}...`);
      const conn = await mongoose.connect(mongoUri);
      console.log(`[Database] Connected to MongoDB Atlas: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error('[Database Error] Failed to connect to MongoDB Atlas:', err.message);
    }
  }

  // Fallback to embedded in-memory MongoDB for zero-config local testing
  try {
    console.log('[Database] Starting in-memory MongoDB server...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryInstance.getUri();

    const conn = await mongoose.connect(uri);
    console.log(`[Database] In-memory MongoDB Connected successfully: ${uri}`);

    // Seed initial demo therapist and clients
    console.log('[Database] Seeding initial practice data...');
    await seedDatabase(false);

    return conn;
  } catch (memErr) {
    console.error('[Database Error] In-memory DB failed:', memErr.message);
    // Last ditch try localhost
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/unfazed_db');
      console.log('[Database] Connected to localhost MongoDB daemon');
      return conn;
    } catch (localErr) {
      console.error('[Database Error] Localhost connection failed:', localErr.message);
      return null;
    }
  }
};
