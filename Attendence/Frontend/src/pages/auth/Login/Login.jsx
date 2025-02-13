import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import CryptoJS from "crypto-js";
import requestApi from "../../../components/utils/axios";
import axios from "axios";
import llogin from "../../../assets/Calendar-light.gif";
import dlogin from "../../../assets/Calendar-dark.gif";
import TopBar from "../../../components/applayout/TopBar";
import toast from "react-hot-toast";

const GoogleLoginButton = () => {
  const navigate = useNavigate();
const handleSuccess = async (credentialResponse) => {
  const tokenId = credentialResponse.credential;
  const secretKey = import.meta.env.VITE_ENCRYPT_KEY;
  const base = import.meta.env.VITE_BASE_PATH

  try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_HOST}/auth/google/callback`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenId}`,
        },
      }
    );

    if (res.status === 200) {
      const { d } = res.data;
      localStorage.setItem("D!", d);

      const bytes = CryptoJS.AES.decrypt(d, secretKey);
      const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      const resourceRes = await requestApi("POST", `/auth/resources`, {
        role: decryptedData.role,
      });

      if (resourceRes.success) {
        const resources = resourceRes.data;
        if (resources.length > 0) {
          const pathMap = new Map();
          resources.forEach((resource) => {
            const roleId = decryptedData.role;
            if (!pathMap.has(roleId)) {
              pathMap.set(roleId, []);
            }
            pathMap.get(roleId).push(resource.path); 
          });

          const pathObject = Object.fromEntries(pathMap);
          const encryptedPaths = CryptoJS.AES.encrypt(JSON.stringify(pathObject), secretKey).toString();
          localStorage.setItem("D!!", encryptedPaths);
          navigate(`${base}`+ resources[0].path);
        } else {
          toast.error("Unauthorized access")
          console.error("No path available in resources");
        }
      }
    } else {
      console.error("Login failed:", res.statusText);
    }
  } catch (error) {
    console.error("Error during Google login:", error);
  }
};
return (
  <GoogleLogin
    onSuccess={handleSuccess}
    onError={() => console.error("Login failed")}
    type="standard"  
      size="large" 
      theme="filled_white" 
      text="fuck" 
      shape="circle" 
      logo_alignment="left" 
  />
);
};

const  Login=()=> {
  const [themeGif, setThemeGif] = useState(llogin);

  useEffect(() => {
    const preferredTheme = localStorage.getItem("preferredTheme");
    setThemeGif(preferredTheme === "dark" ? dlogin : llogin);
  }, []);

  return (
    <div>
      <div style={{ display: 'none' }}><TopBar /></div>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
        <div className="total-login-page">
          <div className="login-card">
            <img src={themeGif} alt="login animation" className="login-gif" />
            <div className="google-login-button">
              <GoogleLoginButton />
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    </div>
    
  );
}

export default Login;
