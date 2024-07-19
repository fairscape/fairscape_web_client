import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../header_footer/Header";
import "./Login.css";

const API_URL =
  import.meta.env.VITE_FAIRSCAPE_API_URL || "http://fairscape.net/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_URL}/login`, {
        // Fixed string interpolation
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (response.ok) {
        localStorage.setItem("token", responseData.access_token);
        console.log("Login successful, token stored");
        navigate("/"); // Redirect to home page after successful login
      } else {
        setError(responseData.message || "Login failed");
        console.error("Login failed:", responseData.message);
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
