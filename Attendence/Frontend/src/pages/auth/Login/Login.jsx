import React, { useEffect, useState } from "react";
import "./Login.css";
import google from "../../../assets/google.png";
import LoginGif from "../../../assets/Calendar-light.gif";
import LoginDark from "../../../assets/Calendar-dark.gif"
import apiHost from "../../../components/utils/api";

function Login() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const preferredTheme = localStorage.getItem("preferredTheme") || "light";
    setTheme(preferredTheme);
  }, []);

  const handleGoogleLogin = () => {
    window.location.href = `${apiHost}/auth/google`;
  };

  return (
    <div
      className="total-login-page"
      style={{
        backgroundColor: theme === "dark" ? "#1e2631" : "#f4f6fa", 
        color: theme === "dark" ? "#fff" : "#000",
      }}
    >
      <div className="login-card" style={{
        backgroundColor: theme === "dark" ? "#2a3645" : "#ffffff", 
        color: theme === "dark" ? "#fff" : "#000",
      }}>

        {theme === 'dark'? (<img src={LoginDark} alt="Login Image" className="login-image" />)
        :(<img src={LoginGif} alt="Login Image" className="login-image" />)

        }
        <button className={`signin-button ${theme}`} onClick={handleGoogleLogin} 
        style={{
          backgroundColor: theme === "dark" ? "#1e2631" : "#f4f6fa", 
          color: theme === "dark" ? "#fff" : "#000",
        }}
        >
          <img src={google} alt="GoogleImage" className="google-logo"   
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
