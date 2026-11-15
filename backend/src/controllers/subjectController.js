const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');

// @desc    Get all subjects (optional filter by class or teacher)
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.class) filter.class = req.query.class;
    if (req.query.teacher) filter.teacher = req.query.teacher;

    const subjects = await Subject.find(filter)
      .populate('class', 'name code department semester')
      .populate('teacher', 'name email department')
      .sort({ code: 1 });

    res.json({ success: true, count: subjects.length, subjects });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate('class')
      .populate('teacher');

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.json({ success: true, subject });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = async (req, res, next) => {
  try {
    const { name, code, class: classId, teacher, credits, description } = req.body;

    const existing = await Subject.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: `Subject code '${code}' already exists` });
    }

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      class: classId,
      teacher: teacher || null,
      credits: credits || 3,
      description,
    });

    // If teacher assigned, ensure teacher has this subject and class in their list
    if (teacher) {
      await Teacher.findByIdAndUpdate(teacher, {
        $addToSet: { assignedSubjects: subject._id, assignedClasses: classId },
      });
    }

    const populated = await Subject.findById(subject._id)
      .populate('class', 'name code')
      .populate('teacher', 'name email');

    res.status(201).json({ success: true, subject: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const updated = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('class', 'name code')
      .populate('teacher', 'name email');

    // Update teacher assignment if changed
    if (req.body.teacher && req.body.teacher !== String(subject.teacher)) {
      await Teacher.findByIdAndUpdate(req.body.teacher, {
        $addToSet: { assignedSubjects: updated._id, assignedClasses: updated.class },
      });
    }

    res.json({ success: true, subject: updated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    // Remove from teachers
    await Teacher.updateMany(
      { assignedSubjects: subject._id },
      { $pull: { assignedSubjects: subject._id } }
    );

    await Subject.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Subject deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
