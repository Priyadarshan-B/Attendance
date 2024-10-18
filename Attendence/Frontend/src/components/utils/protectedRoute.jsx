import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getDecryptedCookie, removeEncryptedCookie } from "./encrypt"; 
import Loader from "../Loader/loader";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const basePath = import.meta.env.VITE_BASE_PATH;

  useEffect(() => {
    const checkAuth = () => {
      const token = getDecryptedCookie("token"); 
      const allowedRoutes = getDecryptedCookie("allowedRoutes");  
      const currentPath = window.location.pathname;
      // console.log(currentPath)
      // console.log(currentPath.replace(basePath, ""))

      if (token && allowedRoutes) {
        const adjustedCurrentPath = currentPath.replace(basePath, ""); 
        // console.log(adjustedCurrentPath)

        if (allowedRoutes.includes(adjustedCurrentPath)) {
          setIsAuthenticated(true);  
        } else {
          setIsAuthenticated(false);  
        }
      } else {
        setIsAuthenticated(false);  
      }
      setIsLoading(false);  
    };

    checkAuth();
  }, [basePath]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // const cookiesToRemove = ["token", "name", "role", "id", "roll", "gmail", "profile", "allowedRoutes"];
      // cookiesToRemove.forEach((key) => removeEncryptedCookie(key));  
      navigate("/attendance/error");  
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <Loader />; 
  }

  return isAuthenticated ? children : null; 
};

export default ProtectedRoute;
