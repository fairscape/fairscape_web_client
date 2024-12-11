import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

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
      localStorage.removeItem("token");
      return false;
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const isValid = token ? await validateToken(token) : false;
      setIsLoggedIn(isValid);
      setIsInitialized(true);
    };

    checkAuth();

    const handleStorageChange = (e) => {
      if (e.key === "token") {
        setIsLoggedIn(!!e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken]);

  const login = useCallback((token) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
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
