import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './auth/Login/Login.css';
import { Link } from "react-router-dom";
import error from "../assets/404-light.gif";
import error1 from "../assets/404-dark.gif";
import TopBar from "../components/applayout/TopBar";

function Error() {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const preferredTheme = localStorage.getItem("preferredTheme") || "light";
    setTheme(preferredTheme);
  }, []);

  // Function to handle navigation when user clicks on the "BACK TO LOGIN" text
  const handleNavigation = () => {
    navigate('/attendance/login');
  };

  return (
    <div>
      <div style={{ display: 'none' }}><TopBar /></div>
      <div className="error-page">
        <div className="error-card">
          {theme === 'dark' ? (
            <img src={error1} alt="404" className="error-img" />
          ) : (
            <img src={error} alt="404" className="error-img" />
          )}

          <p
            style={{
              margin: "0px",
              fontSize: '20px',
              color: "var(--text)",
              fontWeight: "700",
            }}
          >
            OOPS! PAGE NOT FOUND
          </p>
          <p 
            style={{ fontWeight: "800", fontSize: '20px', color: '#6883c8', cursor: 'pointer' }} 
            onClick={handleNavigation} 
          >
            BACK TO LOGIN
          </p>
        </div>
      </div>
    </div>
  );
}

export default Error;
