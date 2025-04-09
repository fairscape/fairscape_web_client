import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const TOKEN_EXPIRY_HOURS = 24;

// Define AuthContextType for TypeScript
export interface AuthContextType {
  isLoggedIn: boolean;
  isInitialized: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    if (!token) return false;
    try {
      await axios.get(`${API_URL}/rocrate?limit=1`, {
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

  const setupExpiryTimeout = useCallback(
    (expiryTime: Date) => {
      const now = new Date();
      const timeUntilExpiry = expiryTime.getTime() - now.getTime();

      if (timeUntilExpiry <= 0) {
        handleSessionExpired();
        return null;
      }

      return setTimeout(handleSessionExpired, timeUntilExpiry);
    },
    [handleSessionExpired]
  );

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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "token" && !e.newValue) {
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken, handleSessionExpired, setupExpiryTimeout]);

  const login = useCallback(
    (token: string) => {
      localStorage.setItem("token", token);
      const expiryTime = setTokenExpiry();
      setupExpiryTimeout(expiryTime);
      setIsLoggedIn(true);
    },
    [setupExpiryTimeout]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
  }, []);

  // Create the context value object
  const contextValue: AuthContextType = {
    isLoggedIn,
    isInitialized,
    login,
    logout,
  };

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Custom hook for consuming the context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
