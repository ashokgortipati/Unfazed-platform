import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Lock, Mail, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [activeTab, setActiveTab] = useState('therapist'); // 'therapist' | 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginTherapist, loginClient } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (activeTab === 'therapist' ? '/dashboard' : '/portal');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      let res;
      if (activeTab === 'therapist') {
        res = await loginTherapist(email, password);
        if (res.success) {
          navigate('/dashboard');
        } else {
          setErrorMessage(res.error || 'Therapist login failed');
        }
      } else {
        res = await loginClient(email, password);
        if (res.success) {
          navigate('/portal');
        } else {
          setErrorMessage(res.error || 'Client portal login failed');
        }
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill demo credentials
  const fillDemoTherapist = () => {
    setActiveTab('therapist');
    setEmail('dr.elena@unfazed.health');
    setPassword('Password123!');
  };

  const fillDemoClient = () => {
    setActiveTab('client');
    setEmail('sarah.j@example.com');
    setPassword('Client123!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sage-50/30 to-teal-50/20 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-sage-600 to-teal-500 flex items-center justify-center text-white shadow-soft">
          <HeartPulse className="w-7 h-7" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
          Unfazed
        </h2>
        <p className="mt-1 text-xs uppercase tracking-widest font-semibold text-sage-700">
          Mental Wellness & Therapist Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-card rounded-3xl border border-slate-100">
          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('therapist');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'therapist'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Therapist Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('client');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
                activeTab === 'client'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Client Access
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeTab === 'therapist' ? 'Clinical Email' : 'Client Email'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sage-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-sage-600 hover:bg-sage-700 shadow-sm transition disabled:opacity-50 mt-2"
            >
              {loading
                ? 'Authenticating...'
                : activeTab === 'therapist'
                ? 'Sign In to Clinical Workspace'
                : 'Enter Client Portal'}
            </button>
          </form>

          {/* Quick 1-Click Demo Login helpers */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <span className="block text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
              Quick 1-Click Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoTherapist}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition group"
              >
                <span className="text-[11px] font-bold text-slate-800 block group-hover:text-sage-700">
                  Demo Therapist
                </span>
                <span className="text-[10px] text-slate-500 block truncate">Dr. Elena Vance</span>
              </button>
              <button
                type="button"
                onClick={fillDemoClient}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition group"
              >
                <span className="text-[11px] font-bold text-slate-800 block group-hover:text-sage-700">
                  Demo Client
                </span>
                <span className="text-[10px] text-slate-500 block truncate">Sarah Jenkins</span>
              </button>
            </div>
          </div>

          {activeTab === 'therapist' && (
            <p className="mt-6 text-center text-xs text-slate-500">
              New clinician?{' '}
              <Link to="/register" className="font-semibold text-sage-600 hover:text-sage-700">
                Register therapist practice
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
