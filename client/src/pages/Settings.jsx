import React, { useState, useEffect } from 'react';
import { therapistApi } from '../api/endpoints';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Settings as SettingsIcon, Clock, Calendar, Check, Globe } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
];

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [availability, setAvailability] = useState({
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    startHour: '09:00',
    endHour: '17:00',
    sessionDuration: 50,
    bufferTime: 10,
    timezone: 'UTC',
  });

  useEffect(() => {
    therapistApi
      .getProfile()
      .then((res) => {
        if (res.data.therapist?.availability) {
          setAvailability(res.data.therapist.availability);
        }
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDay = (day) => {
    setAvailability((prev) => {
      const exists = prev.workingDays.includes(day);
      return {
        ...prev,
        workingDays: exists
          ? prev.workingDays.filter((d) => d !== day)
          : [...prev.workingDays, day],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await therapistApi.updateAvailability(availability);
      setSuccessMessage('Practice scheduling rules updated successfully!');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading practice settings..." size="lg" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Practice Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure clinical working hours, session durations, buffer periods, and time zones
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sage-600" />
          Scheduling & Availability Rules
        </h2>

        {/* Working Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Active Practice Working Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const active = availability.workingDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleToggleDay(day)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                    active
                      ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Practice Start Time
            </label>
            <input
              type="time"
              value={availability.startHour}
              onChange={(e) => setAvailability({ ...availability, startHour: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Practice End Time
            </label>
            <input
              type="time"
              value={availability.endHour}
              onChange={(e) => setAvailability({ ...availability, endHour: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Session Duration & Buffer Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Duration (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="180"
              step="5"
              value={availability.sessionDuration}
              onChange={(e) =>
                setAvailability({ ...availability, sessionDuration: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">Default clinical standard: 50 minutes</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Buffer Time Between Sessions (Minutes)
            </label>
            <input
              type="number"
              min="0"
              max="60"
              step="5"
              value={availability.bufferTime}
              onChange={(e) =>
                setAvailability({ ...availability, bufferTime: Number(e.target.value) })
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Prevents back-to-back overlaps; default: 10 minutes
            </p>
          </div>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Practice Time Zone
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <select
              value={availability.timezone}
              onChange={(e) => setAvailability({ ...availability, timezone: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none bg-white text-slate-700"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Saving Settings...' : 'Save Practice Rules'}
          </button>
        </div>
      </form>
    </div>
  );
};
