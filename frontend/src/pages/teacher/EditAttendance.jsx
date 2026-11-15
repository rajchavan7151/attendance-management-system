import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { attendanceService } from '../../services/attendanceService';
import toast from 'react-hot-toast';

const EditAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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
        if (sRes.success && sRes.subjects.length > 0) {
          setSubjects(sRes.subjects);
          setSelectedSubject(sRes.subjects[0]._id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const fetchRecords = async () => {
    if (!selectedClass || !selectedSubject || !selectedDate) return;
    try {
      setLoading(true);
      const res = await attendanceService.getRecords({
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
      });
      if (res.success) {
        setRecords(res.records);
      }
    } catch (err) {
      toast.error('Failed to load session attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedClass, selectedSubject, selectedDate]);

  const handleUpdateStatus = async (recordId, newStatus) => {
    try {
      setUpdatingId(recordId);
      const res = await attendanceService.updateRecord(recordId, { status: newStatus });
      if (res.success) {
        toast.success(`Updated status to ${newStatus}`);
        setRecords((prev) =>
          prev.map((r) => (r._id === recordId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      toast.error('Failed to update record');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateRemarks = async (recordId, remarks) => {
    try {
      await attendanceService.updateRecord(recordId, { remarks });
      toast.success('Remarks updated');
      setRecords((prev) =>
        prev.map((r) => (r._id === recordId ? { ...r, remarks } : r))
      );
    } catch (err) {
      toast.error('Failed to update remarks');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Edit Attendance Records</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Modify and correct previously recorded student attendance sessions directly in MongoDB.
        </p>
      </div>

      {/* Selectors */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">Class</label>
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
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">Subject</label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
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
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500">Loading saved records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[620px]">
                <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Roll No</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Student</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-center">Current Status</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-center">Change Status</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                        {rec.student?.rollNumber}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{rec.student?.name}</p>
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-center">
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
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <div className="flex items-center justify-center space-x-1 sm:space-x-1.5">
                          <button
                            onClick={() => handleUpdateStatus(rec._id, 'Present')}
                            disabled={updatingId === rec._id}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Present'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec._id, 'Absent')}
                            disabled={updatingId === rec._id}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(rec._id, 'Late')}
                            disabled={updatingId === rec._id}
                            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                              rec.status === 'Late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            Late
                          </button>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <input
                          type="text"
                          defaultValue={rec.remarks || ''}
                          onBlur={(e) => handleUpdateRemarks(rec._id, e.target.value)}
                          placeholder="Add remark..."
                          className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  ))}
                  {records.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400 text-xs sm:text-sm">
                        No attendance has been recorded for this class, subject and date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditAttendance;
