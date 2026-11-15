import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileSpreadsheet,
  ShieldCheck,
  Edit3,
  History,
  BarChart2,
  Calendar,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Students', path: '/admin/students', icon: GraduationCap },
    { name: 'Teachers', path: '/admin/teachers', icon: Users },
    { name: 'Classes & Subjects', path: '/admin/classes-subjects', icon: BookOpen },
    { name: 'All Attendance', path: '/admin/reports', icon: FileSpreadsheet },
    { name: 'User Management', path: '/admin/users', icon: ShieldCheck },
  ];

  const teacherNav = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'Mark Attendance', path: '/teacher/mark', icon: CalendarCheck },
    { name: 'Edit Attendance', path: '/teacher/edit', icon: Edit3 },
    { name: 'Attendance History', path: '/teacher/history', icon: History },
    { name: 'Class Reports', path: '/teacher/reports', icon: BarChart2 },
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Subject-wise', path: '/student/subjects', icon: BookOpen },
    { name: 'Attendance Log', path: '/student/history', icon: Calendar },
  ];

  let currentNav = [];
  if (role === 'admin') currentNav = adminNav;
  else if (role === 'teacher') currentNav = teacherNav;
  else if (role === 'student') currentNav = studentNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 md:top-16 bottom-0 left-0 z-50 md:z-20 w-72 md:w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between shadow-2xl md:shadow-none`}
      >
        <div className="py-4 md:py-5 px-3 space-y-4 md:space-y-6 overflow-y-auto">
          {/* Mobile Header with Close Button */}
          <div className="flex md:hidden items-center justify-between px-2 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xl">🎓</span>
              <span className="font-bold text-slate-900 text-base">EduTrack AMS</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role header banner */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Navigation</p>
            <p className="text-xs font-semibold text-slate-700 capitalize mt-0.5">
              {role} Portal Navigation
            </p>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info box */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>MERN Stack + Socket.IO</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">College AMS Project v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
