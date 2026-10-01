import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'sage', subtitle, badge }) => {
  const colorMap = {
    sage: 'bg-sage-50 text-sage-600 border-sage-200/60',
    teal: 'bg-teal-50 text-teal-600 border-teal-200/60',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200/60',
    amber: 'bg-amber-50 text-amber-600 border-amber-200/60',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft hover:shadow-card transition duration-200">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorMap[color] || colorMap.sage}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700">
            {badge}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
