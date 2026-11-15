const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Subject = require('../models/Subject');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find()
      .populate('user', 'email role isActive')
      .populate('assignedClasses', 'name code department semester')
      .populate('assignedSubjects', 'name code class')
      .sort({ name: 1 });

    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
const getTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('user', 'email role isActive')
      .populate('assignedClasses')
      .populate('assignedSubjects');

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    res.json({ success: true, teacher });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher (creates User + Teacher)
// @route   POST /api/teachers
// @access  Private/Admin
const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, department, employeeId, phone, assignedClasses, assignedSubjects } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // 1. Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: password || 'Teacher123',
      role: 'teacher',
    });

    // 2. Create Teacher
    const teacher = await Teacher.create({
      user: user._id,
      name,
      email: email.toLowerCase(),
      department,
      employeeId,
      phone: phone || '',
      assignedClasses: assignedClasses || [],
      assignedSubjects: assignedSubjects || [],
    });

    // 3. Link back to User
    user.teacherProfile = teacher._id;
    await user.save();

    // 4. Update assigned subjects if any
    if (assignedSubjects && assignedSubjects.length > 0) {
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $set: { teacher: teacher._id } }
      );
    }

    const populated = await Teacher.findById(teacher._id)
      .populate('user', 'email role')
      .populate('assignedClasses')
      .populate('assignedSubjects');

    res.status(201).json({ success: true, teacher: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private/Admin
const updateTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const { name, email, department, employeeId, phone, assignedClasses, assignedSubjects } = req.body;

    // Update teacher record
    teacher.name = name || teacher.name;
    teacher.department = department || teacher.department;
    teacher.employeeId = employeeId !== undefined ? employeeId : teacher.employeeId;
    teacher.phone = phone !== undefined ? phone : teacher.phone;
    if (assignedClasses) teacher.assignedClasses = assignedClasses;
    if (assignedSubjects) teacher.assignedSubjects = assignedSubjects;

    if (email && email.toLowerCase() !== teacher.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase(), _id: { $ne: teacher.user } });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email already in use by another user' });
      }
      teacher.email = email.toLowerCase();
      await User.findByIdAndUpdate(teacher.user, { email: email.toLowerCase(), name: teacher.name });
    } else if (name) {
      await User.findByIdAndUpdate(teacher.user, { name });
    }

    await teacher.save();

    // Update subject references
    if (assignedSubjects) {
      await Subject.updateMany(
        { _id: { $in: assignedSubjects } },
        { $set: { teacher: teacher._id } }
      );
    }

    const updated = await Teacher.findById(teacher._id)
      .populate('user', 'email role isActive')
      .populate('assignedClasses')
      .populate('assignedSubjects');

    res.json({ success: true, teacher: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private/Admin
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Unassign from subjects
    await Subject.updateMany(
      { teacher: teacher._id },
      { $unset: { teacher: '' } }
    );

    // Delete associated User account
    if (teacher.user) {
      await User.findByIdAndDelete(teacher.user);
    }

    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Teacher and associated account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
