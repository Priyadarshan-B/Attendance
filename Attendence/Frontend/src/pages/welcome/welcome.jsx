import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import Loader from "../../components/Loader/loader";

const Welcome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const dataParam = searchParams.get("data");

    if (dataParam) {
      try {
        const decodedData = decodeURIComponent(dataParam);
        const parsedData = JSON.parse(decodedData);
        const { token, name, role, roll, id, gmail } = parsedData;

        const secretKey = "secretKey123";
        const encryptedToken = CryptoJS.AES.encrypt(token, secretKey).toString();
        const encryptedName = CryptoJS.AES.encrypt(name, secretKey).toString();
        const encryptedRole = CryptoJS.AES.encrypt(role.toString(), secretKey).toString();
        const encryptedRoll = CryptoJS.AES.encrypt(roll, secretKey).toString();
        const encryptedId = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
        const encryptedGmail = CryptoJS.AES.encrypt(gmail, secretKey).toString();

        Cookies.set("token", encryptedToken, { expires: 1 });
        Cookies.set("name", encryptedName);
        Cookies.set("role", encryptedRole);
        Cookies.set("id", encryptedId);
        Cookies.set("roll", encryptedRoll);
        Cookies.set("gmail", encryptedGmail);

        const roleCookie = Cookies.get("role");
        const gmailCookie = Cookies.get("gmail")

        if (gmailCookie) {
          const decryptedRoleBytes = CryptoJS.AES.decrypt(roleCookie, secretKey);
          const decryptedRole = decryptedRoleBytes.toString(CryptoJS.enc.Utf8);
          const roleInt = parseInt(decryptedRole, 10);

          const decryptGmail = CryptoJS.AES.decrypt(gmailCookie, secretKey)
          const decryptedGmail = decryptGmail.toString(CryptoJS.enc.Utf8)

          requestApi("GET", `/auth/resources?role=${roleInt}`)
            .then((response) => {
              const allowedRoutes = response.data.map((route) => route.path);

              setTimeout(() => { 
                if (roleInt === 1 && allowedRoutes.includes("/attendance/approval")) {
                  navigate("/attendance/approval");
                } else if (roleInt === 2 && allowedRoutes.includes("/attendance/dashboard")) {
                  navigate("/attendance/dashboard");
                } else if (roleInt === 3 && allowedRoutes.includes("/attendance/admin")) {
                  navigate("/attendance/admin");
                } else {
                  navigate("/attendance/role_attendance");
                }
              }, 500); 
            })
            .catch((error) => {
              console.error("Failed to fetch allowed routes", error);
              navigate("/attendance/error");
            });
        } else {
          console.error("Role cookie not found.");
          navigate("/attendance/error");
        }
      } catch (error) {
        console.error("Error decrypting or processing data:", error);

        Cookies.remove("token");
        Cookies.remove("name");
        Cookies.remove("role");
        Cookies.remove("id");
        Cookies.remove("gmail");

        navigate("/attendance/error");
      }
    }
  }, [searchParams, navigate]);

  return (
    <div>
      <Loader/>
    </div>
  );
};

export default Welcome;
