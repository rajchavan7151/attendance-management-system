import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { useSocket } from '../../context/SocketContext';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentAttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { subscribeToUpdates } = useSocket();

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await attendanceService.getRecords(params);
      if (res.success) {
        setRecords(res.records);
        setStats(res.stats);
      }
    } catch (err) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
    const unsubscribe = subscribeToUpdates(() => {
      fetchRecords();
    });
    return () => unsubscribe();
  }, [statusFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Your Attendance History</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Complete chronological record of all recorded lectures and attendance timestamps.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print My History</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center space-x-2 sm:space-x-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-700 uppercase whitespace-nowrap">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Records ({records.length})</option>
            <option value="Present">Present Only</option>
            <option value="Absent">Absent Only</option>
            <option value="Late">Late Only</option>
          </select>
        </div>

        {stats && (
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs font-semibold">
            <span className="text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
              Total: {stats.total}
            </span>
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Attended: {stats.effectivePresent}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Absent: {stats.absent}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              Rate: {stats.percentage}%
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Date</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Course / Subject</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Class / Section</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Faculty</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Status</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 font-bold text-slate-900 text-xs sm:text-sm">
                      {rec.subject?.code} - {rec.subject?.name}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-600">{rec.class?.code}</td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-600">{rec.teacher?.name || 'Faculty'}</td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
                          rec.status === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'Late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-400">{rec.remarks || '-'}</td>
                  </tr>
                ))}
                {records.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-xs sm:text-sm">
                      No attendance records found matching filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceHistory;
