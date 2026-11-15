const Student = require('../models/Student');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { calculateAttendanceStats } = require('../utils/calculatePercentage');

// @desc    Get all students (optional filter by class, search by rollNumber/name)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [{ name: searchRegex }, { rollNumber: searchRegex }, { email: searchRegex }];
    }

    const students = await Student.find(filter)
      .populate('user', 'email role isActive')
      .populate('class', 'name code department semester')
      .sort({ rollNumber: 1 });

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student with attendance summary
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('user', 'email role isActive')
      .populate('class');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Calculate overall stats for this student
    const records = await Attendance.find({ student: student._id });
    const stats = calculateAttendanceStats(records);

    res.json({
      success: true,
      student,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student (creates User + Student)
// @route   POST /api/students
// @access  Private/Admin
const createStudent = async (req, res, next) => {
  try {
    const { name, email, rollNumber, class: classId, password, phone, guardianName, guardianPhone } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Check duplicate roll number
    const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: `Roll number '${rollNumber}' is already assigned` });
    }

    // 1. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Student123',
      role: 'student',
    });

    // 2. Create Student
    const student = await Student.create({
      user: user._id,
      name,
      email: email.toLowerCase(),
      rollNumber: rollNumber.toUpperCase(),
      class: classId,
      phone: phone || '',
      guardianName: guardianName || '',
      guardianPhone: guardianPhone || '',
    });

    // 3. Link back
    user.studentProfile = student._id;
    await user.save();

    const populated = await Student.findById(student._id)
      .populate('user', 'email role')
      .populate('class', 'name code');

    res.status(201).json({ success: true, student: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const { name, email, rollNumber, class: classId, phone, guardianName, guardianPhone } = req.body;

    if (rollNumber && rollNumber.toUpperCase() !== student.rollNumber) {
      const rollExists = await Student.findOne({ rollNumber: rollNumber.toUpperCase(), _id: { $ne: student._id } });
      if (rollExists) {
        return res.status(400).json({ success: false, message: 'Roll number already in use' });
      }
      student.rollNumber = rollNumber.toUpperCase();
    }

    if (name) student.name = name;
    if (classId) student.class = classId;
    if (phone !== undefined) student.phone = phone;
    if (guardianName !== undefined) student.guardianName = guardianName;
    if (guardianPhone !== undefined) student.guardianPhone = guardianPhone;

    if (email && email.toLowerCase() !== student.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: student.user } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      student.email = email.toLowerCase();
      await User.findByIdAndUpdate(student.user, { email: email.toLowerCase(), name: student.name });
    } else if (name) {
      await User.findByIdAndUpdate(student.user, { name });
    }

    await student.save();

    const updated = await Student.findById(student._id)
      .populate('user', 'email role isActive')
      .populate('class', 'name code');

    res.json({ success: true, student: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Delete attendance records
    await Attendance.deleteMany({ student: student._id });

    // Delete user account
    if (student.user) {
      await User.findByIdAndDelete(student.user);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student and attendance records deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
