let ioInstance = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log(`🔌 New client connected to Socket.IO: ${socket.id}`);

    // Join room based on user role or student/teacher ID
    socket.on('join_role', (role) => {
      socket.join(`role_${role}`);
      console.log(`Socket ${socket.id} joined role_${role}`);
    });

    socket.on('join_student', (studentId) => {
      socket.join(`student_${studentId}`);
      console.log(`Socket ${socket.id} joined student_${studentId}`);
    });

    socket.on('join_class', (classId) => {
      socket.join(`class_${classId}`);
      console.log(`Socket ${socket.id} joined class_${classId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized!');
  }
  return ioInstance;
};

// Real-time notification helper functions
const emitAttendanceUpdate = (data) => {
  if (ioInstance) {
    // Notify admin dashboard
    ioInstance.to('role_admin').emit('attendance_updated', data);

    // Notify teacher dashboard
    ioInstance.to('role_teacher').emit('attendance_updated', data);

    // If specific class
    if (data.classId) {
      ioInstance.to(`class_${data.classId}`).emit('class_attendance_updated', data);
    }

    // Broadcast globally as fallback
    ioInstance.emit('global_attendance_update', data);
  }
};

const emitStudentNotification = (studentId, data) => {
  if (ioInstance) {
    ioInstance.to(`student_${studentId}`).emit('personal_attendance_update', data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitAttendanceUpdate,
  emitStudentNotification,
};
