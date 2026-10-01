import React, { useState, useEffect } from 'react';
import { appointmentApi, notesApi, fileApi, clientApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { IntakeFormModal } from '../../components/clients/IntakeFormModal';
import { ConsentFormModal } from '../../components/clients/ConsentFormModal';
import { AppointmentModal } from '../../components/appointments/AppointmentModal';
import {
  Calendar,
  Clock,
  FileText,
  FileCheck,
  ShieldCheck,
  Download,
  AlertCircle,
  Eye,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';

export const ClientPortal = () => {
  const { user, checkSession } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const [apptsRes, notesRes, filesRes] = await Promise.all([
        appointmentApi.getAll(),
        notesApi.getAll(), // Will be strictly database-filtered on backend: client only receives visibility: 'shared'
        fileApi.getAll(),
      ]);
      setAppointments(apptsRes.data.appointments || []);
      setSharedNotes(notesRes.data.notes || []);
      setFiles(filesRes.data.documents || []);
    } catch (err) {
      console.error('Failed to load client portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const hasConsent = user?.consentData?.agreed;
  const hasIntake = !!user?.intakeData?.submittedAt;

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingAppointments = appointments.filter(
    (a) => a.date >= todayStr && a.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    (a) => a.date < todayStr || a.status === 'completed' || a.status === 'cancelled'
  );

  if (loading) {
    return <LoadingSpinner text="Connecting to your personal wellness portal..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />
            <span>Personal Client Wellness Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Welcome to your secure patient workspace. Access upcoming appointments, your therapist's
            shared session takeaways, and completed intake documentation.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsBookApptOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Book a Session
            </button>
          </div>
        </div>
      </div>

      {/* Action Banners for Pending Consent / Intake */}
      {(!hasConsent || !hasIntake) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!hasConsent && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Informed Consent Agreement Required</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-1">
                  Please review and digitally sign the practice consent agreement.
                </p>
              </div>
              <button
                onClick={() => setIsConsentOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition shrink-0"
              >
                Sign Now
              </button>
            </div>
          )}

          {!hasIntake && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-teal-800 font-bold text-xs">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span>Clinical Intake Questionnaire Pending</span>
                </div>
                <p className="text-[11px] text-teal-700 mt-1">
                  Complete your symptoms and emergency contact details for your clinician.
                </p>
              </div>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition shrink-0"
              >
                Fill Intake
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Upcoming Sessions & Shared Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upcoming Sessions & History (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming sessions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Upcoming Appointments</span>
              <button
                onClick={() => setIsBookApptOpen(true)}
                className="text-xs text-teal-700 font-semibold hover:underline"
              >
                + Schedule
              </button>
            </h2>

            {upcomingAppointments.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No upcoming appointments scheduled</p>
                <button
                  onClick={() => setIsBookApptOpen(true)}
                  className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-100 hover:bg-teal-200 transition"
                >
                  Book Your Next Session
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((appt) => (
                  <div
                    key={appt._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{appt.sessionType}</span>
                        <Badge variant={appt.status}>{appt.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-teal-600" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-teal-600" />
                          {appt.startTime} - {appt.endTime}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Shared Session Notes (Strictly Shared Only) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Shared Session Takeaways & Notes</h2>
                <p className="text-xs text-slate-500">
                  Notes and homework assigned by your therapist for your personal review
                </p>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Shared With You</span>
              </div>
            </div>

            {sharedNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No shared notes available yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Your therapist will share session summaries and homework exercises here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {sharedNotes.map((note) => (
                  <div
                    key={note._id}
                    className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{note.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {note.sessionSummary && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700">
                        <strong>Session Summary: </strong> {note.sessionSummary}
                      </div>
                    )}

                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {note.content}
                    </p>

                    {note.treatmentGoals?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-slate-500 block mb-1">
                          Action Items & Coping Exercises:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {note.treatmentGoals.map((goal, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-teal-50 text-teal-800 border border-teal-200 font-medium"
                            >
                              <CheckCircle2 className="w-3 h-3 text-teal-600" />
                              {goal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Status, Documents & Consent Status */}
        <div className="space-y-6">
          {/* Patient Care Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              My Clinical Care Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Consent Agreement:</span>
                {hasConsent ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Signed
                  </span>
                ) : (
                  <button
                    onClick={() => setIsConsentOpen(true)}
                    className="text-amber-600 font-semibold hover:underline"
                  >
                    Action Needed →
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500">Intake Questionnaire:</span>
                {hasIntake ? (
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                  </span>
                ) : (
                  <button
                    onClick={() => setIsIntakeOpen(true)}
                    className="text-teal-600 font-semibold hover:underline"
                  >
                    Action Needed →
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => setIsConsentOpen(true)}
                className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Consent
              </button>
              <button
                onClick={() => setIsIntakeOpen(true)}
                className="flex-1 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                View Intake
              </button>
            </div>
          </div>

          {/* Shared Worksheets & Files */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Worksheets & Practice Files</h3>
            {files.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No documents shared yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {files.map((file) => (
                  <div key={file._id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-800 block line-clamp-1">
                        {file.title}
                      </span>
                      <span className="text-[10px] text-slate-400">{file.category}</span>
                    </div>
                    <a
                      href={fileApi.downloadUrl(file._id)}
                      className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <IntakeFormModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        clientId={user?.id || user?._id}
        existingData={user?.intakeData}
        onSuccess={async () => {
          await checkSession();
          fetchPortalData();
        }}
      />

      <ConsentFormModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        clientId={user?.id || user?._id}
        existingData={user?.consentData}
        onSuccess={async () => {
          await checkSession();
          fetchPortalData();
        }}
      />

      <AppointmentModal
        isOpen={isBookApptOpen}
        onClose={() => setIsBookApptOpen(false)}
        onSuccess={fetchPortalData}
      />
    </div>
  );
};
