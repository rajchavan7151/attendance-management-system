import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { LogOut, User as UserIcon, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, role } = useAuth();
  const { isConnected } = useSocket();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-wider">
            Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200 uppercase tracking-wider">
            Teacher
          </span>
        );
      case 'student':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
            Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm transition-all w-full">
      <div className="px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between max-w-7xl mx-auto">
        {/* Left: Mobile hamburger & System Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 sm:space-x-2.5">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 font-bold text-base sm:text-lg flex-shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">EduTrack</span>
                <span className="hidden sm:inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  College AMS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live socket status, User info, and Logout */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Real-time Socket Indicator */}
          <div
            className="flex items-center space-x-1.5 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium border bg-slate-50"
            title={isConnected ? 'Connected to live Socket.IO events' : 'Connecting to real-time server...'}
          >
            <span
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className={`hidden xs:inline ${isConnected ? 'text-emerald-700 font-semibold' : 'text-amber-700'}`}>
              {isConnected ? 'Live' : 'Connecting'}
            </span>
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center space-x-2 sm:space-x-3 border-l border-slate-200 pl-2 sm:pl-4">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs sm:text-sm shadow-inner flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center space-x-1.5">
                <p className="text-sm font-semibold text-slate-800 leading-tight truncate max-w-[130px] lg:max-w-[180px]">
                  {user?.name || 'User'}
                </p>
                {getRoleBadge()}
              </div>
              <p className="text-[11px] text-slate-500 truncate max-w-[150px] lg:max-w-[200px]">{user?.email}</p>
            </div>
            <div className="md:hidden">
              {getRoleBadge()}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            title="Sign out of account"
            className="flex items-center space-x-1 p-2 sm:px-3 sm:py-1.5 rounded-xl text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
