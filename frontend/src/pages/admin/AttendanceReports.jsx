import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const AttendanceReports = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const fetchFilters = async () => {
    try {
      const [cRes, sRes] = await Promise.all([
        classService.getAll(),
        subjectService.getAll(),
      ]);
      if (cRes.success) setClasses(cRes.classes);
      if (sRes.success) setSubjects(sRes.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.classId = selectedClass;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus) params.status = selectedStatus;

      const res = await attendanceService.getRecords(params);
      if (res.success) {
        setRecords(res.records);
        setStats(res.stats);
      }
    } catch (err) {
      toast.error('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [selectedClass, selectedSubject, selectedDate, selectedStatus]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Attendance Audit & Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Comprehensive college-wide attendance registry, compliance filters, and print reports.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-sm transition w-full sm:w-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export Report</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase mb-1">
            Class / Section
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase mb-1">
            Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Subjects</option>
            {subjects
              .filter((s) => !selectedClass || s.class?._id === selectedClass || s.class === selectedClass)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code}: {s.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase mb-1">
            Specific Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase mb-1">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Late">Late</option>
          </select>
        </div>
      </div>

      {/* Aggregate Stats Ribbon */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase text-indigo-700">Total Entries</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-950 mt-0.5 sm:mt-1">{stats.total}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase text-emerald-700">Present Count</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5 sm:mt-1">{stats.present}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-rose-50/60 border border-rose-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase text-rose-700">Absent Count</p>
            <p className="text-xl sm:text-2xl font-black text-rose-950 mt-0.5 sm:mt-1">{stats.absent}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-xl bg-purple-50/60 border border-purple-100">
            <p className="text-[10px] sm:text-xs font-bold uppercase text-purple-700">Average Rate</p>
            <p className="text-xl sm:text-2xl font-black text-purple-950 mt-0.5 sm:mt-1">{stats.percentage}%</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Date</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Student</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Roll No</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Subject</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Class</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Marked By</th>
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
                      {rec.student?.name}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 font-mono text-xs text-indigo-700 font-semibold">
                      {rec.student?.rollNumber}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-700 font-medium">
                      {rec.subject?.code} - {rec.subject?.name}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-600">{rec.class?.code}</td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-500">{rec.teacher?.name || 'Faculty'}</td>
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
                    <td colSpan={8} className="text-center py-12 text-slate-400 text-xs sm:text-sm">
                      No attendance records match your filter criteria.
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

export default AttendanceReports;
