import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import Loader from "../../components/Loader/loader";

const Welcome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const secretKey = "secretKey123";

  useEffect(() => {
    const fetchRoutes = async () => {
      const dataParam = searchParams.get("data");

      if (dataParam) {
        try {
          const decodedData = decodeURIComponent(dataParam);
          const parsedData = JSON.parse(decodedData);
          const { token, name, role, roll, id, gmail, profile } = parsedData;

          Cookies.set("token", CryptoJS.AES.encrypt(token, secretKey).toString(), { expires: 1 });
          Cookies.set("name", CryptoJS.AES.encrypt(name, secretKey).toString());
          Cookies.set("role", CryptoJS.AES.encrypt(role.toString(), secretKey).toString());
          Cookies.set("id", CryptoJS.AES.encrypt(id.toString(), secretKey).toString());
          Cookies.set("roll", CryptoJS.AES.encrypt(roll, secretKey).toString());
          Cookies.set("gmail", CryptoJS.AES.encrypt(gmail, secretKey).toString());
          Cookies.set("profile", CryptoJS.AES.encrypt(profile, secretKey).toString());
          

          const response = await requestApi("GET", `/auth/resources?role=${role}`);
          const routes = response.data.map(route => route.path);

          Cookies.set("allowedRoutes", CryptoJS.AES.encrypt(JSON.stringify(routes), secretKey).toString(), { expires: 1 });

          let redirectPath = "/attendance/role_attendance"; 

          if (role === 1 && routes.includes("/attendance/mdashboard")) {
            redirectPath = "/attendance/mdashboard";
          } else if (role === 2 && routes.includes("/attendance/dashboard")) {
            redirectPath = "/attendance/dashboard";
          } else if (role === 3 && routes.includes("/attendance/student")) {
            redirectPath = "/attendance/student";
          }

          // Delay navigation to ensure cookies are set
          setTimeout(() => {
            navigate(redirectPath);
          }, 200);

        } catch (error) {
          console.error("Error processing data:", error);
          Cookies.remove("token");
          Cookies.remove("name");
          Cookies.remove("role");
          Cookies.remove("id");
          Cookies.remove("gmail");
          Cookies.remove("profile")
          navigate("/attendance/error");
        }
      } else {
        navigate("/attendance/error");
      }
    };

    fetchRoutes();
  }, [searchParams, navigate, secretKey]);

  if (loading) {
    return <Loader />;
  }

  return null; 
};

export default Welcome;
