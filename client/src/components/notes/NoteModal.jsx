import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { notesApi, clientApi } from '../../api/endpoints';
import { Lock, Eye, AlertCircle, Sparkles } from 'lucide-react';

export const NoteModal = ({ isOpen, onClose, onSuccess, initialData = null, defaultClientId = null }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [goalInput, setGoalInput] = useState('');

  const [formData, setFormData] = useState({
    clientId: defaultClientId || '',
    title: '',
    type: 'Progress',
    visibility: 'private',
    sessionSummary: '',
    content: '',
    treatmentGoals: [],
  });

  useEffect(() => {
    if (isOpen) {
      clientApi.getAll({ status: 'active' }).then((res) => {
        setClients(res.data.clients || []);
        if (defaultClientId) {
          setFormData((prev) => ({ ...prev, clientId: defaultClientId }));
        } else if (res.data.clients?.length > 0 && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: res.data.clients[0]._id }));
        }
      });
    }

    if (initialData) {
      setFormData({
        clientId: initialData.client?._id || initialData.client || '',
        title: initialData.title || '',
        type: initialData.type || 'Progress',
        visibility: initialData.visibility || 'private',
        sessionSummary: initialData.sessionSummary || '',
        content: initialData.content || '',
        treatmentGoals: initialData.treatmentGoals || [],
      });
    }
  }, [isOpen, initialData, defaultClientId]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (goalInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        treatmentGoals: [...prev.treatmentGoals, goalInput.trim()],
      }));
      setGoalInput('');
    }
  };

  const handleRemoveGoal = (index) => {
    setFormData((prev) => ({
      ...prev,
      treatmentGoals: prev.treatmentGoals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (initialData?._id) {
        await notesApi.update(initialData._id, formData);
      } else {
        await notesApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Therapy Session Note' : 'Create Therapy Session Note'}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Client & Note Type Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Client</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
              disabled={!!defaultClientId || !!initialData}
            >
              <option value="">-- Select Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Note Category</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
            >
              <option value="Progress">Progress Note</option>
              <option value="Summary">Session Summary</option>
              <option value="Treatment Goals">Treatment Goals</option>
              <option value="Intake">Intake Assessment</option>
              <option value="Crisis">Crisis Intervention</option>
              <option value="General">General Clinical Note</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Note Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Cognitive Reframing Progress & Sleep Journaling"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
            required
          />
        </div>

        {/* Visibility Setting (Private vs Shared) */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Portal Access Control
              </span>
              <p className="text-[11px] text-slate-500">
                Control whether the client can view this record in their portal
              </p>
            </div>
            <div className="flex bg-white p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'private' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  formData.visibility === 'private'
                    ? 'bg-purple-100 text-purple-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Private (Therapist Only)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, visibility: 'shared' })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  formData.visibility === 'shared'
                    ? 'bg-indigo-100 text-indigo-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Shared with Client
              </button>
            </div>
          </div>
          {formData.visibility === 'private' ? (
            <p className="text-[11px] text-purple-700 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Secure: Private therapist notes are NEVER visible to clients or queried in portal endpoints.
            </p>
          ) : (
            <p className="text-[11px] text-indigo-700 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Shared: This note will be visible to the client in their personal Client Portal.
            </p>
          )}
        </div>

        {/* Treatment Goals Tagging */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Treatment Goals & Action Items
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. Practice 4-7-8 breathing when anxiety rises"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddGoal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
            >
              + Add Goal
            </button>
          </div>
          {formData.treatmentGoals.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {formData.treatmentGoals.map((goal, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sage-50 border border-sage-200 text-sage-800 text-xs"
                >
                  <span>{goal}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveGoal(idx)}
                    className="text-sage-400 hover:text-rose-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Session Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Session Summary
          </label>
          <textarea
            rows="2"
            value={formData.sessionSummary}
            onChange={(e) => setFormData({ ...formData, sessionSummary: e.target.value })}
            placeholder="Brief overview of themes explored and client affect..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        {/* Clinical Note Content */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Clinical Content & Progress Analysis
          </label>
          <textarea
            rows="5"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Enter clinical observations, intervention techniques applied, client responses, and diagnostic impressions..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none font-sans"
            required
          />
        </div>

        {/* Form Actions */}
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
            {loading ? 'Saving Note...' : initialData ? 'Update Note' : 'Save Session Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
