import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'md' }) => {
  const variants = {
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    inactive: 'bg-slate-100 text-slate-600 border border-slate-200',
    scheduled: 'bg-teal-50 text-teal-700 border border-teal-200',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    cancelled: 'bg-rose-50 text-rose-700 border border-rose-200',
    rescheduled: 'bg-amber-50 text-amber-700 border border-amber-200',
    shared: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    private: 'bg-purple-50 text-purple-700 border border-purple-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    neutral: 'bg-slate-50 text-slate-600 border border-slate-200',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-full font-medium tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${variants[variant] || variants.neutral} ${
        sizes[size] || sizes.md
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
};
