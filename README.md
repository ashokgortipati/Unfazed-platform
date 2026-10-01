# 🌿 Unfazed — Mental Wellness & Therapist Management Platform

A clinical-grade, session-authenticated full-stack mental wellness and psychotherapy management platform built with **Node.js, Express, MongoDB Atlas, Mongoose, React (Vite), React Router, Axios, Context API, and Tailwind CSS**.

---

## 📌 Architectural Guarantees & Constraints
- 🚫 **No Payment Systems**: Zero payment gateways, Razorpay, Stripe, invoices, subscriptions, or billing modules.
- 🚫 **No JWT Authentication**: Authentication is entirely stateful and session-based using HTTP-only secure session cookies (`unfazed.sid`) with MongoDB session storage (`connect-mongo`).
- 🚫 **No Password Hashing**: Passwords stored and validated directly per explicit technical requirements.
- 🛡️ **Strict Database-Level Note Privacy**: Private therapist clinical notes are strictly shielded at the database query level. Clients querying `/api/notes` can **only ever retrieve notes where `visibility === 'shared'`**. Private therapist clinical impressions are never queried or transmitted over the wire.
- ⏱️ **Double-Booking Prevention**: The scheduling service validates time overlaps `(startA < endB && endA > startB)` considering session duration and clinician buffer periods.
- 📝 **Digital Informed Consent**: Stores legal typed electronic signature, timestamp, and terms version in MongoDB.
- 📋 **Clinical Intake Questionnaire**: Patient symptoms, medical history, and emergency contacts stored securely.

---

## 📁 Complete Folder Structure

```
unfazed/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # MongoDB Atlas / local connection logic
│   │   │   └── session.js         # express-session + connect-mongo configuration
│   │   ├── controllers/
│   │   │   ├── authController.js        # Therapist & Client session login, registration, logout
│   │   │   ├── therapistController.js   # Clinician profile, credentials, availability rules
│   │   │   ├── clientController.js      # Client roster, search, filter, intake & consent
│   │   │   ├── appointmentController.js # Scheduling, double-booking prevention, reschedule, cancel
│   │   │   ├── sessionNoteController.js # Clinical notes CRUD + DB-level visibility filtering
│   │   │   ├── notificationController.js# In-app notifications & read/unread state
│   │   │   ├── fileController.js        # Document upload, download, metadata, and access control
│   │   │   └── dashboardController.js   # Aggregated practice analytics & KPI metrics
│   │   ├── middleware/
│   │   │   ├── auth.js            # Session validation (requireAuth, requireTherapist, requireClient)
│   │   │   ├── upload.js          # Multer storage configuration for medical documents
│   │   │   └── errorHandler.js    # Centralized API error handling
│   │   ├── models/
│   │   │   ├── Therapist.js       # Clinician model (credentials, bio, availability rules)
│   │   │   ├── Client.js          # Client model (intake responses, digital consent, status)
│   │   │   ├── Appointment.js     # Session model (date, times, timezone, status)
│   │   │   ├── SessionNote.js     # Therapy notes (category, private/shared visibility, goals)
│   │   │   ├── Notification.js    # In-app alert model
│   │   │   └── Document.js        # File metadata model
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── therapistRoutes.js
│   │   │   ├── clientRoutes.js
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── sessionNoteRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   ├── fileRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── services/
│   │   │   ├── schedulingService.js   # Time conflict detection & slot generation
│   │   │   └── notificationService.js # Event dispatcher for clinical reminders
│   │   ├── utils/
│   │   │   ├── validators.js      # Input validators
│   │   │   └── seedData.js        # Realistic demo database seeder
│   │   └── server.js              # Express app bootstrap, CORS, session cookie setup
│   ├── .env                       # Environment variables
│   └── package.json
│
└── client/
    ├── src/
    │   ├── api/
    │   │   ├── axios.js           # Axios instance with withCredentials: true
    │   │   └── endpoints.js       # Modular API integration layer
    │   ├── context/
    │   │   ├── AuthContext.jsx         # Session state, login, register, logout, active user
    │   │   └── NotificationContext.jsx # In-app notification center & unread counter
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx         # Navigation bar with user profile & alert dropdown
    │   │   │   ├── Sidebar.jsx        # Role-based workspace sidebar
    │   │   │   ├── Layout.jsx         # Layout wrapper
    │   │   │   ├── ProtectedRoute.jsx # Session-guarded route wrapper
    │   │   │   ├── Modal.jsx          # Accessible modal dialog
    │   │   │   ├── StatCard.jsx       # Analytics KPI card
    │   │   │   ├── Badge.jsx          # Status pill badge
    │   │   │   └── LoadingSpinner.jsx # Loading indicator
    │   │   ├── appointments/
    │   │   │   └── AppointmentModal.jsx # Schedule/reschedule modal with conflict banner
    │   │   ├── notes/
    │   │   │   └── NoteModal.jsx      # Note editor with private/shared toggle & goals
    │   │   └── clients/
    │   │       ├── AddClientModal.jsx # New client onboarding modal
    │   │       ├── IntakeFormModal.jsx# Digital intake questionnaire modal
    │   │       └── ConsentFormModal.jsx# Informed consent digital signature modal
    │   ├── pages/
    │   │   ├── Login.jsx              # Tabbed login for therapist & client portal
    │   │   ├── Register.jsx           # Therapist registration
    │   │   ├── Dashboard.jsx          # Therapist KPI dashboard, upcoming sessions, recent notes
    │   │   ├── TherapistProfile.jsx   # Profile, photo, specializations, credentials
    │   │   ├── Clients.jsx            # Client directory with search and active/inactive filter
    │   │   ├── ClientDetails.jsx      # Client profile, intake data, consent, notes, history, files
    │   │   ├── Appointments.jsx       # Scheduling calendar/list, rescheduling, cancellations
    │   │   ├── SessionNotes.jsx       # Clinical notes repository (progress, summary, goals)
    │   │   ├── Notifications.jsx      # Notification center
    │   │   ├── Settings.jsx           # Working hours, duration, buffer time, timezone
    │   │   └── portal/
    │   │       └── ClientPortal.jsx   # Dedicated Client Portal (shared notes only, consent, intake)
    │   ├── App.jsx                    # Route hierarchy & role guards
    │   ├── main.jsx
    │   └── index.css                  # Calming wellness color tokens & typography
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## 🚀 Step-by-Step Implementation & Run Guide

### 1. Prerequisites
- **Node.js**: v18+ (verified on v24)
- **MongoDB**: MongoDB Atlas connection URI or local MongoDB daemon (`mongodb://127.0.0.1:27017/unfazed_db`)

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure `.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/unfazed_db
   SESSION_SECRET=unfazed_session_secret_key_789456123!@#
   CLIENT_URL=http://localhost:5173
   ```
   *(For MongoDB Atlas, replace `MONGODB_URI` with your Atlas SRV string).*
4. Seed demo data (creates Dr. Elena Vance and clients with sessions):
   ```bash
   npm run seed
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   # Health check at http://localhost:5000/api/health
   ```

### 3. Frontend Setup
1. In a second terminal, navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   # Web application runs at http://localhost:5173
   ```

---

## 🔑 Demo Credentials (Autofill Available on Login Page)

| Role | Email | Password | What You Can Access |
| :--- | :--- | :--- | :--- |
| **Therapist** | `dr.elena@unfazed.health` | `Password123!` | Full clinical workspace: Dashboard, client records, private + shared notes, scheduling, files, practice settings |
| **Client** | `sarah.j@example.com` | `Client123!` | Personal Client Portal: Upcoming sessions, digital consent form, intake responses, **only shared notes** (private clinical notes are shielded) |

---

## 🔒 Security & Architectural Highlights

### 1. Session-Based Authentication (No JWT)
- When a user logs in via `POST /api/auth/login-therapist` or `POST /api/auth/login-client`, an authenticated session object is created in Express:
  ```js
  req.session.user = { id: therapist._id.toString(), role: 'therapist', name: therapist.name, email: therapist.email };
  ```
- The browser stores the signed `unfazed.sid` cookie with `httpOnly: true` and `sameSite: 'lax'`.
- Axios is configured globally with `withCredentials: true` to transmit the session cookie on every request.

### 2. Private vs Shared Notes (Database-Level Privacy)
- In `sessionNoteController.js`, queries check the authenticated user's role:
  ```javascript
  if (sessionUser.role === 'client') {
    // Hard database-level filter: private therapist notes are NEVER returned
    filter.client = sessionUser.id;
    filter.visibility = 'shared';
  }
  ```
- Any direct attempt by a client to access note details by ID verifies `note.visibility === 'shared'` and returns `403 Forbidden` if private.

### 3. Double-Booking Prevention
- When an appointment is scheduled or rescheduled, `checkAppointmentConflict` queries MongoDB for existing sessions on the target date where:
  - `(newStart < existingEnd && newEnd > existingStart)`
  - Returns descriptive conflict details and prevents database write if an overlap occurs.
