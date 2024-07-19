import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Handle error or logout if the token is invalid
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
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
