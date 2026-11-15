import React, { useState, useEffect } from 'react';
import { teacherService } from '../../services/teacherService';
import { classService } from '../../services/classService';
import { subjectService } from '../../services/subjectService';
import Modal from '../../components/Modal';
import { Plus, Edit2, Trash2, Mail, Phone, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    employeeId: '',
    phone: '',
    assignedClasses: [],
    assignedSubjects: [],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, cRes, sRes] = await Promise.all([
        teacherService.getAll(),
        classService.getAll(),
        subjectService.getAll(),
      ]);

      if (tRes.success) setTeachers(tRes.teachers);
      if (cRes.success) setClasses(cRes.classes);
      if (sRes.success) setSubjects(sRes.subjects);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load faculty records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingTeacher(null);
    setFormData({
      name: '',
      email: '',
      password: 'Teacher123',
      department: 'Computer Science & Engineering',
      employeeId: '',
      phone: '',
      assignedClasses: [],
      assignedSubjects: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTeacher(t);
    setFormData({
      name: t.name,
      email: t.email,
      password: '',
      department: t.department,
      employeeId: t.employeeId || '',
      phone: t.phone || '',
      assignedClasses: t.assignedClasses?.map((c) => c._id) || [],
      assignedSubjects: t.assignedSubjects?.map((s) => s._id) || [],
    });
    setIsModalOpen(true);
  };

  const handleClassToggle = (classId) => {
    setFormData((prev) => {
      const exists = prev.assignedClasses.includes(classId);
      return {
        ...prev,
        assignedClasses: exists
          ? prev.assignedClasses.filter((id) => id !== classId)
          : [...prev.assignedClasses, classId],
      };
    });
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData((prev) => {
      const exists = prev.assignedSubjects.includes(subjectId);
      return {
        ...prev,
        assignedSubjects: exists
          ? prev.assignedSubjects.filter((id) => id !== subjectId)
          : [...prev.assignedSubjects, subjectId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await teacherService.update(editingTeacher._id, formData);
        toast.success(`Updated faculty "${formData.name}" successfully`);
      } else {
        await teacherService.create(formData);
        toast.success(`Faculty "${formData.name}" registered successfully`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (t) => {
    if (!window.confirm(`Delete teacher "${t.name}"? This removes their user account.`)) {
      return;
    }
    try {
      await teacherService.delete(t._id);
      toast.success('Faculty member deleted');
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Faculty Management</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage teachers, department allocations, and course assignments.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-600/30 transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Teacher</span>
        </button>
      </div>

      {/* Teachers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {teachers.map((teacher) => (
          <div
            key={teacher._id}
            className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col justify-between hover:shadow-md transition min-w-0"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base truncate">{teacher.name}</h3>
                  <p className="text-xs text-indigo-600 font-medium flex items-center space-x-1 mt-0.5 truncate">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{teacher.department}</span>
                  </p>
                </div>
                <div className="flex space-x-1 flex-shrink-0">
                  <button
                    onClick={() => handleOpenEdit(teacher)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                    title="Edit Teacher"
                    aria-label="Edit Teacher"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(teacher)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Teacher"
                    aria-label="Delete Teacher"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Meta details */}
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="truncate">{teacher.email}</span>
                </p>
                {teacher.phone && (
                  <p className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{teacher.phone}</span>
                  </p>
                )}
                <p className="text-slate-400 font-mono text-[11px]">
                  ID: {teacher.employeeId || 'Not assigned'}
                </p>
              </div>

              {/* Assigned Subjects Badges */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                  Assigned Subjects ({teacher.assignedSubjects?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.assignedSubjects?.map((sub) => (
                    <span
                      key={sub._id}
                      className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                    >
                      {sub.code}: {sub.name}
                    </span>
                  ))}
                  {(!teacher.assignedSubjects || teacher.assignedSubjects.length === 0) && (
                    <span className="text-xs text-slate-400">None assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Assigned Classes */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                Assigned Classes
              </p>
              <div className="flex flex-wrap gap-1">
                {teacher.assignedClasses?.map((cls) => (
                  <span
                    key={cls._id}
                    className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                  >
                    {cls.code}
                  </span>
                ))}
                {(!teacher.assignedClasses || teacher.assignedClasses.length === 0) && (
                  <span className="text-xs text-slate-400">No classes assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.name}` : 'Add Faculty Member'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Faculty Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Prof. John Smith"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="teacher@college.com"
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
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Computer Science & Engineering"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                placeholder="EMP-CS-105"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!editingTeacher && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Default Login Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Assigned Classes Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Assigned Classes
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-32 overflow-y-auto">
              {classes.map((cls) => (
                <label key={cls._id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignedClasses.includes(cls._id)}
                    onChange={() => handleClassToggle(cls._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="truncate">{cls.code} - {cls.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assigned Subjects Checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Assigned Subjects
            </label>
            <div className="grid grid-cols-1 gap-2 border border-slate-200 rounded-xl p-3 bg-slate-50 max-h-36 overflow-y-auto">
              {subjects.map((sub) => (
                <label key={sub._id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.assignedSubjects.includes(sub._id)}
                    onChange={() => handleSubjectToggle(sub._id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                  />
                  <span className="truncate">
                    <strong className="font-mono text-indigo-700">{sub.code}</strong>: {sub.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/30 transition text-center"
            >
              {editingTeacher ? 'Save Changes' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherManagement;
