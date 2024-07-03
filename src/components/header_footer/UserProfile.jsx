import React, { useState } from "react";
import "./UserProfile.css";

const UserProfile = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const user = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    projects: ["Project1", "Project2"],
  };

  const toggleDropdown = () => {
    console.log("Toggle dropdown");
    setDropdownVisible(!dropdownVisible);
    console.log(dropdownVisible);
  };

  return (
    <div className="user-profile">
      <div className="user-circle" onClick={toggleDropdown}>
        {user.firstName.charAt(0)}
      </div>
      {dropdownVisible && (
        <div className="dropdown-menu">
          <p>
            Name: {user.firstName} {user.lastName}
          </p>
          <p>Email: {user.email}</p>
          <p>Projects: {user.projects.join(", ")}</p>
          <button className="logout-button">Log Out</button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
