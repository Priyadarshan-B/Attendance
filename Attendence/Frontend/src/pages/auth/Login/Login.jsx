import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import google from "../../../assets/google.png";
import LoginGif from "../../../assets/Calendar-light.gif";
import LoginDark from "../../../assets/Calendar-dark.gif";
import TopBar from "../../../components/applayout/TopBar";

function Login() {
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    const preferredTheme = localStorage.getItem("preferredTheme") || "light";
    setTheme(preferredTheme);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_HOST}/auth/google`;
  };

  return (
    <div>
      <div style={{ display: 'none' }}><TopBar /></div>
      <div className="total-login-page">
        <div className="login-card">
          {theme === 'dark' ? (
            <img src={LoginDark} alt="Login Image" className="login-image" />
          ) : (
            <img src={LoginGif} alt="Login Image" className="login-image" />
          )}
          <button className="signin-button" onClick={handleGoogleLogin}>
            <img src={google} alt="GoogleImage" className="google-logo" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
