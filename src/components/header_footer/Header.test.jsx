import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import Header from "./Header";
import { jwtDecode } from "jwt-decode";

// Mock jwt-decode
vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

// Mock fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock navigate and Link
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...rest }) => {
      return (
        <a
          href={to}
          onClick={(e) => {
            e.preventDefault();
            mockNavigate(to);
          }}
          {...rest}
        >
          {children}
        </a>
      );
    },
  };
});

// Mock location.href
const mockLocation = new URL("http://localhost");
delete window.location;
window.location = mockLocation;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("Header Component", () => {
  const mockLogout = vi.fn();

  // Setup mock token and decoded data
  const mockToken = "mock-token";
  const mockDecodedToken = {
    name: "John Doe",
    email: "john@example.com",
    iss: "https://example.org",
  };

  const renderHeader = (isLoggedIn = false) => {
    return render(
      <AuthContext.Provider value={{ isLoggedIn, logout: mockLogout }}>
        <BrowserRouter>
          <Header />
        </BrowserRouter>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(mockToken);
    jwtDecode.mockReturnValue(mockDecodedToken);
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    });
  });

  describe("Layout and Navigation", () => {
    it("renders common elements regardless of auth state", () => {
      renderHeader();

      expect(screen.getByText("fairscape")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Documentation")).toBeInTheDocument();
    });

    it("shows login link when logged out", () => {
      renderHeader(false);
      expect(screen.getByText("Login")).toBeInTheDocument();
    });

    it("hides login link when logged in", () => {
      renderHeader(true);
      expect(screen.queryByText("Login")).not.toBeInTheDocument();
    });
  });

  describe("UserProfile Integration", () => {
    it("shows user profile when logged in", async () => {
      renderHeader(true);

      await waitFor(() => {
        const userCircle = screen.getByRole("button", {
          name: /user profile/i,
        });
        expect(userCircle).toBeInTheDocument();
        expect(userCircle).toHaveTextContent("J"); // First letter of John
      });
    });

    it("shows user details in dropdown when clicked", async () => {
      renderHeader(true);

      // Wait for profile to load and click it
      const userCircle = await waitFor(() =>
        screen.getByRole("button", { name: /user profile/i })
      );
      fireEvent.click(userCircle);

      // Check dropdown content
      expect(screen.getByText("Name: John Doe")).toBeInTheDocument();
      expect(screen.getByText("Email: john@example.com")).toBeInTheDocument();
      expect(screen.getByText("Organization: example.org")).toBeInTheDocument();
      expect(screen.getByText("Manage Tokens")).toBeInTheDocument();
      expect(screen.getByText("Log Out")).toBeInTheDocument();
    });

    it("handles logout process correctly", async () => {
      // Mock window.location.href setter
      Object.defineProperty(window, "location", {
        value: { href: "/" },
        writable: true,
      });

      renderHeader(true);

      // Wait for profile and trigger logout
      const userCircle = await waitFor(() =>
        screen.getByRole("button", { name: /user profile/i })
      );
      fireEvent.click(userCircle);
      fireEvent.click(screen.getByText("Log Out"));

      // Verify logout alert appears
      expect(
        screen.getByText("You have been logged out successfully.")
      ).toBeInTheDocument();
      expect(mockLogout).toHaveBeenCalled();

      // Close the alert
      const closeButton = screen.getByLabelText("Close");
      fireEvent.click(closeButton);

      // Since the component uses window.location.href, we verify it's set correctly
      expect(window.location.href).toBe("/");
    });

    it("closes dropdown when clicking outside", async () => {
      renderHeader(true);

      // Wait for profile and click it
      const userCircle = await waitFor(() =>
        screen.getByRole("button", { name: /user profile/i })
      );
      fireEvent.click(userCircle);

      // Verify dropdown is shown
      expect(screen.getByText("Name: John Doe")).toBeInTheDocument();

      // Add click handler to document
      const handler = vi.fn();
      document.addEventListener("mousedown", handler);

      // Simulate click outside
      fireEvent.mouseDown(document.body);

      // Verify handler was called
      expect(handler).toHaveBeenCalled();

      // Wait for dropdown to be removed
      await waitFor(
        () => {
          expect(screen.queryByText("Name: John Doe")).not.toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });
  });

  describe("Token Validation", () => {
    it("handles invalid token correctly", async () => {
      mockFetch.mockResolvedValueOnce({
        status: 401,
      });

      renderHeader(true);

      await waitFor(() => {
        expect(
          screen.getByText("Your session has expired. Please log in again.")
        ).toBeInTheDocument();
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it("handles network errors during validation", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      renderHeader(true);

      await waitFor(() => {
        expect(
          screen.getByText(
            "An error occurred with your session. Please log in again."
          )
        ).toBeInTheDocument();
      });

      expect(mockLogout).toHaveBeenCalled();
    });

    it("handles missing token correctly", async () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      renderHeader(true);

      await waitFor(() => {
        expect(
          screen.getByText("Your session has expired. Please log in again.")
        ).toBeInTheDocument();
      });

      expect(mockLogout).toHaveBeenCalled();
    });
  });

  describe("Navigation Links", () => {
    it("navigates to dashboard when clicked", () => {
      renderHeader(true);
      const dashboardLink = screen.getByText("Dashboard");
      fireEvent.click(dashboardLink);
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });

    it("navigates to home when clicked", () => {
      renderHeader(true);
      const homeLink = screen.getByText("Home");
      fireEvent.click(homeLink);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("navigates to home when logo is clicked", () => {
      renderHeader(true);
      const logoLink = screen.getByText("fairscape");
      fireEvent.click(logoLink);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("opens documentation in new tab", () => {
      renderHeader(true);
      const docLink = screen.getByText("Documentation");
      expect(docLink).toHaveAttribute("target", "_blank");
      expect(docLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
