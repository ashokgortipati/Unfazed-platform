import React, { useState, useEffect } from 'react';
import { appointmentApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { AppointmentModal } from '../components/appointments/AppointmentModal';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';

export const Appointments = () => {
  const { isTherapist } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentApi.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        date: dateFilter || undefined,
      });
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const handleCancel = async (id) => {
    const reason = window.prompt('Please enter cancellation reason:');
    if (reason !== null) {
      try {
        await appointmentApi.cancel(id, { cancellationReason: reason || 'Cancelled by user' });
        fetchAppointments();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Therapy Appointments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time scheduling with conflict detection & double-booking prevention
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedAppt(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Schedule New Session
        </button>
      </div>

      {/* Filter and Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="rescheduled">Rescheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-700">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Protection Pill */}
        <div className="ml-auto hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-sage-800 text-[11px] font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-sage-600" />
          <span>Double Booking Prevention Active</span>
        </div>
      </div>

      {/* Appointments List View */}
      {loading ? (
        <LoadingSpinner text="Retrieving schedule..." />
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-soft">
          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No appointments scheduled</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {statusFilter !== 'all' || dateFilter
              ? 'No appointments found with current filters.'
              : 'Your schedule is currently clear.'}
          </p>
          <button
            onClick={() => {
              setSelectedAppt(null);
              setIsModalOpen(true);
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 transition"
          >
            + Book Appointment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appointments.map((appt) => {
            const isCompleted = appt.status === 'completed';
            const isCancelled = appt.status === 'cancelled';

            return (
              <div
                key={appt._id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-soft hover:shadow-card transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-semibold text-sage-700 uppercase tracking-wider block">
                        {appt.sessionType}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {isTherapist ? appt.client?.name : appt.therapist?.name}
                      </h3>
                    </div>
                    <Badge variant={appt.status}>{appt.status}</Badge>
                  </div>

                  {/* Date & Time details */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Date
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-sage-600" />
                        {appt.date}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                        Time Slot
                      </span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-sage-600" />
                        {appt.startTime} - {appt.endTime}
                      </span>
                    </div>
                  </div>

                  {appt.notes && (
                    <p className="mt-3 text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      <strong>Prep Note:</strong> {appt.notes}
                    </p>
                  )}

                  {appt.cancellationReason && (
                    <p className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-xl">
                      <strong>Cancelled:</strong> {appt.cancellationReason}
                    </p>
                  )}
                </div>

                {/* Card Controls */}
                {!isCompleted && !isCancelled && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => {
                        setSelectedAppt(appt);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(appt._id)}
                      className="px-3 py-1.5 rounded-xl font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAppt(null);
        }}
        onSuccess={fetchAppointments}
        initialData={selectedAppt}
      />
    </div>
  );
};
