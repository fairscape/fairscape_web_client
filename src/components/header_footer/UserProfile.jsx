import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./UserProfile.css";

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    decodeUserToken();
  }, []);

  const decodeUserToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decodedToken = jwtDecode(token);
        setUser({
          givenName: decodedToken.name.split(" ")[0],
          surname: decodedToken.name.split(" ")[1],
          email: decodedToken.email,
          organization: decodedToken.iss
            .replace("https://", "")
            .replace("/", ""),
        });
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      handleLogout();
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
