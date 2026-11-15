import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherReports = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [cRes, sRes] = await Promise.all([
          classService.getAll(),
          subjectService.getAll(),
        ]);
        if (cRes.success && cRes.classes.length > 0) {
          setClasses(cRes.classes);
          setSelectedClass(cRes.classes[0]._id);
        }
        if (sRes.success) setSubjects(sRes.subjects);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const fetchReport = async () => {
    if (!selectedClass) return;
    try {
      setLoading(true);
      const res = await attendanceService.getClassReport(selectedClass, selectedSubject);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      toast.error('Failed to load class report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedClass, selectedSubject]);

  const defaulters = reportData?.report?.filter((item) => item.stats.isDefaulter) || [];
  const safeStudents = reportData?.report?.filter((item) => !item.stats.isDefaulter) || [];

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Class Attendance Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Student attendance analytics, 75% threshold compliance, and defaulter identification.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm transition w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print Class Summary</span>
        </button>
      </div>

      {/* Selectors */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">
            Select Class *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">
            Filter by Subject (Optional)
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects Aggregate</option>
            {subjects
              .filter((s) => !selectedClass || s.class?._id === selectedClass || s.class === selectedClass)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code}: {s.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <p className="text-[11px] sm:text-xs font-bold uppercase text-slate-500">Class Average</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {reportData.overallStats?.percentage || 0}%
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {reportData.overallStats?.total || 0} total attendance marks
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-emerald-100 shadow-sm">
            <p className="text-[11px] sm:text-xs font-bold uppercase text-emerald-700 flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Safe Students (&ge;75%)</span>
            </p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-1">{safeStudents.length}</p>
            <p className="text-[11px] text-emerald-600 mt-0.5">Met attendance criteria</p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-100 shadow-sm">
            <p className="text-[11px] sm:text-xs font-bold uppercase text-rose-700 flex items-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Defaulters (&lt;75%)</span>
            </p>
            <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-1">{defaulters.length}</p>
            <p className="text-[11px] text-rose-600 mt-0.5">Short attendance warning</p>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[580px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Roll No</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Student Name</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-center">Attended / Total</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Attendance %</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData?.report?.map((item) => (
                  <tr key={item.student._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                      {item.student.rollNumber}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 font-bold text-slate-900 text-xs sm:text-sm">
                      {item.student.name}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-center text-xs font-mono font-semibold text-slate-700">
                      {item.stats.effectivePresent} / {item.stats.total}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <div className="w-28 sm:w-36">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span>{item.stats.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.stats.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.min(item.stats.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold whitespace-nowrap ${
                          item.stats.percentage >= 75
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {item.stats.percentage >= 75 ? 'Good Standing' : 'Defaulter Warning'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReports;
