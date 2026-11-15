import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authService.getAllUsers();
      if (res.success) setUsers(res.users);
    } catch (err) {
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (user) => {
    try {
      const res = await authService.toggleUserStatus(user._id);
      if (res.success) {
        toast.success(res.message);
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, isActive: !u.isActive } : u))
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-purple-100 text-purple-800">
            Admin
          </span>
        );
      case 'teacher':
        return (
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 text-blue-800">
            Teacher
          </span>
        );
      case 'student':
        return (
          <span className="px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800">
            Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">System User Accounts</h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Manage system security, access control, and user activation status across roles.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden min-w-0">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">User</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Email</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">System Role</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Registered Date</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5">Account Status</th>
                  <th className="px-4 sm:px-5 py-3 sm:py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm">{u.name}</p>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs font-medium text-slate-600">
                      <span className="flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{u.email}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{u.isActive ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-4 text-right">
                      <button
                        onClick={() => handleToggle(u)}
                        className={`text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border transition ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                      No user accounts found.
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

export default UserManagement;
