const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const { calculateAttendanceStats } = require('../utils/calculatePercentage');
const { emitAttendanceUpdate, emitStudentNotification } = require('../utils/socket');

// @desc    Mark attendance for a batch of students (Create or Update)
// @route   POST /api/attendance/mark
// @access  Private (Teacher, Admin)
const markAttendance = async (req, res, next) => {
  try {
    const { classId, subjectId, date, attendanceList } = req.body;

    if (!classId || !subjectId || !date || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId, subjectId, date (YYYY-MM-DD), and an array of student attendance items.',
      });
    }

    // Determine teacher ID
    let teacherId = null;
    if (req.user.role === 'teacher' && req.user.teacherProfile) {
      teacherId = req.user.teacherProfile._id;
    } else {
      // If admin, find subject's assigned teacher or first teacher
      const subject = await Subject.findById(subjectId);
      teacherId = subject?.teacher || req.body.teacherId;
      if (!teacherId) {
        const anyTeacher = await Teacher.findOne();
        teacherId = anyTeacher?._id;
      }
    }

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Valid Teacher is required to mark attendance' });
    }

    const savedRecords = [];
    const updatedRecords = [];

    for (const item of attendanceList) {
      const { studentId, status, remarks } = item;
      if (!studentId || !status) continue;

      // Upsert to handle both fresh marking and updating without duplicate key collision
      const filter = {
        student: studentId,
        subject: subjectId,
        class: classId,
        date: date,
      };

      const updateData = {
        student: studentId,
        teacher: teacherId,
        subject: subjectId,
        class: classId,
        date: date,
        status: status,
        remarks: remarks || '',
      };

      const record = await Attendance.findOneAndUpdate(filter, updateData, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      savedRecords.push(record);

      // Real-time alert to individual student
      emitStudentNotification(studentId, {
        type: 'ATTENDANCE_MARKED',
        date,
        subjectId,
        status,
        message: `Attendance marked as ${status} for ${date}`,
      });
    }

    // Fetch class and subject names for real-time notification
    const [cls, subj] = await Promise.all([
      Class.findById(classId).select('name code'),
      Subject.findById(subjectId).select('name code'),
    ]);

    // Emit real-time update to all dashboards
    emitAttendanceUpdate({
      type: 'BATCH_ATTENDANCE_SAVED',
      classId,
      className: cls?.name,
      subjectId,
      subjectName: subj?.name,
      date,
      count: savedRecords.length,
      markedBy: req.user.name,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Successfully recorded attendance for ${savedRecords.length} students on ${date}`,
      count: savedRecords.length,
      records: savedRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records with filters
// @route   GET /api/attendance
// @access  Private
const getAttendanceRecords = async (req, res, next) => {
  try {
    const { classId, subjectId, date, studentId, teacherId, status, startDate, endDate } = req.query;

    const filter = {};
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (date) filter.date = date;
    if (studentId) filter.student = studentId;
    if (teacherId) filter.teacher = teacherId;
    if (status) filter.status = status;

    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // If logged in as student, force filter to own profile
    if (req.user.role === 'student' && req.user.studentProfile) {
      filter.student = req.user.studentProfile._id;
    }

    const records = await Attendance.find(filter)
      .populate('student', 'name rollNumber email')
      .populate('subject', 'name code')
      .populate('class', 'name code department')
      .populate('teacher', 'name email')
      .sort({ date: -1, createdAt: -1 });

    const stats = calculateAttendanceStats(records);

    res.json({
      success: true,
      count: records.length,
      stats,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Admin)
const updateAttendanceRecord = async (req, res, next) => {
  try {
    const { status, remarks } = req.body;

    const record = await Attendance.findById(req.params.id)
      .populate('student', 'name rollNumber')
      .populate('subject', 'name code')
      .populate('class', 'name code');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) record.status = status;
    if (remarks !== undefined) record.remarks = remarks;

    await record.save();

    // Emit live update
    emitAttendanceUpdate({
      type: 'SINGLE_RECORD_UPDATED',
      recordId: record._id,
      studentName: record.student?.name,
      subjectName: record.subject?.name,
      date: record.date,
      status: record.status,
    });

    emitStudentNotification(record.student?._id, {
      type: 'ATTENDANCE_CORRECTED',
      date: record.date,
      status: record.status,
      message: `Your attendance record on ${record.date} was updated to ${record.status}`,
    });

    res.json({ success: true, message: 'Attendance updated successfully', record });
  } catch (error) {
    next(error);
  }
};

// @desc    Get student's own attendance summary and subject-wise breakdown
// @route   GET /api/attendance/student-summary/:studentId?
// @access  Private
const getStudentAttendanceSummary = async (req, res, next) => {
  try {
    let studentId = req.params.studentId;

    if (req.user.role === 'student') {
      if (!req.user.studentProfile) {
        return res.status(404).json({ success: false, message: 'Student profile not linked to user' });
      }
      studentId = req.user.studentProfile._id;
    }

    const student = await Student.findById(studentId).populate('class', 'name code department semester');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Get all records for this student
    const allRecords = await Attendance.find({ student: student._id })
      .populate('subject', 'name code')
      .populate('teacher', 'name')
      .sort({ date: -1 });

    const overallStats = calculateAttendanceStats(allRecords);

    // Subject-wise breakdown
    const subjectsInClass = await Subject.find({ class: student.class._id });
    const subjectWise = [];

    for (const sub of subjectsInClass) {
      const subRecords = allRecords.filter(
        (r) => r.subject && r.subject._id.toString() === sub._id.toString()
      );
      const subStats = calculateAttendanceStats(subRecords);
      subjectWise.push({
        subject: {
          _id: sub._id,
          name: sub.name,
          code: sub.code,
          credits: sub.credits,
        },
        ...subStats,
      });
    }

    res.json({
      success: true,
      student: {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        email: student.email,
        class: student.class,
      },
      overallStats,
      subjectWise,
      recentRecords: allRecords.slice(0, 15),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get class attendance percentage report
// @route   GET /api/attendance/class-report/:classId
// @access  Private
const getClassAttendanceReport = async (req, res, next) => {
  try {
    const { classId } = req.params;
    const { subjectId } = req.query;

    const cls = await Class.findById(classId);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await Student.find({ class: classId }).sort({ rollNumber: 1 });
    const filter = { class: classId };
    if (subjectId) filter.subject = subjectId;

    const allRecords = await Attendance.find(filter);

    const report = students.map((student) => {
      const studentRecords = allRecords.filter(
        (r) => r.student.toString() === student._id.toString()
      );
      const stats = calculateAttendanceStats(studentRecords);
      return {
        student: {
          _id: student._id,
          name: student.name,
          rollNumber: student.rollNumber,
          email: student.email,
        },
        stats,
      };
    });

    const overallClassStats = calculateAttendanceStats(allRecords);

    res.json({
      success: true,
      class: cls,
      overallStats: overallClassStats,
      totalStudents: students.length,
      report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  markAttendance,
  getAttendanceRecords,
  updateAttendanceRecord,
  getStudentAttendanceSummary,
  getClassAttendanceReport,
};
