const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { calculateAttendanceStats } = require('../utils/calculatePercentage');

// @desc    Get dashboard statistics for Admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const [totalStudents, totalTeachers, totalClasses, totalSubjects, totalUsers, allAttendance] =
      await Promise.all([
        Student.countDocuments(),
        Teacher.countDocuments(),
        Class.countDocuments(),
        Subject.countDocuments(),
        User.countDocuments(),
        Attendance.find().sort({ date: -1 }),
      ]);

    const overallStats = calculateAttendanceStats(allAttendance);

    // Recent 10 attendance records
    const recentActivity = await Attendance.find()
      .populate('student', 'name rollNumber')
      .populate('subject', 'name code')
      .populate('class', 'name code')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Group attendance by date for the last 7 distinct dates
    const dateMap = {};
    allAttendance.forEach((rec) => {
      if (!dateMap[rec.date]) {
        dateMap[rec.date] = { date: rec.date, present: 0, absent: 0, total: 0 };
      }
      dateMap[rec.date].total += 1;
      if (rec.status === 'Present' || rec.status === 'Late') {
        dateMap[rec.date].present += 1;
      } else {
        dateMap[rec.date].absent += 1;
      }
    });

    const attendanceTrend = Object.values(dateMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7)
      .map((d) => ({
        ...d,
        percentage: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
      }));

    // Class wise statistics
    const classes = await Class.find();
    const classBreakdown = [];

    for (const c of classes) {
      const classRecs = allAttendance.filter((r) => r.class.toString() === c._id.toString());
      const stats = calculateAttendanceStats(classRecs);
      classBreakdown.push({
        classId: c._id,
        className: c.name,
        code: c.code,
        studentCount: await Student.countDocuments({ class: c._id }),
        ...stats,
      });
    }

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        totalUsers,
        totalAttendanceRecords: allAttendance.length,
        overallAttendanceRate: overallStats.percentage,
        overallStats,
      },
      attendanceTrend,
      classBreakdown,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Teacher
// @route   GET /api/dashboard/teacher
// @access  Private (Teacher)
const getTeacherStats = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user._id })
      .populate('assignedClasses')
      .populate('assignedSubjects');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher profile not found' });
    }

    // Teacher's marked attendance records
    const records = await Attendance.find({ teacher: teacher._id }).sort({ date: -1 });
    const teacherStats = calculateAttendanceStats(records);

    // Count students in assigned classes
    const assignedClassIds = teacher.assignedClasses.map((c) => c._id);
    const totalStudents = await Student.countDocuments({ class: { $in: assignedClassIds } });

    // Today's date YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = records.filter((r) => r.date === today);

    // Recent 10 marks
    const recentActivity = await Attendance.find({ teacher: teacher._id })
      .populate('student', 'name rollNumber')
      .populate('subject', 'name code')
      .populate('class', 'name code')
      .sort({ createdAt: -1 })
      .limit(10);

    // Subject breakdown
    const subjectBreakdown = teacher.assignedSubjects.map((sub) => {
      const subRecs = records.filter((r) => r.subject.toString() === sub._id.toString());
      return {
        subjectId: sub._id,
        name: sub.name,
        code: sub.code,
        ...calculateAttendanceStats(subRecs),
      };
    });

    res.json({
      success: true,
      teacher,
      stats: {
        assignedClassesCount: teacher.assignedClasses.length,
        assignedSubjectsCount: teacher.assignedSubjects.length,
        totalStudents,
        totalLecturesMarked: records.length,
        todayMarksCount: todayRecords.length,
        overallStats: teacherStats,
      },
      subjectBreakdown,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for Student
// @route   GET /api/dashboard/student
// @access  Private (Student)
const getStudentStats = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user._id }).populate('class');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const records = await Attendance.find({ student: student._id })
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    const stats = calculateAttendanceStats(records);

    // Subjects in student's class
    const subjects = await Subject.find({ class: student.class._id });
    const subjectWise = subjects.map((sub) => {
      const subRecs = records.filter(
        (r) => r.subject && r.subject._id.toString() === sub._id.toString()
      );
      return {
        _id: sub._id,
        name: sub.name,
        code: sub.code,
        credits: sub.credits,
        ...calculateAttendanceStats(subRecs),
      };
    });

    // Attendance calculation: How many lectures needed to reach 75%?
    // (present + x) / (total + x) >= 0.75  =>  x >= (0.75 * total - present) / 0.25
    let lecturesNeededFor75 = 0;
    if (stats.percentage < 75 && stats.total > 0) {
      const needed = Math.ceil((0.75 * stats.total - stats.effectivePresent) / 0.25);
      lecturesNeededFor75 = needed > 0 ? needed : 0;
    }

    // How many lectures can be missed without going below 75%?
    let marginToMiss = 0;
    if (stats.percentage >= 75 && stats.total > 0) {
      // (present) / (total + m) >= 0.75  =>  m <= (present - 0.75 * total) / 0.75
      marginToMiss = Math.floor((stats.effectivePresent - 0.75 * stats.total) / 0.75);
      if (marginToMiss < 0) marginToMiss = 0;
    }

    res.json({
      success: true,
      student,
      stats: {
        ...stats,
        lecturesNeededFor75,
        marginToMiss,
      },
      subjectWise,
      recentRecords: records.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
};
