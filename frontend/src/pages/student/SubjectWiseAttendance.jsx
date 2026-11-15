import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

const SubjectWiseAttendance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscribeToUpdates } = useSocket();

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await attendanceService.getStudentSummary();
      if (res.success) setData(res);
    } catch (err) {
      toast.error('Failed to load course attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    const unsubscribe = subscribeToUpdates(() => {
      fetchSummary();
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const { subjectWise = [] } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Subject-wise Attendance</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Course breakdown and minimum 75% attendance compliance tracking.
        </p>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        {subjectWise.map((sub) => {
          const isSafe = sub.percentage >= 75;
          return (
            <div
              key={sub.subject._id}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col justify-between hover:shadow-md transition min-w-0"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {sub.subject.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base sm:text-lg mt-2 truncate">{sub.subject.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{sub.subject.credits} Academic Credits</p>
                  </div>

                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap flex-shrink-0 ${
                      isSafe ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {isSafe ? 'Eligible (&ge;75%)' : 'Short (<75%)'}
                  </span>
                </div>

                {/* Percentage Big Indicator */}
                <div className="mt-5 sm:mt-6 flex items-baseline justify-between gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{sub.percentage}%</span>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">
                    {sub.effectivePresent} / {sub.total} Lectures Attended
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-2 w-full bg-slate-100 h-2.5 sm:h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Footer breakdown */}
              <div className="mt-5 sm:mt-6 pt-3 sm:pt-4 border-t border-slate-100 grid grid-cols-3 text-center text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Conducted</p>
                  <p className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5">{sub.total}</p>
                </div>
                <div>
                  <p className="text-emerald-600 font-semibold uppercase text-[10px]">Present</p>
                  <p className="font-bold text-emerald-700 text-xs sm:text-sm mt-0.5">{sub.present}</p>
                </div>
                <div>
                  <p className="text-rose-600 font-semibold uppercase text-[10px]">Absent</p>
                  <p className="font-bold text-rose-700 text-xs sm:text-sm mt-0.5">{sub.absent}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubjectWiseAttendance;
