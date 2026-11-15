import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { studentService } from '../../services/studentService';
import { attendanceService } from '../../services/attendanceService';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Search,
  Users,
  CheckCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MarkAttendance = () => {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch Teacher's assigned classes and subjects
  useEffect(() => {
    const initData = async () => {
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
        toast.error('Failed to initialize marking data');
      }
    };
    initData();
  }, []);

  // When class changes, fetch its students and check existing attendance for this date
  useEffect(() => {
    if (!selectedClass) return;

    const loadStudentsAndExistingAttendance = async () => {
      try {
        setLoading(true);
        const sRes = await studentService.getAll({ class: selectedClass });
        const studentList = sRes.students || [];
        setStudents(studentList);

        const initialMap = {};
        if (selectedSubject && selectedDate) {
          const recRes = await attendanceService.getRecords({
            classId: selectedClass,
            subjectId: selectedSubject,
            date: selectedDate,
          });

          if (recRes.success && recRes.records.length > 0) {
            recRes.records.forEach((r) => {
              const sId = r.student?._id || r.student;
              initialMap[sId] = {
                status: r.status,
                remarks: r.remarks || '',
              };
            });
          }
        }

        studentList.forEach((s) => {
          if (!initialMap[s._id]) {
            initialMap[s._id] = { status: 'Present', remarks: '' };
          }
        });

        setAttendanceState(initialMap);
      } catch (err) {
        console.error(err);
        toast.error('Error fetching students list');
      } finally {
        setLoading(false);
      }
    };

    loadStudentsAndExistingAttendance();
  }, [selectedClass, selectedSubject, selectedDate]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId, remarks) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleMarkAll = (status) => {
    setAttendanceState((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s._id] = {
          ...next[s._id],
          status,
        };
      });
      return next;
    });
    toast.success(`Marked all students as ${status}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject || !selectedDate) {
      toast.error('Please select class, subject and date');
      return;
    }

    if (students.length === 0) {
      toast.error('No students in this class to mark');
      return;
    }

    try {
      setSaving(true);
      const attendanceList = students.map((s) => ({
        studentId: s._id,
        status: attendanceState[s._id]?.status || 'Present',
        remarks: attendanceState[s._id]?.remarks || '',
      }));

      const res = await attendanceService.markAttendance({
        classId: selectedClass,
        subjectId: selectedSubject,
        date: selectedDate,
        attendanceList,
      });

      if (res.success) {
        toast.success(`🎉 Saved ${res.count} attendance records to MongoDB!`, {
          duration: 4000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const presentCount = Object.values(attendanceState).filter((item) => item.status === 'Present').length;
  const absentCount = Object.values(attendanceState).filter((item) => item.status === 'Absent').length;
  const lateCount = Object.values(attendanceState).filter((item) => item.status === 'Late').length;

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mark Attendance</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Select course session details, toggle student presence, and persist records directly into MongoDB.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving || students.length === 0}
          className="inline-flex items-center justify-center space-x-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 w-full sm:w-auto"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving to MongoDB...</span>
            </div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Attendance to MongoDB</span>
            </>
          )}
        </button>
      </div>

      {/* Control Selectors Bar */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-5 border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">
            1. Select Class & Section *
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            2. Select Subject *
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
          <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 uppercase mb-1">
            3. Lecture Date *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Roster Controls & Stats Banner */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Quick Batch Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => handleMarkAll('Present')}
            className="flex-1 md:flex-none inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Present</span>
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('Absent')}
            className="flex-1 md:flex-none inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition"
          >
            <XCircle className="w-4 h-4" />
            <span>Mark All Absent</span>
          </button>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
          <span className="flex items-center space-x-1 text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Total: <strong>{students.length}</strong></span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Present: {presentCount}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
            Absent: {absentCount}
          </span>
          {lateCount > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
              Late: {lateCount}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="w-full md:w-64 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter students in roster..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Student Roster Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500">Loading student roster...</p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[620px]">
                <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Roll No</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Student Name</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-center">Attendance Status</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Remarks (Optional)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const currentStatus = attendanceState[student._id]?.status || 'Present';
                    const currentRemarks = attendanceState[student._id]?.remarks || '';

                    return (
                      <tr
                        key={student._id}
                        className={`transition ${
                          currentStatus === 'Absent' ? 'bg-rose-50/30' : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="px-4 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs text-indigo-700 whitespace-nowrap">
                          {student.rollNumber}
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">{student.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-none">{student.email}</p>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <div className="flex items-center justify-center space-x-1.5 sm:space-x-2">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'Present')}
                              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30 ring-2 ring-emerald-600 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'Absent')}
                              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/30 ring-2 ring-rose-600 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student._id, 'Late')}
                              className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 ring-2 ring-amber-500 ring-offset-1'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>
                          </div>
                        </td>
                        <td className="px-4 sm:px-5 py-3 sm:py-4">
                          <input
                            type="text"
                            value={currentRemarks}
                            onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                            placeholder="Add remark..."
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 text-xs">
                        No students found in this class.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Save Action */}
      {students.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:justify-end p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/30 transition text-center"
          >
            <Save className="w-4 h-4" />
            <span>Confirm & Save Attendance to MongoDB</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
