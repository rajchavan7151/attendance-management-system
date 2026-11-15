import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { useSocket } from '../../context/SocketContext';
import StatCard from '../../components/StatCard';
import {
  CalendarCheck,
  BookOpen,
  Layers,
  Users,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const TeacherDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { subscribeToUpdates } = useSocket();

  const fetchStats = async () => {
    try {
      const res = await dashboardService.getTeacherStats();
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

  const { teacher, stats, subjectBreakdown = [], recentActivity = [] } = data || {};

  return (
    <div className="space-y-4 sm:space-y-6 w-full min-w-0">
      {/* Welcome Banner */}
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-600 p-5 sm:p-8 text-white shadow-xl shadow-indigo-600/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-semibold backdrop-blur-sm uppercase tracking-wider">
            Faculty Portal
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight mt-2">
            Welcome back, {teacher?.name || 'Professor'}!
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Department of {teacher?.department}. Ready to record today&apos;s lecture attendance or generate class reports?
          </p>
        </div>
        <button
          onClick={() => navigate('/teacher/mark')}
          className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-sm shadow-lg shadow-indigo-900/20 hover:bg-indigo-50 transition transform hover:-translate-y-0.5 w-full sm:w-auto"
        >
          <CalendarCheck className="w-5 h-5 text-indigo-600" />
          <span>Mark Today&apos;s Attendance</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Assigned Classes"
          value={stats?.assignedClassesCount || 0}
          subtitle="Sections under your faculty"
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Assigned Subjects"
          value={stats?.assignedSubjectsCount || 0}
          subtitle="Courses in current semester"
          icon={BookOpen}
          color="sky"
        />
        <StatCard
          title="Students Taught"
          value={stats?.totalStudents || 0}
          subtitle="Total enrolled students"
          icon={Users}
          color="amber"
        />
        <StatCard
          title="Overall Attendance"
          value={`${stats?.overallStats?.percentage || 0}%`}
          subtitle="Average student presence"
          icon={TrendingUp}
          color={stats?.overallStats?.percentage >= 75 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Courses & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 min-w-0">
        <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm min-w-0">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Your Courses & Attendance Rates</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Subject performance across all marked lectures</p>

          <div className="space-y-3 sm:space-y-4">
            {subjectBreakdown.map((sub) => (
              <div key={sub.subjectId} className="p-3 sm:p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      {sub.code}
                    </span>
                    <span className="ml-2 font-bold text-slate-800 text-xs sm:text-sm truncate">{sub.name}</span>
                  </div>
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 flex-shrink-0">{sub.percentage}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(sub.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>{sub.total} records marked</span>
                  <span className="text-emerald-600 font-semibold">{sub.present} Attended</span>
                  <span className="text-rose-600 font-semibold">{sub.absent} Absent</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Marks */}
        <div className="rounded-2xl bg-white p-4 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-w-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Recent Attendance Submissions</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Latest individual attendance records you marked</p>

            <div className="space-y-2 sm:space-y-2.5 overflow-y-auto max-h-72">
              {recentActivity.slice(0, 7).map((rec) => (
                <div
                  key={rec._id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 text-xs truncate">{rec.student?.name}</p>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                      {rec.student?.rollNumber} • {rec.subject?.code} ({rec.date})
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold flex-shrink-0 ${
                      rec.status === 'Present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rec.status === 'Late'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-center py-8 text-slate-400 text-xs">
                  No attendance records marked yet. Click &quot;Mark Today&apos;s Attendance&quot; above to start.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => navigate('/teacher/history')}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition text-center"
            >
              View Full Attendance History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
