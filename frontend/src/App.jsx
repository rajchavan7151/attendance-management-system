import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import TeacherManagement from './pages/admin/TeacherManagement';
import ClassSubjectManagement from './pages/admin/ClassSubjectManagement';
import AttendanceReports from './pages/admin/AttendanceReports';
import UserManagement from './pages/admin/UserManagement';

// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import MarkAttendance from './pages/teacher/MarkAttendance';
import EditAttendance from './pages/teacher/EditAttendance';
import AttendanceHistory from './pages/teacher/AttendanceHistory';
import TeacherReports from './pages/teacher/TeacherReports';

// Student
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectWiseAttendance from './pages/student/SubjectWiseAttendance';
import StudentAttendanceHistory from './pages/student/StudentAttendanceHistory';

// Root redirect based on auth status
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#1e293b',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 500,
              },
            }}
          />

          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<RootRedirect />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagement />} />
              <Route path="teachers" element={<TeacherManagement />} />
              <Route path="classes-subjects" element={<ClassSubjectManagement />} />
              <Route path="reports" element={<AttendanceReports />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher', 'admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<TeacherDashboard />} />
              <Route path="mark" element={<MarkAttendance />} />
              <Route path="edit" element={<EditAttendance />} />
              <Route path="history" element={<AttendanceHistory />} />
              <Route path="reports" element={<TeacherReports />} />
            </Route>

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student', 'admin']}>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<StudentDashboard />} />
              <Route path="subjects" element={<SubjectWiseAttendance />} />
              <Route path="history" element={<StudentAttendanceHistory />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
