import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import { decryptData } from "./encrypt"; 
import Loader from "../Loader/loader";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const basePath = import.meta.env.VITE_BASE_PATH;
  const secretKey = import.meta.env.VITE_ENCRYPT_KEY; 

  useEffect(() => {
    const checkAuth = () => {
      const encryptedPaths = localStorage.getItem("D!!"); 
      const encryptedData = localStorage.getItem("D!");

      if (!encryptedData || !encryptedPaths) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const decryptedData = decryptData(encryptedData);
        const { role: userRole, token } = decryptedData;

        if (!token || !userRole) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const bytes = CryptoJS.AES.decrypt(encryptedPaths, secretKey);
        const decryptedPaths = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        
        const currentPath = window.location.pathname.replace(basePath, "");

        if (decryptedPaths[userRole] && decryptedPaths[userRole].includes(currentPath)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error decrypting data:", error);
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [basePath]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/attendance/error");  
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;






// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { getDecryptedCookie } from "./encrypt"; 
// import Loader from "../Loader/loader";

// const ProtectedRoute = ({ children }) => {
//   const navigate = useNavigate();
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
  
//   const basePath = import.meta.env.VITE_BASE_PATH;

//   useEffect(() => {
//     const checkAuth = () => {
//       const token = getDecryptedCookie("token"); 
//       const allowedRoutes = getDecryptedCookie("allowedRoutes");  
//       const currentPath = window.location.pathname;
//       if (token && allowedRoutes) {
//         const adjustedCurrentPath = currentPath.replace(basePath, ""); 

//         if (allowedRoutes.includes(adjustedCurrentPath)) {
//           setIsAuthenticated(true);  
//         } else {
//           setIsAuthenticated(false);  
//         }
//       } else {
//         setIsAuthenticated(false);  
//       }
//       setIsLoading(false);  
//     };

//     checkAuth();
//   }, [basePath]);

//   useEffect(() => {
//     if (!isLoading && !isAuthenticated) {
//       navigate("/attendance/error");  
//     }
//   }, [isLoading, isAuthenticated, navigate]);

//   if (isLoading) {
//     return <Loader />; 
//   }

//   return isAuthenticated ? children : null; 
// };

// export default ProtectedRoute;
