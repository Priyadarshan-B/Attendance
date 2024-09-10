import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import requestApi from "../../components/utils/axios";
import Loader from "../../components/Loader/loader";

const Welcome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
          Cookies.set("name", CryptoJS.AES.encrypt(name, secretKey).toString(), { expires: 1 });
          Cookies.set("role", CryptoJS.AES.encrypt(role.toString(), secretKey).toString(), { expires: 1 });
          Cookies.set("id", CryptoJS.AES.encrypt(id.toString(), secretKey).toString(), { expires: 1 });
          Cookies.set("roll", CryptoJS.AES.encrypt(roll, secretKey).toString(), { expires: 1 });
          Cookies.set("gmail", CryptoJS.AES.encrypt(gmail, secretKey).toString(), { expires: 1 });
          Cookies.set("profile", CryptoJS.AES.encrypt(profile, secretKey).toString(), { expires: 1 });

          const cookiesToCheck = ["token", "name", "role", "id", "roll", "gmail", "profile"];
          const areCookiesSet = cookiesToCheck.every((key) => Cookies.get(key));

          if (!areCookiesSet) {
            throw new Error("One or more cookies were not set properly.");
          }

          const response = await requestApi("GET", `/auth/resources?role=${role}`);
          const routes = response.data.map(route => route.path);

          Cookies.set("allowedRoutes", CryptoJS.AES.encrypt(JSON.stringify(routes), secretKey).toString(), { expires: 1 });

          // Redirect to the first route in the allowedRoutes list
          const allowedRoutes = JSON.parse(CryptoJS.AES.decrypt(Cookies.get("allowedRoutes"), secretKey).toString(CryptoJS.enc.Utf8));
          const redirectPath = allowedRoutes.length > 0 ? allowedRoutes[0] : "/attendance/error";

          setTimeout(() => {
            navigate(redirectPath);
          }, 200);

        } catch (error) {
          console.error("Error processing data:", error);

          // Remove cookies on error
          const cookiesToRemove = ["token", "name", "role", "id", "roll", "gmail", "profile", "allowedRoutes"];
          cookiesToRemove.forEach((key) => Cookies.remove(key));

          navigate("/attendance/error");
        }
      } else {
        navigate("/attendance/error");
      }
    };

    fetchRoutes();
  }, [searchParams, navigate, secretKey]);

  return <Loader />;
};

export default Welcome;
