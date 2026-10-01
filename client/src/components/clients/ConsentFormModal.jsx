import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { clientApi } from '../../api/endpoints';
import { ShieldCheck, FileCheck } from 'lucide-react';

export const ConsentFormModal = ({ isOpen, onClose, clientId, existingData, onSuccess }) => {
  const [agreed, setAgreed] = useState(existingData?.agreed || false);
  const [signatureName, setSignatureName] = useState(existingData?.signatureName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) {
      setError('You must review and agree to the informed consent statements.');
      return;
    }
    if (!signatureName.trim()) {
      setError('Please type your legal full name as your electronic signature.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await clientApi.submitConsent(clientId, {
        agreed: true,
        signatureName: signatureName.trim(),
        termsVersion: '1.0',
      });
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
      title="Informed Consent & Practice Agreement"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-2.5 max-h-60 overflow-y-auto leading-relaxed">
          <p className="font-semibold text-slate-800">
            1. Nature of Psychological & Mental Wellness Services
          </p>
          <p>
            Psychotherapy involves a collaborative therapeutic relationship aimed at exploring
            emotional challenges, cognitive thought patterns, and behavioral adaptations.
            Outcomes vary depending on personal engagement and goals.
          </p>
          <p className="font-semibold text-slate-800">2. Confidentiality & Legal Boundaries</p>
          <p>
            All clinical communications, session notes, and records are kept strictly confidential.
            Exceptions required by law include imminent risk of harm to self or others, mandated
            reporting of abuse/neglect, or explicit court subpoenas.
          </p>
          <p className="font-semibold text-slate-800">3. Appointments & Cancellation Courtesy</p>
          <p>
            Sessions are scheduled for 50 minutes. Please provide at least 24 hours of advance
            notice if you need to reschedule or cancel a session.
          </p>
          <p className="font-semibold text-slate-800">4. Emergency Contact Notice</p>
          <p>
            This platform and practice are not for emergency psychiatric crisis intervention. If you
            are experiencing a life-threatening crisis, call emergency services (911/988 in the US/Canada)
            or go to your nearest emergency department.
          </p>
        </div>

        {/* Existing Signed State */}
        {existingData?.agreed && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span>Form already executed by </span>
              <strong>{existingData.signatureName}</strong>
              <span> on {new Date(existingData.signedAt).toLocaleDateString()} at {new Date(existingData.signedAt).toLocaleTimeString()}</span>
            </div>
          </div>
        )}

        {/* Checkbox agreement */}
        <div className="flex items-start gap-3 p-3 bg-sage-50/50 rounded-xl border border-sage-100">
          <input
            type="checkbox"
            id="consentAgreement"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-sage-600 rounded focus:ring-sage-500"
            required
          />
          <label htmlFor="consentAgreement" className="text-xs text-slate-700 cursor-pointer">
            I confirm that I have read, understood, and voluntarily agree to the informed consent,
            confidentiality policies, and clinical agreements outlined above.
          </label>
        </div>

        {/* Typed Digital Signature */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Electronic Signature (Type Full Legal Name)
          </label>
          <input
            type="text"
            value={signatureName}
            onChange={(e) => setSignatureName(e.target.value)}
            placeholder="e.g. Sarah Elizabeth Jenkins"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-serif italic focus:ring-2 focus:ring-sage-500 focus:outline-none"
            required
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Timestamp and IP address will be legally logged in compliance with healthcare consent standards.
          </p>
        </div>

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
            {loading ? 'Submitting Signature...' : 'Submit Informed Consent'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
