import React, { useState, useEffect } from 'react';
import { therapistApi } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UserCheck, Award, BookOpen, Globe, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export const TherapistProfile = () => {
  const { user, checkSession } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    profilePhoto: '',
    licenseNumber: '',
    experienceYears: 0,
    education: '',
    bio: '',
    specializations: [],
    languages: [],
  });

  const [specInput, setSpecInput] = useState('');
  const [langInput, setLangInput] = useState('');

  useEffect(() => {
    therapistApi
      .getProfile()
      .then((res) => {
        const t = res.data.therapist;
        setFormData({
          name: t.name || '',
          email: t.email || '',
          profilePhoto: t.profilePhoto || '',
          licenseNumber: t.licenseNumber || '',
          experienceYears: t.experienceYears || 0,
          education: t.education || '',
          bio: t.bio || '',
          specializations: t.specializations || [],
          languages: t.languages || ['English'],
        });
      })
      .catch((err) => setErrorMessage(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAddSpec = () => {
    if (specInput.trim() && !formData.specializations.includes(specInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, specInput.trim()],
      }));
      setSpecInput('');
    }
  };

  const handleRemoveSpec = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== spec),
    }));
  };

  const handleAddLang = () => {
    if (langInput.trim() && !formData.languages.includes(langInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, langInput.trim()],
      }));
      setLangInput('');
    }
  };

  const handleRemoveLang = (lang) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== lang),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      await therapistApi.updateProfile(formData);
      setSuccessMessage('Therapist profile successfully updated!');
      await checkSession();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading clinician credentials..." size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-soft flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={
              formData.profilePhoto ||
              'https://images.unsplash.com/photo-1594824813639-51a700d1c79a?auto=format&fit=crop&q=80&w=300'
            }
            alt={formData.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-sage-200 shadow-sm"
          />
        </div>
        <div className="text-center sm:text-left flex-1">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{formData.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Verified Clinician
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{formData.education || 'Licensed Practitioner'}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-600">
            <span className="flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5 text-sage-600" /> License: {formData.licenseNumber}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-sage-600" /> {formData.experienceYears} Years Exp.
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Globe className="w-3.5 h-3.5 text-sage-600" /> {formData.languages.join(', ')}
            </span>
          </div>
        </div>
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

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-soft space-y-6">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Edit Professional Profile & Credentials
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Email</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Profile Photo URL
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="url"
                value={formData.profilePhoto}
                onChange={(e) => setFormData({ ...formData, profilePhoto: e.target.value })}
                placeholder="https://..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Clinical License Number
            </label>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              placeholder="PSY-12345"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Education & Degrees
            </label>
            <input
              type="text"
              value={formData.education}
              onChange={(e) => setFormData({ ...formData, education: e.target.value })}
              placeholder="e.g. Psy.D. in Clinical Psychology"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Years of Clinical Experience
            </label>
            <input
              type="number"
              min="0"
              max="60"
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Specializations Tag Editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Clinical Specializations & Modalities
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={specInput}
              onChange={(e) => setSpecInput(e.target.value)}
              placeholder="e.g. EMDR, Solution-Focused Therapy"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSpec}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.specializations.map((spec) => (
              <span
                key={spec}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sage-50 border border-sage-200 text-sage-800 text-xs"
              >
                <span>{spec}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(spec)}
                  className="text-sage-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Languages Tag Editor */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Languages Spoken
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              placeholder="e.g. Spanish, French, Mandarin"
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sage-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLang}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {formData.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs"
              >
                <span>{lang}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveLang(lang)}
                  className="text-teal-400 hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Professional Bio & Approach
          </label>
          <textarea
            rows="4"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
