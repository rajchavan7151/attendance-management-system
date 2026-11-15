import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/dashboardService';
import { useSocket } from '../../context/SocketContext';
import StatCard from '../../components/StatCard';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Percent,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { subscribeToUpdates } = useSocket();

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getStudentStats();
      if (res.success) setData(res);
    } catch (err) {
      console.error(err);
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
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const { student, stats, subjectWise = [], recentRecords = [] } = data || {};
  const isSafe = (stats?.percentage || 0) >= 75;

  const pieData = [
    { name: 'Attended', value: stats?.effectivePresent || 0, color: '#10b981' },
    { name: 'Absent', value: stats?.absent || 0, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Welcome Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-5 sm:p-8 text-white shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-indigo-400/30">
              Student Portal
            </span>
            <span className="text-xs text-indigo-300 font-mono font-bold">
              Roll No: {student?.rollNumber}
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome, {student?.name}!
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm mt-1">
            Enrolled in {student?.class?.name} ({student?.class?.code}) • {student?.class?.semester}
          </p>
        </div>

        {/* Attendance Percentage Badge */}
        <div className="flex items-center justify-between sm:justify-start space-x-4 bg-white/10 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-white/20 w-full md:w-auto">
          <div>
            <p className="text-[10px] sm:text-xs uppercase font-bold text-indigo-200">Current Standing</p>
            <p className="text-2xl sm:text-3xl font-black text-white">{stats?.percentage || 0}%</p>
          </div>
          <div
            className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${
              isSafe ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          >
            {isSafe ? <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7" /> : <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7" />}
          </div>
        </div>
      </div>

      {/* 75% Threshold Alert / Advice Banner */}
      <div
        className={`rounded-2xl p-3.5 sm:p-5 border flex items-start space-x-3 sm:space-x-3.5 ${
          isSafe
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-rose-50/70 border-rose-200 text-rose-900'
        }`}
      >
        <div
          className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
            isSafe ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {isSafe ? <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
        </div>
        <div className="text-xs sm:text-sm">
          <p className="font-bold">
            {isSafe
              ? 'Safe Attendance Standing (Eligible for Examinations)'
              : 'Short Attendance Defaulter Warning (< 75%)'}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-xs opacity-90 leading-relaxed">
            {isSafe ? (
              <>
                Your overall attendance is <strong>{stats?.percentage}%</strong>, safely above the mandatory 75% threshold.
                {stats?.marginToMiss > 0 ? (
                  <span> You have a safety margin of up to <strong>{stats?.marginToMiss} lecture(s)</strong> you could miss without dipping below 75%.</span>
                ) : (
                  <span> Maintain regular attendance to keep your standing safe.</span>
                )}
              </>
            ) : (
              <>
                Your attendance is <strong>{stats?.percentage}%</strong>, which is below the university 75% rule.
                {stats?.lecturesNeededFor75 > 0 && (
                  <span> You must attend the next <strong>{stats?.lecturesNeededFor75} consecutive lecture(s)</strong> without absence to regain safe standing.</span>
                )}
              </>
            )}
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Lectures"
          value={stats?.total || 0}
          subtitle="Conducted to date"
          icon={CalendarCheck}
          color="indigo"
        />
        <StatCard
          title="Lectures Attended"
          value={stats?.effectivePresent || 0}
          subtitle="Present / Late sessions"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Lectures Missed"
          value={stats?.absent || 0}
          subtitle="Unexcused absences"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats?.percentage || 0}%`}
          subtitle="College criterion: 75%"
          icon={Percent}
          color={isSafe ? 'emerald' : 'rose'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 min-w-0">
        {/* Subject-wise Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Subject-wise Attendance Rates</h2>
              <p className="text-[11px] sm:text-xs text-slate-500">Your attendance percentage across enrolled courses</p>
            </div>
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 self-start sm:self-auto">
              Goal: &ge;75%
            </span>
          </div>

          <div className="h-56 sm:h-64 w-full min-w-0">
            {subjectWise.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectWise} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {subjectWise.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.percentage >= 75 ? '#10b981' : '#f43f5e'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No course data available
              </div>
            )}
          </div>
        </div>

        {/* Presence Ratio Pie Chart */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Attendance Ratio</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Attended vs Absent lectures</p>

            <div className="h-40 sm:h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-slate-100 flex items-center justify-around text-xs font-bold">
            <span className="flex items-center space-x-1.5 text-emerald-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Attended: {stats?.effectivePresent || 0}</span>
            </span>
            <span className="flex items-center space-x-1.5 text-rose-700">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
              <span>Absent: {stats?.absent || 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recent Attendance Records Timeline */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm min-w-0">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Your Recent Attendance History</h2>
        <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Latest attendance logged for your classes</p>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <table className="w-full text-left text-sm min-w-[580px]">
              <thead className="bg-slate-50 text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 sm:px-5 py-3">Date</th>
                  <th className="px-4 sm:px-5 py-3">Course / Subject</th>
                  <th className="px-4 sm:px-5 py-3">Faculty Instructor</th>
                  <th className="px-4 sm:px-5 py-3">Status</th>
                  <th className="px-4 sm:px-5 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {rec.date}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 font-bold text-slate-900 text-xs sm:text-sm">
                      {rec.subject?.code} - {rec.subject?.name}
                    </td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-600">{rec.teacher?.name || 'Faculty'}</td>
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold ${
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
                    <td className="px-4 sm:px-5 py-3 sm:py-3.5 text-xs text-slate-400">{rec.remarks || '-'}</td>
                  </tr>
                ))}
                {recentRecords.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 text-xs sm:text-sm">
                      No recent attendance records found.
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

export default StudentDashboard;
