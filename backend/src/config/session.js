import session from 'express-session';
import MongoStore from 'connect-mongo';

export const configureSession = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET || 'unfazed_secure_session_secret_2026';

  let store = undefined;

  // Use MongoStore if explicit MONGODB_URI is provided in production
  if (isProduction && process.env.MONGODB_URI) {
    try {
      store = MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 60 * 60 * 24 * 7,
      });
      console.log('[Session] Configured persistent MongoStore for sessions');
    } catch (err) {
      console.warn('[Session Warning] Using in-memory session store:', err.message);
    }
  } else {
    console.log('[Session] Using high-performance in-memory session store');
  }

  return session({
    name: 'unfazed.sid',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  });
};
