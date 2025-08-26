// src/services/authService.ts
import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  name: string;
  email: string;
  iss: string;
  sub: string;
  exp: number;
}

export class AuthService {
  private static TOKEN_KEY = "token";

  /**
   * Get the current auth token from localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Store auth token in localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Remove auth token from localStorage
   */
  static clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is currently logged in
   */
  static isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      // Check if token is expired
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  /**
   * Get decoded token data
   */
  static getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  /**
   * Get authorization headers for API requests
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Check if token is expired or will expire soon
   */
  static isTokenExpiringSoon(withinMinutes: number = 5): boolean {
    const decoded = this.getDecodedToken();
    if (!decoded) return true;

    const expirationTime = decoded.exp * 1000;
    const timeUntilExpiry = expirationTime - Date.now();
    return timeUntilExpiry < withinMinutes * 60 * 1000;
  }
}
