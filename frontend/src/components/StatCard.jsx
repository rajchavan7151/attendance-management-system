import React from 'react';

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50/50',
    border: 'border-indigo-100',
    iconBg: 'bg-indigo-600 text-white',
    text: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-100',
    iconBg: 'bg-emerald-600 text-white',
    text: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-100',
    iconBg: 'bg-amber-500 text-white',
    text: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50/50',
    border: 'border-rose-100',
    iconBg: 'bg-rose-500 text-white',
    text: 'text-rose-600',
  },
  sky: {
    bg: 'bg-sky-50/50',
    border: 'border-sky-100',
    iconBg: 'bg-sky-600 text-white',
    text: 'text-sky-600',
  },
};

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', badge }) => {
  const scheme = colorMap[color] || colorMap.indigo;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 border ${scheme.border} shadow-sm transition-all hover:shadow-md min-w-0`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="mt-1.5 flex items-baseline flex-wrap gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {value}
            </span>
            {badge && (
              <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-semibold truncate ${badge.color}`}>
                {badge.text}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-[11px] sm:text-xs text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${scheme.iconBg}`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
