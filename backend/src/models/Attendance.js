const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher ID is required'],
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Subject ID is required'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for deterministic unique indexing
      required: [true, 'Date string (YYYY-MM-DD) is required'],
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      required: [true, 'Attendance status is required'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate attendance records for the same student, subject, class, and date
attendanceSchema.index(
  { student: 1, subject: 1, class: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);
