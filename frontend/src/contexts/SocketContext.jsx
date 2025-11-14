import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.log('No auth token found, skipping socket connection');
      return;
    }

    const API = import.meta.env.VITE_API_URI || 'http://localhost:5000';
    
    const socketInstance = io(API, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('Connected to socket server');
      setIsConnected(true);
      
      // Clear any connection notifications
      setNotifications(prev => prev.filter(n => n.type !== 'connection'));
      
      // Add connection success notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'success',
        message: 'Connected to chat server',
        timestamp: new Date()
      }]);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setIsConnected(false);
      
      // Add disconnection notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'warning',
        message: 'Disconnected from chat server',
        timestamp: new Date()
      }]);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      // Add error notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: 'Failed to connect to chat server',
        timestamp: new Date()
      }]);
    });

    // Message event handlers
    socketInstance.on('new_message', (message) => {
      console.log('New message received:', message);
      
      // Add notification
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'message',
        message: `New message from ${message.sender.firstName}`,
        timestamp: new Date(),
        data: message
      }]);
      
      // Custom event for components to listen to
      window.dispatchEvent(new CustomEvent('new-message', { detail: message }));
    });

    socketInstance.on('message_sent', (message) => {
      console.log('Message sent confirmation:', message);
      // Custom event for components to listen to
      window.dispatchEvent(new CustomEvent('message-sent', { detail: message }));
    });

    socketInstance.on('user_typing', (data) => {
      // Custom event for typing indicators
      window.dispatchEvent(new CustomEvent('user-typing', { detail: data }));
    });

    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'error',
        message: error.message || 'Socket error occurred',
        timestamp: new Date()
      }]);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.close();
    };
  }, []);

  // Join a listing room
  const joinListing = (listingId) => {
    if (socket && isConnected) {
      socket.emit('join_listing', listingId);
    }
  };

  // Leave a listing room
  const leaveListing = (listingId) => {
    if (socket && isConnected) {
      socket.emit('leave_listing', listingId);
    }
  };

  // Send a message
  const sendMessage = (listingId, receiverId, message) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        listingId,
        receiverId,
        message: message.trim()
      });
    }
  };

  // Send typing indicator
  const sendTyping = (listingId, receiverId) => {
    if (socket && isConnected) {
      socket.emit('typing', { listingId, receiverId });
    }
  };

  // Stop typing indicator
  const stopTyping = (listingId, receiverId) => {
    if (socket && isConnected) {
      socket.emit('stop_typing', { listingId, receiverId });
    }
  };

  // Remove notification
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    socket,
    isConnected,
    notifications,
    joinListing,
    leaveListing,
    sendMessage,
    sendTyping,
    stopTyping,
    removeNotification
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};