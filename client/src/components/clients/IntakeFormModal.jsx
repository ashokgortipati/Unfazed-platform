import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { clientApi } from '../../api/endpoints';

const COMMON_SYMPTOMS = [
  'Generalized Anxiety',
  'Depressive Mood',
  'Sleep Disturbances / Insomnia',
  'Panic Attacks',
  'Workplace Burnout',
  'Relationship Conflicts',
  'Trauma / PTSD Symptoms',
  'Social Anxiety',
  'Low Self-Esteem',
];

export const IntakeFormModal = ({ isOpen, onClose, clientId, existingData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    emergencyContact: existingData?.emergencyContact || { name: '', phone: '', relationship: '' },
    medicalHistory: existingData?.medicalHistory || '',
    currentSymptoms: existingData?.currentSymptoms || [],
    therapyGoals: existingData?.therapyGoals || '',
    previousTherapy: existingData?.previousTherapy || false,
    preferredContactMethod: existingData?.preferredContactMethod || 'Email',
    additionalNotes: existingData?.additionalNotes || '',
  });

  const handleSymptomToggle = (symptom) => {
    setFormData((prev) => {
      const exists = prev.currentSymptoms.includes(symptom);
      return {
        ...prev,
        currentSymptoms: exists
          ? prev.currentSymptoms.filter((s) => s !== symptom)
          : [...prev.currentSymptoms, symptom],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await clientApi.submitIntake(clientId, formData);
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
      title="Clinical Intake Questionnaire"
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Emergency Contact */}
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 space-y-3">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Emergency Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.emergencyContact.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                  })
                }
                placeholder="Full Name"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Relationship</label>
              <input
                type="text"
                value={formData.emergencyContact.relationship}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value },
                  })
                }
                placeholder="Spouse, Parent, Friend"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.emergencyContact.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                  })
                }
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Symptoms Checklist */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Current Primary Symptoms & Focus Areas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {COMMON_SYMPTOMS.map((symptom) => {
              const checked = formData.currentSymptoms.includes(symptom);
              return (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => handleSymptomToggle(symptom)}
                  className={`px-3 py-2 rounded-xl border text-xs text-left font-medium transition ${
                    checked
                      ? 'bg-sage-100/70 border-sage-500 text-sage-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {checked ? '✓ ' : '+ '} {symptom}
                </button>
              );
            })}
          </div>
        </div>

        {/* Therapy Goals */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Personal Therapy Goals
          </label>
          <textarea
            rows="3"
            value={formData.therapyGoals}
            onChange={(e) => setFormData({ ...formData, therapyGoals: e.target.value })}
            placeholder="What positive changes or coping skills are you hoping to cultivate during therapy?"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        {/* Medical History */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Medical & Psychiatric History
          </label>
          <textarea
            rows="2"
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            placeholder="Relevant medical conditions, current medications, or previous mental health diagnoses..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        {/* Previous therapy & preferred contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <input
              type="checkbox"
              id="previousTherapy"
              checked={formData.previousTherapy}
              onChange={(e) => setFormData({ ...formData, previousTherapy: e.target.checked })}
              className="w-4 h-4 text-sage-600 rounded focus:ring-sage-500"
            />
            <label htmlFor="previousTherapy" className="text-xs font-medium text-slate-700 cursor-pointer">
              I have attended professional psychotherapy before
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferredContactMethod}
              onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
            >
              <option value="Email">Email Communication</option>
              <option value="Phone">Phone Calls</option>
              <option value="Portal">Client Portal Messages</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting Questionnaire...' : 'Save Intake Questionnaire'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
