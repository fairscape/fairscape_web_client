import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./UserProfile.css";
import { AuthContext } from "../../context/AuthContext";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://localhost:8080/api";

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);
  const { setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    validateTokenAndDecodeUser();
  }, []);

  const validateTokenAndDecodeUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        handleLogout();
        return;
      }
      // First check if the token is valid via API
      const response = await fetch(`${API_URL}/profile/credentials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      // If we get here, token is valid, so decode it
      const decodedToken = jwtDecode(token);
      setUser({
        givenName: decodedToken.name.split(" ")[0],
        surname: decodedToken.name.split(" ")[1],
        email: decodedToken.email,
        organization: decodedToken.iss.replace("https://", "").replace("/", ""),
      });
    } catch (error) {
      console.error("Error validating token:", error);
      handleLogout();
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setDropdownVisible(false);
    setIsLoggedIn(false);
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
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
