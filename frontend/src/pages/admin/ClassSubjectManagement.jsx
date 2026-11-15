import React, { useState, useEffect } from 'react';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import { teacherService } from '../../services/teacherService';
import Modal from '../../components/Modal';
import { Plus, BookOpen, Layers, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const ClassSubjectManagement = () => {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' or 'subjects'
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({
    name: '',
    code: '',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    academicYear: '2026-2027',
    description: '',
  });

  // Subject Modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    class: '',
    teacher: '',
    credits: 3,
    description: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, sRes, tRes] = await Promise.all([
        classService.getAll(),
        subjectService.getAll(),
        teacherService.getAll(),
      ]);
      if (cRes.success) setClasses(cRes.classes);
      if (sRes.success) setSubjects(sRes.subjects);
      if (tRes.success) setTeachers(tRes.teachers);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load classes and subjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Class Actions
  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      await classService.create(classForm);
      toast.success(`Class ${classForm.code} created`);
      setIsClassModalOpen(false);
      setClassForm({
        name: '',
        code: '',
        department: 'Computer Science & Engineering',
        semester: 'Semester 5',
        academicYear: '2026-2027',
        description: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    }
  };

  const handleDeleteClass = async (cls) => {
    if (!window.confirm(`Delete class "${cls.name}" (${cls.code})?`)) return;
    try {
      await classService.delete(cls._id);
      toast.success('Class deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Subject Actions
  const handleCreateSubject = async (e) => {
    e.preventDefault();
    try {
      await subjectService.create(subjectForm);
      toast.success(`Subject ${subjectForm.code} added`);
      setIsSubjectModalOpen(false);
      setSubjectForm({
        name: '',
        code: '',
        class: classes[0]?._id || '',
        teacher: '',
        credits: 3,
        description: '',
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (sub) => {
    if (!window.confirm(`Delete subject "${sub.name}" (${sub.code})?`)) return;
    try {
      await subjectService.delete(sub._id);
      toast.success('Subject deleted');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Academic Curriculum</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure college classes, sections, academic semesters, and subject catalogs.
          </p>
        </div>

        {activeTab === 'classes' ? (
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setSubjectForm({
                name: '',
                code: '',
                class: classes[0]?._id || '',
                teacher: teachers[0]?._id || '',
                credits: 3,
                description: '',
              });
              setIsSubjectModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm transition w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 sm:space-x-6 text-xs sm:text-sm font-semibold overflow-x-auto pb-0.5">
        <button
          onClick={() => setActiveTab('classes')}
          className={`pb-2.5 sm:pb-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'classes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Classes & Sections ({classes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-2.5 sm:pb-3 flex items-center space-x-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Subjects & Courses ({subjects.length})</span>
        </button>
      </div>

      {/* Classes Tab Content */}
      {activeTab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition min-w-0"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {cls.code}
                  </span>
                  <button
                    onClick={() => handleDeleteClass(cls)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Class"
                    aria-label="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-2 truncate">{cls.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{cls.department}</p>
                <div className="mt-2 flex items-center space-x-2 text-xs text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{cls.semester}</span>
                  <span className="text-slate-400">•</span>
                  <span>{cls.academicYear}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{cls.studentCount || 0} Students</span>
                </span>
                <span className="flex items-center space-x-1">
                  <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{cls.subjectCount || 0} Subjects</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subjects Tab Content */}
      {activeTab === 'subjects' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="w-full text-left text-sm min-w-[640px]">
                <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Course Code</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Subject Name</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Class</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Assigned Teacher</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5">Credits</th>
                    <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs text-indigo-700">
                        {sub.code}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4">
                        <p className="font-bold text-slate-900 text-xs sm:text-sm">{sub.name}</p>
                        {sub.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1">{sub.description}</p>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-semibold text-slate-700">
                        {sub.class?.name || sub.class?.code || 'N/A'}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs">
                        {sub.teacher ? (
                          <span className="font-medium text-slate-800">{sub.teacher.name}</span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-bold text-slate-700">
                        {sub.credits} Credits
                      </td>
                      <td className="px-4 sm:px-5 py-3 sm:py-4 text-right">
                        <button
                          onClick={() => handleDeleteSubject(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Subject"
                          aria-label="Delete Subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title="Create New Academic Class"
      >
        <form onSubmit={handleCreateClass} className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Class Name *</label>
            <input
              type="text"
              required
              value={classForm.name}
              onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
              placeholder="e.g. B.Tech Computer Science - Year 3 (Section A)"
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Class Code *</label>
              <input
                type="text"
                required
                value={classForm.code}
                onChange={(e) => setClassForm({ ...classForm, code: e.target.value })}
                placeholder="e.g. CS-3A"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Semester *</label>
              <input
                type="text"
                required
                value={classForm.semester}
                onChange={(e) => setClassForm({ ...classForm, semester: e.target.value })}
                placeholder="e.g. Semester 5"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Department *</label>
              <input
                type="text"
                required
                value={classForm.department}
                onChange={(e) => setClassForm({ ...classForm, department: e.target.value })}
                placeholder="Computer Science"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Academic Year</label>
              <input
                type="text"
                value={classForm.academicYear}
                onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
                placeholder="2026-2027"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsClassModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition text-center"
            >
              Save Class
            </button>
          </div>
        </form>
      </Modal>

      {/* Subject Modal */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title="Add New Subject / Course"
      >
        <form onSubmit={handleCreateSubject} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Subject Name *</label>
              <input
                type="text"
                required
                value={subjectForm.name}
                onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                placeholder="e.g. Artificial Intelligence"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Subject Code *</label>
              <input
                type="text"
                required
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                placeholder="e.g. CS305"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Class *</label>
              <select
                required
                value={subjectForm.class}
                onChange={(e) => setSubjectForm({ ...subjectForm, class: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Assign Teacher</label>
              <select
                value={subjectForm.teacher}
                onChange={(e) => setSubjectForm({ ...subjectForm, teacher: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Assign Later</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} ({t.department})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Credits</label>
            <input
              type="number"
              min="1"
              max="6"
              value={subjectForm.credits}
              onChange={(e) => setSubjectForm({ ...subjectForm, credits: Number(e.target.value) })}
              className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubjectModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition text-center"
            >
              Save Subject
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassSubjectManagement;
