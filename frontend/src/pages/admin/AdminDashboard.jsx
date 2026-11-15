import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { useSocket } from '../../context/SocketContext';
import StatCard from '../../components/StatCard';
import {
  GraduationCap,
  Users,
  BookOpen,
  Percent,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscribeToUpdates } = useSocket();

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getAdminStats();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const unsubscribe = subscribeToUpdates(() => {
      fetchStats();
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Loading admin analytics...</p>
        </div>
      </div>
    );
  }

  const { stats, attendanceTrend = [], classBreakdown = [], recentActivity = [] } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time college attendance analytics, student metrics, and department breakdowns.
          </p>
        </div>
        <div className="inline-flex items-center space-x-2 bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100 text-[11px] sm:text-xs font-semibold text-indigo-700 self-start sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
          <span>Live WebSocket Monitoring Active</span>
        </div>
      </div>

      {/* 5 Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          subtitle="Enrolled across classes"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Faculty Teachers"
          value={stats?.totalTeachers || 0}
          subtitle="Active instructors"
          icon={Users}
          color="sky"
        />
        <StatCard
          title="Total Classes"
          value={stats?.totalClasses || 0}
          subtitle="Active academic sections"
          icon={Layers}
          color="amber"
        />
        <StatCard
          title="Courses / Subjects"
          value={stats?.totalSubjects || 0}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="emerald"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.overallAttendanceRate || 0}%`}
          subtitle="College overall rate"
          icon={Percent}
          color={stats?.overallAttendanceRate >= 75 ? 'emerald' : 'rose'}
          badge={{
            text: stats?.overallAttendanceRate >= 75 ? 'Target Met (>=75%)' : 'Defaulter Alert',
            color: stats?.overallAttendanceRate >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
          }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* Attendance Trend Line/Area Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Attendance Trends (Recent Sessions)</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Daily average attendance percentage across all classes</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 self-start sm:self-auto">
              Last 7 Dates
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full min-w-0">
            {attendanceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#818cf8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attendanceGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs sm:text-sm">
                No attendance records yet
              </div>
            )}
          </div>
        </div>

        {/* Class Attendance Comparison */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Class Attendance Rates</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Comparison against 75% attendance criterion</p>

            <div className="space-y-3 sm:space-y-4">
              {classBreakdown.map((item) => (
                <div key={item.classId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{item.code}</span>
                    <span className="font-bold text-slate-700 flex-shrink-0">{item.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(item.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{item.studentCount} Students</span>
                    <span>{item.total} lectures</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span>Safe (&ge;75%)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>Defaulter (&lt;75%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance Activity Stream */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Recent Attendance Logs (Live Stream)</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Latest recorded student attendance across college</p>
          </div>
          <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg self-start sm:self-auto">
            Auto-Updates via Socket.IO
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[620px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-3 sm:px-4 py-3 rounded-l-lg">Student</th>
                  <th className="px-3 sm:px-4 py-3">Roll No</th>
                  <th className="px-3 sm:px-4 py-3">Class</th>
                  <th className="px-3 sm:px-4 py-3">Subject</th>
                  <th className="px-3 sm:px-4 py-3">Date</th>
                  <th className="px-3 sm:px-4 py-3">Faculty</th>
                  <th className="px-3 sm:px-4 py-3 rounded-r-lg">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentActivity.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-3 sm:px-4 py-3 font-semibold text-slate-900 text-xs sm:text-sm">
                      {rec.student?.name || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs font-mono text-slate-600">
                      {rec.student?.rollNumber || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-slate-600">{rec.class?.code || 'N/A'}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-slate-700 font-medium">
                      {rec.subject?.name || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-slate-500">{rec.date}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs text-slate-600">{rec.teacher?.name || 'Faculty'}</td>
                    <td className="px-3 sm:px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${
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
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-slate-400 text-xs">
                      No recent attendance activity recorded yet.
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

export default AdminDashboard;
