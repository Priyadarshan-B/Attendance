import React from "react";
import './auth/Login/Login.css'
import { Link } from "react-router-dom";
import error from "../assets/404.gif"

function Error() {
  return (
    <div className="error-page">
      <div className="error-card">
        
          <img src={error} alt="404" className="error-img"/>
        
        <p
          style={{
            margin: "0px",
            fontSize:'20px',
            color: "black",
            fontWeight: "700",
          }}
        >
          OOPS! PAGE NOT FOUND
        </p>
        <Link style={{ fontWeight: "800", fontSize:'20px', color:'#6883c8' }} to="attendance/login">
          BACK TO LOGIN
        </Link>
      </div>
    </div>
  );
}

export default Error;
