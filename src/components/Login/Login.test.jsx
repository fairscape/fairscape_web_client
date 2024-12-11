import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
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

// Mock login function
const mockLogin = vi.fn();

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  describe("Initial Render", () => {
    it("renders login form with all elements", () => {
      renderLogin();

      expect(
        screen.getByRole("heading", { name: /login/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toBeRequired();

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toBeRequired();

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

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });

      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(`${API_URL}/login`, {
          method: "POST",
          body: expect.any(FormData),
        });
      });

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith("fake-token");
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

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "wronguser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpass" },
      });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    it("handles network errors correctly", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderLogin();

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: "testuser" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(
          screen.getByText("An error occurred. Please try again.")
        ).toBeInTheDocument();
        expect(mockLogin).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });
});
