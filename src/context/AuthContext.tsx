import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import { DecodedToken } from "../types";

declare global {
  interface Window {
    API_URL: string;
  }
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

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
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (!storedToken) {
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(storedToken);

      if (decodedToken.exp * 1000 < Date.now()) {
        logout();
      } else {
        setToken(storedToken);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Invalid token found in storage:", error);
      logout();
    }
  }, [logout]);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsLoggedIn(true);
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
