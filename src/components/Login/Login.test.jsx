// Login.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Login from "./LoginComponent";

const API_URL = "http://localhost:8080/api";
vi.mock("../../../vite.config.js", () => ({
  API_URL: "http://localhost:8080/api",
}));

// Mock useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Login Component", () => {
  // Reset all mocks and clear localStorage before each test
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // Helper function to render component with router
  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  describe("Initial Render", () => {
    it("renders login form with all elements", () => {
      renderLogin();

      // Check for form elements
      expect(
        screen.getByRole("heading", { name: /login/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Check input attributes
      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toBeRequired();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toBeRequired();

      // Check button
      const loginButton = screen.getByRole("button", { name: /login/i });
      expect(loginButton).toBeEnabled();
    });

    it("starts with empty form fields", () => {
      renderLogin();

      expect(screen.getByLabelText(/username/i)).toHaveValue("");
      expect(screen.getByLabelText(/password/i)).toHaveValue("");
    });
  });

  describe("Form Interaction", () => {
    it("updates input values when typing", () => {
      renderLogin();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      fireEvent.change(usernameInput, { target: { value: "testuser" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(usernameInput).toHaveValue("testuser");
      expect(passwordInput).toHaveValue("password123");
    });
  });

  describe("Login Process", () => {
    it("handles successful login correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ access_token: "fake-token" }),
      });

      renderLogin();

      // Fill form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      // Submit form
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      // Verify API call
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/login`, {
          method: "POST",
          body: expect.any(FormData),
        });
      });

      // Verify successful login actions
      await waitFor(() => {
        expect(localStorage.getItem("token")).toBe("fake-token");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });

    it("handles login failure correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: "Invalid credentials" }),
      });

      renderLogin();

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "wronguser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpass" },
      });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      // Verify error handling
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles network errors correctly", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderLogin();

      // Fill and submit form
      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      // Verify error handling
      await waitFor(() => {
        expect(
          screen.getByText("An error occurred. Please try again.")
        ).toBeInTheDocument();
        expect(localStorage.getItem("token")).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
