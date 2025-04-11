import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";
const TOKEN_EXPIRY_HOURS = 24;

// Define the AuthContext type
interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create context with a default value
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  token: null,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const validateToken = useCallback(
    async (tokenValue: string): Promise<boolean> => {
      if (!tokenValue) return false;
      try {
        await axios.get(`${API_URL}/rocrate`, {
          headers: { Authorization: `Bearer ${tokenValue}` },
        });
        return true;
      } catch (error) {
        console.error("Token validation error:", error);
        return false;
      }
    },
    []
  );

  const handleSessionExpired = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setToken(null);
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
      const storedToken = localStorage.getItem("token");
      const storedExpiry = localStorage.getItem("tokenExpiry");

      if (!storedToken || !storedExpiry) {
        setIsLoggedIn(false);
        setToken(null);
        setIsInitialized(true);
        return;
      }

      const expiryTime = new Date(storedExpiry);
      if (expiryTime <= new Date()) {
        handleSessionExpired();
        setIsInitialized(true);
        return;
      }

      const isValid = await validateToken(storedToken);
      if (!isValid) {
        handleSessionExpired();
        setIsInitialized(true);
        return;
      }

      setToken(storedToken);
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
        setToken(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [validateToken, handleSessionExpired, setupExpiryTimeout]);

  const login = useCallback(
    (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      const expiryTime = setTokenExpiry();
      setupExpiryTimeout(expiryTime);
      setIsLoggedIn(true);
    },
    [setupExpiryTimeout]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
