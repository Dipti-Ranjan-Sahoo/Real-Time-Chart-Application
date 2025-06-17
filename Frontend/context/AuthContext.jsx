import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // 🔐 Check auth on mount
  const checkAuth = async () => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      toast.error("Session expired. Please log in again.");
      logout();
    }
  };

  // 🔑 Login/Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        connectSocket(data.userData);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 🚪 Logout
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully.");
  };

  // 👤 Update Profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      setAuthUser(data.user);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // 📡 Connect Socket
  const connectSocket = (userData) => {
    if (!userData || (socket && socket.connected)) return;

    if (socket) socket.disconnect(); // disconnect previous socket

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.on("connect", () => {
      console.log("🔌 Socket connected");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
    });

    setSocket(newSocket);
  };

  // 🚀 Initial setup
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      checkAuth();
    }
  }, []);

  // 🌐 Context value
  return (
    <AuthContext.Provider
      value={{
        axios,
        token,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile,
        setAuthUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
