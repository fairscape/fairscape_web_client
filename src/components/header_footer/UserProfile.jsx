import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./UserProfile.css";
import { AuthContext } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const UserProfile = ({ onLogout }) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateTokenAndDecodeUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout("Your session has expired. Please log in again.");
        return;
      }

      const response = await fetch(`${API_URL}/rocrate`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        handleLogout("Your session has expired. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token);
      setUser({
        givenName: decodedToken.name.split(" ")[0],
        surname: decodedToken.name.split(" ")[1],
        email: decodedToken.email,
        organization: decodedToken.iss.replace("https://", "").replace("/", ""),
      });
    } catch (error) {
      console.error("Error validating token:", error);
      handleLogout("An error occurred with your session. Please log in again.");
    }
  };

  useEffect(() => {
    validateTokenAndDecodeUser();
    const intervalId = setInterval(validateTokenAndDecodeUser, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = (message) => {
    setUser(null);
    setDropdownVisible(false);
    logout();
    onLogout(message);
  };

  const handleUserLogout = () => {
    handleLogout("You have been logged out successfully.");
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-circle" onClick={toggleDropdown}>
        {user.givenName.charAt(0)}
      </div>
      {dropdownVisible && (
        <div className="dropdown-menu">
          <p>
            Name: {user.givenName} {user.surname}
          </p>
          <p>Email: {user.email}</p>
          <p>Organization: {user.organization}</p>
          <Link to="/tokens" className="tokens-link">
            Manage Tokens
          </Link>
          <button className="logout-button" onClick={handleUserLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
