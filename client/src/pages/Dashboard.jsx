import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, appointmentApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppointmentModal } from '../components/appointments/AppointmentModal';
import { NoteModal } from '../components/notes/NoteModal';
import { AddClientModal } from '../components/clients/AddClientModal';
import {
  Users,
  Calendar,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Plus,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  Eye,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [selectedApptForReschedule, setSelectedApptForReschedule] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      setStats(res.data.stats);
      setUpcoming(res.data.upcomingAppointments || []);
      setRecentNotes(res.data.recentNotes || []);
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelAppointment = async (apptId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentApi.cancel(apptId, { cancellationReason: 'Cancelled from clinician dashboard' });
        fetchDashboardData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading practice dashboard..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sage-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sage-200 text-xs font-semibold backdrop-blur mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted Session Environment</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Doctor'}
          </h1>
          <p className="text-sage-100 text-sm mt-1 leading-relaxed">
            Here is your daily clinical overview. You have{' '}
            <strong className="text-white underline decoration-sage-400">
              {stats?.upcomingAppointmentsCount || 0} upcoming sessions
            </strong>{' '}
            and {stats?.activeClients || 0} active clients in treatment.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => setIsApptModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white text-sage-900 hover:bg-sage-50 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Session
            </button>
            <button
              onClick={() => setIsClientModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition backdrop-blur"
            >
              <Users className="w-3.5 h-3.5" />
              Add Client
            </button>
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition backdrop-blur"
            >
              <FileText className="w-3.5 h-3.5" />
              New Therapy Note
            </button>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
          <ShieldCheck className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Quick Statistics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Clients"
          value={stats?.activeClients || 0}
          icon={Users}
          color="sage"
          subtitle={`${stats?.totalClients || 0} total on patient roster`}
          badge="Active"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats?.upcomingAppointmentsCount || 0}
          icon={Calendar}
          color="teal"
          subtitle="Next 7 days scheduled"
        />
        <StatCard
          title="Sessions Completed"
          value={stats?.completedSessionsCount || 0}
          icon={CheckCircle2}
          color="indigo"
          subtitle="Total therapy sessions delivered"
        />
        <StatCard
          title="Pending Consents"
          value={stats?.pendingConsentCount || 0}
          icon={AlertTriangle}
          color={stats?.pendingConsentCount > 0 ? 'amber' : 'sage'}
          subtitle="Clients awaiting intake/consent"
          badge={stats?.pendingConsentCount > 0 ? 'Needs Attention' : 'All Clear'}
        />
      </div>

      {/* Two Column Layout: Upcoming Appointments & Recent Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments Column (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
              <p className="text-xs text-slate-500">Scheduled clinical sessions with clients</p>
            </div>
            <Link
              to="/appointments"
              className="text-xs font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1"
            >
              View calendar <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No upcoming sessions scheduled</p>
              <button
                onClick={() => setIsApptModalOpen(true)}
                className="mt-3 px-4 py-1.5 rounded-xl text-xs font-semibold text-sage-700 bg-sage-100 hover:bg-sage-200 transition"
              >
                + Schedule an Appointment
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt) => (
                <div
                  key={appt._id}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-sm shrink-0 border border-teal-200">
                      {appt.client?.name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/clients/${appt.client?._id}`}
                          className="font-semibold text-slate-800 text-sm hover:text-sage-600 transition"
                        >
                          {appt.client?.name}
                        </Link>
                        <Badge variant={appt.status}>{appt.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-sage-600" />
                          {appt.date}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-sage-600" />
                          {appt.startTime} - {appt.endTime}
                        </span>
                        <span className="hidden sm:inline text-slate-400">|</span>
                        <span className="hidden sm:inline">{appt.sessionType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Appointment action controls */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        setSelectedApptForReschedule(appt);
                        setIsApptModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 hover:bg-white border border-slate-200 transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancelAppointment(appt._id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Session Notes Column (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Recent Session Notes</h2>
                <p className="text-xs text-slate-500">Latest progress & summaries</p>
              </div>
              <Link
                to="/notes"
                className="text-xs font-semibold text-sage-600 hover:text-sage-700 flex items-center gap-1"
              >
                All notes <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentNotes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No session notes recorded yet</p>
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="mt-3 px-3 py-1 rounded-xl text-xs font-semibold text-sage-700 bg-sage-100 hover:bg-sage-200 transition"
                >
                  + Create Note
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentNotes.map((note) => (
                  <div
                    key={note._id}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{note.title}</h4>
                      <Badge variant={note.visibility} size="sm">
                        {note.visibility === 'private' ? (
                          <span className="flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Private
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Eye className="w-2.5 h-2.5" /> Shared
                          </span>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{note.content}</p>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Client: {note.client?.name || 'Client'}</span>
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="w-full py-2 rounded-xl text-xs font-semibold text-sage-700 bg-sage-50 hover:bg-sage-100 transition text-center"
            >
              + Add New Session Note
            </button>
          </div>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isApptModalOpen}
        onClose={() => {
          setIsApptModalOpen(false);
          setSelectedApptForReschedule(null);
        }}
        onSuccess={fetchDashboardData}
        initialData={selectedApptForReschedule}
      />

      {/* Session Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSuccess={fetchDashboardData}
      />

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
};
