import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { getDecryptedCookie , removeEncryptedCookie} from "./encrypt"; 
import Loader from "../Loader/loader";

const ProtectedRoute = ({ children }) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
  
    useEffect(() => {
      const checkAuth = () => {
        const token = getDecryptedCookie("token");
        const allowedRoutes = getDecryptedCookie("allowedRoutes");
  
        if (token && allowedRoutes) {
          const currentPath = window.location.pathname;
  
          if (allowedRoutes.includes(currentPath)) {
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
    }, []);
  
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        const cookiesToRemove = ["token", "name", "role", "id", "roll", "gmail", "profile", "allowedRoutes"];
            cookiesToRemove.forEach((key) => removeEncryptedCookie(key));
        navigate("/attendance/error");
      }
    }, [isLoading, isAuthenticated, navigate]);
  
    if (isLoading) {
      return <Loader />;
    }
  
    return isAuthenticated ? children : null;
  };

  export default ProtectedRoute