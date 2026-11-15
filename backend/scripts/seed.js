const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const User = require('../src/models/User');
const Class = require('../src/models/Class');
const Subject = require('../src/models/Subject');
const Teacher = require('../src/models/Teacher');
const Student = require('../src/models/Student');
const Attendance = require('../src/models/Attendance');

const seedData = async () => {
  try {
    console.log('🌱 Starting Attendance Management System Data Seeder...');
    await connectDB();

    // 1. Clear existing collections
    console.log('🧹 Clearing previous data collections...');
    await Promise.all([
      User.deleteMany(),
      Class.deleteMany(),
      Subject.deleteMany(),
      Teacher.deleteMany(),
      Student.deleteMany(),
      Attendance.deleteMany(),
    ]);

    // 2. Create Classes
    console.log('🏫 Creating classes...');
    const classA = await Class.create({
      name: 'B.Tech Computer Science - Year 3 (Section A)',
      code: 'CS-3A',
      department: 'Computer Science & Engineering',
      semester: 'Semester 5',
      academicYear: '2026-2027',
      description: 'Core B.Tech CSE Class - Section A',
    });

    const classB = await Class.create({
      name: 'B.Tech Information Technology - Year 3 (Section B)',
      code: 'IT-3B',
      department: 'Information Technology',
      semester: 'Semester 5',
      academicYear: '2026-2027',
      description: 'Core B.Tech IT Class - Section B',
    });

    // 3. Create Admin User
    console.log('👑 Creating Admin user...');
    await User.create({
      name: 'College Administrator',
      email: 'admin@college.com',
      password: 'Admin123',
      role: 'admin',
      isActive: true,
    });

    // 4. Create Main Demo Teacher
    console.log('👨‍🏫 Creating Teachers...');
    const teacherUser1 = await User.create({
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@college.com',
      password: 'Teacher123',
      role: 'teacher',
      isActive: true,
    });

    const teacher1 = await Teacher.create({
      user: teacherUser1._id,
      name: 'Prof. Sarah Jenkins',
      email: 'teacher@college.com',
      department: 'Computer Science & Engineering',
      employeeId: 'EMP-CS-101',
      phone: '+1 555-019-2834',
      assignedClasses: [classA._id, classB._id],
    });

    teacherUser1.teacherProfile = teacher1._id;
    await teacherUser1.save();

    // Additional Teacher
    const teacherUser2 = await User.create({
      name: 'Dr. Robert Smith',
      email: 'robert@college.com',
      password: 'Teacher123',
      role: 'teacher',
      isActive: true,
    });

    const teacher2 = await Teacher.create({
      user: teacherUser2._id,
      name: 'Dr. Robert Smith',
      email: 'robert@college.com',
      department: 'Computer Science & Engineering',
      employeeId: 'EMP-CS-102',
      phone: '+1 555-019-8871',
      assignedClasses: [classA._id],
    });

    teacherUser2.teacherProfile = teacher2._id;
    await teacherUser2.save();

    // 5. Create Subjects
    console.log('📚 Creating Subjects...');
    const subject1 = await Subject.create({
      name: 'Full Stack Web Development',
      code: 'CS301',
      class: classA._id,
      teacher: teacher1._id,
      credits: 4,
      description: 'Modern MERN stack development, REST APIs, and Cloud deployment.',
    });

    const subject2 = await Subject.create({
      name: 'Database Management Systems',
      code: 'CS302',
      class: classA._id,
      teacher: teacher1._id,
      credits: 4,
      description: 'Relational & NoSQL database architecture, ACID transactions, and indexing.',
    });

    const subject3 = await Subject.create({
      name: 'Computer Networks & Security',
      code: 'CS303',
      class: classA._id,
      teacher: teacher2._id,
      credits: 3,
      description: 'TCP/IP architecture, socket programming, and cryptographic protocols.',
    });

    const subject4 = await Subject.create({
      name: 'Software Engineering & Agile',
      code: 'CS304',
      class: classA._id,
      teacher: teacher2._id,
      credits: 3,
      description: 'Software development lifecycle, Agile Scrum, CI/CD, and testing.',
    });

    // Update teacher assigned subjects
    teacher1.assignedSubjects = [subject1._id, subject2._id];
    await teacher1.save();

    teacher2.assignedSubjects = [subject3._id, subject4._id];
    await teacher2.save();

    // 6. Create Students (At least 10 sample students)
    console.log('🎓 Creating Students...');
    const sampleStudentsData = [
      {
        name: 'Alex Morgan',
        email: 'student@college.com',
        rollNumber: 'CS2024-001',
        phone: '+1 555-111-0001',
      },
      {
        name: 'Bella Chen',
        email: 'bella@college.com',
        rollNumber: 'CS2024-002',
        phone: '+1 555-111-0002',
      },
      {
        name: 'Charlie Davis',
        email: 'charlie@college.com',
        rollNumber: 'CS2024-003',
        phone: '+1 555-111-0003',
      },
      {
        name: 'David Evans',
        email: 'david@college.com',
        rollNumber: 'CS2024-004',
        phone: '+1 555-111-0004',
      },
      {
        name: 'Emma Watson',
        email: 'emma@college.com',
        rollNumber: 'CS2024-005',
        phone: '+1 555-111-0005',
      },
      {
        name: 'Frank Miller',
        email: 'frank@college.com',
        rollNumber: 'CS2024-006',
        phone: '+1 555-111-0006',
      },
      {
        name: 'Grace Hopper',
        email: 'grace@college.com',
        rollNumber: 'CS2024-007',
        phone: '+1 555-111-0007',
      },
      {
        name: 'Henry Ford',
        email: 'henry@college.com',
        rollNumber: 'CS2024-008',
        phone: '+1 555-111-0008',
      },
      {
        name: 'Ivy Taylor',
        email: 'ivy@college.com',
        rollNumber: 'CS2024-009',
        phone: '+1 555-111-0009',
      },
      {
        name: 'Jack Wilson',
        email: 'jack@college.com',
        rollNumber: 'CS2024-010',
        phone: '+1 555-111-0010',
      },
      {
        name: 'Kavita Sharma',
        email: 'kavita@college.com',
        rollNumber: 'CS2024-011',
        phone: '+1 555-111-0011',
      },
      {
        name: 'Liam Brown',
        email: 'liam@college.com',
        rollNumber: 'CS2024-012',
        phone: '+1 555-111-0012',
      },
    ];

    const createdStudents = [];

    for (const item of sampleStudentsData) {
      const user = await User.create({
        name: item.name,
        email: item.email,
        password: 'Student123',
        role: 'student',
        isActive: true,
      });

      const student = await Student.create({
        user: user._id,
        name: item.name,
        email: item.email,
        rollNumber: item.rollNumber,
        class: classA._id,
        phone: item.phone,
        guardianName: 'Guardian of ' + item.name,
        guardianPhone: '+1 555-999-8888',
      });

      user.studentProfile = student._id;
      await user.save();

      createdStudents.push(student);
    }

    // 7. Generate Historical Attendance records across dates & subjects
    console.log('📊 Generating historical attendance records...');
    const subjects = [subject1, subject2, subject3, subject4];
    const teachersMap = {
      [subject1._id.toString()]: teacher1._id,
      [subject2._id.toString()]: teacher1._id,
      [subject3._id.toString()]: teacher2._id,
      [subject4._id.toString()]: teacher2._id,
    };

    // Generate dates for the last 10 weekdays
    const dates = [];
    const today = new Date();
    let daysBack = 1;
    while (dates.length < 10) {
      const d = new Date(today);
      d.setDate(today.getDate() - daysBack);
      const dayOfWeek = d.getDay();
      // Skip weekends (0 is Sun, 6 is Sat)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
      daysBack++;
    }
    dates.reverse(); // Chronological order

    const attendanceToInsert = [];

    dates.forEach((dateStr, dateIdx) => {
      subjects.forEach((subj, subIdx) => {
        // Not every subject occurs every single day; create 2-3 subject sessions per day
        if ((dateIdx + subIdx) % 2 === 0 || subIdx === 0) {
          createdStudents.forEach((student, sIdx) => {
            // Determine status: Alex Morgan has ~85% attendance
            let status = 'Present';
            if (student.rollNumber === 'CS2024-001') {
              // Alex Morgan is absent only on dateIdx 2 and 7 for subj 2
              if (dateIdx === 2 && subIdx === 1) status = 'Absent';
              else if (dateIdx === 7 && subIdx === 2) status = 'Absent';
              else if (dateIdx === 4 && subIdx === 0) status = 'Late';
            } else {
              // Deterministic variation for other students
              const seedVal = (sIdx * 7 + dateIdx * 13 + subIdx * 19) % 100;
              if (sIdx === 3 || sIdx === 7) {
                // Low attendance students (defaulter demonstration)
                status = seedVal < 55 ? 'Absent' : 'Present';
              } else if (seedVal < 15) {
                status = 'Absent';
              } else if (seedVal < 25) {
                status = 'Late';
              } else {
                status = 'Present';
              }
            }

            attendanceToInsert.push({
              student: student._id,
              teacher: teachersMap[subj._id.toString()],
              subject: subj._id,
              class: classA._id,
              date: dateStr,
              status,
              remarks: status === 'Absent' ? 'Unexcused Absence' : (status === 'Late' ? 'Late by 10 mins' : ''),
            });
          });
        }
      });
    });

    await Attendance.insertMany(attendanceToInsert);

    console.log(`✅ Database seeding completed successfully!`);
    console.log(`-----------------------------------------------`);
    console.log(`📋 SUMMARY OF SEEDED DATA:`);
    console.log(` - Admin User:       admin@college.com    (PW: Admin123)`);
    console.log(` - Main Teacher:     teacher@college.com  (PW: Teacher123)`);
    console.log(` - Second Teacher:   robert@college.com   (PW: Teacher123)`);
    console.log(` - Main Student:     student@college.com  (PW: Student123)`);
    console.log(` - Total Students:   ${createdStudents.length}`);
    console.log(` - Total Classes:    2 (${classA.code}, ${classB.code})`);
    console.log(` - Total Subjects:   4 (${subjects.map((s) => s.code).join(', ')})`);
    console.log(` - Attendance Recs:  ${attendanceToInsert.length} across ${dates.length} dates`);
    console.log(`-----------------------------------------------`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
