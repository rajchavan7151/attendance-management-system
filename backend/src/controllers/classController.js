const Class = require('../models/Class');
const Student = require('../models/Student');
const Subject = require('../models/Subject');

// @desc    Get all classes with student and subject counts
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().sort({ name: 1 });

    // Enhance with counts
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        const subjectCount = await Subject.countDocuments({ class: cls._id });
        return {
          ...cls.toObject(),
          studentCount,
          subjectCount,
        };
      })
    );

    res.json({ success: true, count: classes.length, classes: classesWithCounts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class with students and subjects
// @route   GET /api/classes/:id
// @access  Private
const getClassById = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const students = await Student.find({ class: cls._id }).sort({ rollNumber: 1 });
    const subjects = await Subject.find({ class: cls._id }).populate('teacher', 'name email');

    res.json({
      success: true,
      class: cls,
      students,
      subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private/Admin
const createClass = async (req, res, next) => {
  try {
    const { name, code, department, semester, academicYear, description } = req.body;

    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({ success: false, message: `Class code '${code}' already exists` });
    }

    const newClass = await Class.create({
      name,
      code: code.toUpperCase(),
      department,
      semester,
      academicYear: academicYear || '2026-2027',
      description,
    });

    res.status(201).json({ success: true, class: newClass });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private/Admin
const updateClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const updated = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, class: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private/Admin
const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const studentCount = await Student.countDocuments({ class: cls._id });
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete class. It has ${studentCount} enrolled student(s). Reassign or delete them first.`,
      });
    }

    await Class.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};
