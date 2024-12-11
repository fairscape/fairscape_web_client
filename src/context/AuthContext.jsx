import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const TOKEN_EXPIRY_HOURS = 24;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const validateToken = useCallback(async (token) => {
    if (!token) return false;
    try {
      await axios.get(`${API_URL}/rocrate`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      return false;
    }
  }, []);

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
    window.location.href = "/login";
  }, []);

  const setTokenExpiry = () => {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + TOKEN_EXPIRY_HOURS);
    localStorage.setItem("tokenExpiry", expiryTime.toISOString());
    return expiryTime;
  };

  const setupExpiryTimeout = (expiryTime) => {
    const now = new Date();
    const timeUntilExpiry = expiryTime.getTime() - now.getTime();

    if (timeUntilExpiry <= 0) {
      handleSessionExpired();
      return;
    }

    return setTimeout(handleSessionExpired, timeUntilExpiry);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const storedExpiry = localStorage.getItem("tokenExpiry");

      if (!token || !storedExpiry) {
        setIsLoggedIn(false);
        setIsInitialized(true);
        return;
      }

      const expiryTime = new Date(storedExpiry);
      if (expiryTime <= new Date()) {
        handleSessionExpired();
        setIsInitialized(true);
        return;
      }

      const isValid = await validateToken(token);
      if (!isValid) {
        handleSessionExpired();
        setIsInitialized(true);
        return;
      }

      setIsLoggedIn(true);
      const timeoutId = setupExpiryTimeout(expiryTime);
      setIsInitialized(true);

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === "token" && !e.newValue) {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken, handleSessionExpired]);

  const login = useCallback((token) => {
    localStorage.setItem("token", token);
    const expiryTime = setTokenExpiry();
    setupExpiryTimeout(expiryTime);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
