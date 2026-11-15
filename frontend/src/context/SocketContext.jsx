import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const listenersRef = useRef(new Set());

  useEffect(() => {
    // Only connect if user is logged in
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('⚡ Connected to Real-time Socket.IO server:', newSocket.id);
      setIsConnected(true);

      // Join user role channel
      newSocket.emit('join_role', user.role);

      // If student, join student personal channel and class channel
      if (user.role === 'student' && user.studentProfile) {
        const studentId = user.studentProfile._id || user.studentProfile;
        newSocket.emit('join_student', studentId);

        const classId = user.studentProfile.class?._id || user.studentProfile.class;
        if (classId) {
          newSocket.emit('join_class', classId);
        }
      }
    });

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      setIsConnected(false);
    });

    // Attendance update broadcast for Admin and Teachers
    newSocket.on('attendance_updated', (data) => {
      console.log('Realtime attendance update received:', data);
      toast.success(
        `⚡ Live Update: Attendance saved for ${data.className || 'Class'} (${data.count || ''} students)`,
        { duration: 4000, icon: '📋' }
      );
      // Trigger all registered components to refresh data
      listenersRef.current.forEach((callback) => callback(data));
    });

    // Personal notification for Students
    newSocket.on('personal_attendance_update', (data) => {
      console.log('Personal attendance alert:', data);
      const isPresent = data.status === 'Present';
      toast(
        `🎓 Live Attendance: You were marked ${data.status} for ${data.date}`,
        {
          duration: 5000,
          icon: isPresent ? '✅' : '⚠️',
          style: {
            border: isPresent ? '1px solid #10b981' : '1px solid #ef4444',
            background: isPresent ? '#ecfdf5' : '#fef2f2',
            color: isPresent ? '#065f46' : '#991b1b',
            fontWeight: 600,
          },
        }
      );
      // Trigger refresh
      listenersRef.current.forEach((callback) => callback(data));
    });

    newSocket.on('global_attendance_update', (data) => {
      listenersRef.current.forEach((callback) => callback(data));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?.role, user?._id]);

  const subscribeToUpdates = (callback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, subscribeToUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
