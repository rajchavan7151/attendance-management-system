import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher');
      } else if (data.user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrorMessage('');
    setTimeout(() => {
      login(demoEmail, demoPassword)
        .then((data) => {
          toast.success(`Logged in as ${data.user.name} (${data.user.role.toUpperCase()})`);
          if (data.user.role === 'admin') navigate('/admin');
          else if (data.user.role === 'teacher') navigate('/teacher');
          else if (data.user.role === 'student') navigate('/student');
        })
        .catch((err) => {
          const msg = err.response?.data?.message || err.message || 'Login failed';
          setErrorMessage(msg);
          toast.error(msg);
        });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 w-full overflow-x-hidden">
      {/* Decorative background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-72 sm:w-96 h-72 sm:h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center px-2">
          <div className="inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-500/30 text-white text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            🎓
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            EduTrack AMS
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-indigo-200">
            Smart Attendance Management & Analytics System
          </p>
        </div>

        {/* Card Form */}
        <div className="mt-6 sm:mt-8 bg-white/95 backdrop-blur-md py-6 sm:py-8 px-4 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-white/20">
          <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
            {errorMessage && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.com"
                  className="block w-full pl-10 pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2.5 sm:py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 transition"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Banner */}
          <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ Quick Demo Logins
              </span>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">
                1-Click
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin@college.com', 'Admin123')}
                className="flex sm:flex-col items-center justify-start sm:justify-center p-2.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-purple-800 transition text-left sm:text-center group space-x-3 sm:space-x-0"
              >
                <span className="text-xl sm:text-lg sm:mb-0.5 group-hover:scale-110 transition flex-shrink-0">👑</span>
                <div>
                  <span className="text-xs font-bold block">Admin</span>
                  <span className="text-[10px] text-purple-600 block">Full Control</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('teacher@college.com', 'Teacher123')}
                className="flex sm:flex-col items-center justify-start sm:justify-center p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-800 transition text-left sm:text-center group space-x-3 sm:space-x-0"
              >
                <span className="text-xl sm:text-lg sm:mb-0.5 group-hover:scale-110 transition flex-shrink-0">👨‍🏫</span>
                <div>
                  <span className="text-xs font-bold block">Teacher</span>
                  <span className="text-[10px] text-blue-600 block">Mark & Edit</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('student@college.com', 'Student123')}
                className="flex sm:flex-col items-center justify-start sm:justify-center p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 transition text-left sm:text-center group space-x-3 sm:space-x-0"
              >
                <span className="text-xl sm:text-lg sm:mb-0.5 group-hover:scale-110 transition flex-shrink-0">🎓</span>
                <div>
                  <span className="text-xs font-bold block">Student</span>
                  <span className="text-[10px] text-emerald-600 block">View Status</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-4 sm:mt-6 text-center text-[11px] sm:text-xs text-indigo-200/80 px-2">
          EduTrack College Mini-Project • React + Node.js + MongoDB + Socket.IO
        </p>
      </div>
    </div>
  );
};

export default Login;
