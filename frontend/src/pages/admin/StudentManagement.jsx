import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import Modal from '../../components/Modal';
import { Search, Plus, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    class: '',
    phone: '',
    guardianName: '',
    guardianPhone: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedClass) params.class = selectedClass;
      if (search) params.search = search;

      const [studentsRes, classesRes] = await Promise.all([
        studentService.getAll(params),
        classService.getAll(),
      ]);

      if (studentsRes.success) setStudents(studentsRes.students);
      if (classesRes.success) setClasses(classesRes.classes);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedClass]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: 'Student123',
      rollNumber: '',
      class: classes[0]?._id || '',
      phone: '',
      guardianName: '',
      guardianPhone: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      password: '',
      rollNumber: student.rollNumber,
      class: student.class?._id || student.class || '',
      phone: student.phone || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentService.update(editingStudent._id, formData);
        toast.success(`Updated ${formData.name} successfully`);
      } else {
        await studentService.create(formData);
        toast.success(`Student ${formData.name} added successfully`);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      toast.error(msg);
    }
  };

  const handleDelete = async (student) => {
    if (!window.confirm(`Are you sure you want to delete student "${student.name}" (${student.rollNumber})? This will also remove their attendance records.`)) {
      return;
    }

    try {
      await studentService.delete(student._id);
      toast.success(`Student deleted successfully`);
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage enrolled students, roll numbers, class allocations, and contact records.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-sm shadow-indigo-600/30 transition w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 sm:top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, roll number, or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </form>

        <div className="w-full sm:w-64">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Classes & Sections</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[680px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Roll No</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Student Details</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Class / Section</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Contact</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Guardian</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 sm:px-5 py-3 sm:py-4 font-mono font-bold text-xs text-indigo-700 bg-indigo-50/30">
                      {student.rollNumber}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{student.name}</p>
                      <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{student.email}</span>
                      </p>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[140px]">
                        {student.class?.name || 'Unassigned'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{student.class?.code}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs text-slate-600">
                      {student.phone ? (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs text-slate-600">
                      <p className="font-medium text-slate-800">{student.guardianName || '-'}</p>
                      {student.guardianPhone && (
                        <p className="text-[10px] text-slate-400">{student.guardianPhone}</p>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-right space-x-1 sm:space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        title="Edit Student"
                        aria-label="Edit Student"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Student"
                        aria-label="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-xs sm:text-sm">
                      No students found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : 'Add New Student'}
      >
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. John Doe"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Roll Number *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                placeholder="e.g. CS2024-050"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@college.com"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Assign Class *</label>
              <select
                required
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!editingStudent && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">
                Default Password (for student login)
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 555-000-0000"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Guardian Name</label>
              <input
                type="text"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                placeholder="Parent / Guardian"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Guardian Phone</label>
              <input
                type="text"
                value={formData.guardianPhone}
                onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                placeholder="+1 555-111-2222"
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentManagement;
