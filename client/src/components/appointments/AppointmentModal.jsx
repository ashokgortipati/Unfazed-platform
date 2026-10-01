import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { appointmentApi, clientApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

export const AppointmentModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const { user, isTherapist } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conflictError, setConflictError] = useState('');

  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:50',
    sessionType: 'Individual Therapy',
    notes: '',
    timezone: 'UTC',
  });

  useEffect(() => {
    if (isOpen && isTherapist) {
      clientApi.getAll({ status: 'active' }).then((res) => {
        setClients(res.data.clients || []);
        if (res.data.clients?.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: res.data.clients[0]._id }));
        }
      });
    }

    if (initialData) {
      setFormData({
        clientId: initialData.client?._id || initialData.client || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        startTime: initialData.startTime || '10:00',
        endTime: initialData.endTime || '10:50',
        sessionType: initialData.sessionType || 'Individual Therapy',
        notes: initialData.notes || '',
        timezone: initialData.timezone || 'UTC',
      });
    }
  }, [isOpen, initialData, isTherapist]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setConflictError('');
    setLoading(true);

    try {
      if (initialData?._id) {
        // Rescheduling
        await appointmentApi.reschedule(initialData._id, {
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          reason: formData.notes,
        });
      } else {
        // Creating new appointment
        await appointmentApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      // Conflict or validation error
      setConflictError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Reschedule Appointment' : 'Schedule Therapy Session'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {conflictError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Double Booking Prevention Alert</span>
              {conflictError}
            </div>
          </div>
        )}

        {isTherapist && !initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            >
              <option value="">-- Choose a Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Session Type</label>
          <select
            value={formData.sessionType}
            onChange={(e) => setFormData({ ...formData, sessionType: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
          >
            <option value="Individual Therapy">Individual Therapy (50m)</option>
            <option value="Consultation">Clinical Consultation (30m)</option>
            <option value="Follow-up">Brief Follow-up (20m)</option>
            <option value="Crisis Session">Urgent Crisis Session</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Session Notes / Agenda
          </label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Focus areas, homework check, or clinical preparations..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Validating Conflicts...' : initialData ? 'Confirm Reschedule' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
