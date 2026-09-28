/**
 * SocketContext.tsx
 * Provides a real-time Socket.IO connection context to the entire app.
 * Automatically connects when a user logs in and disconnects on logout.
 * Used by proctoring, live monitoring, and exam terminal components.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Dynamic socket URL resolution for local dev, environment variables, and production domain
    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
      if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '');
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return 'http://localhost:5000';
      if (typeof window !== 'undefined' && window.location.origin) return window.location.origin;
      return 'http://localhost:5000';
    };

    const socketUrl = getSocketUrl();
    
    // Connect client using auto-recovery, timeout delays, and reconnect limitations
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      setConnected(true);
      loggerLog("Live network synced successfully.");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      loggerLog("Live network connection lost. Auto-reconnecting...", true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const loggerLog = (msg, isError = false) => {
    if (isError) {
      toast.error(msg, { id: "network-toast", duration: 4000 });
    } else {
      toast.success(msg, { id: "network-toast", duration: 2000 });
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
