import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import Loader from "../../components/Loader/loader";
import requestApi from "../../components/utils/axios";

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

          // Set user data in cookies
          Cookies.set("token", CryptoJS.AES.encrypt(token, secretKey).toString(), { expires: 1 });
          Cookies.set("name", CryptoJS.AES.encrypt(name, secretKey).toString(), { expires: 1 });
          Cookies.set("role", CryptoJS.AES.encrypt(role.toString(), secretKey).toString(), { expires: 1 });
          Cookies.set("id", CryptoJS.AES.encrypt(id.toString(), secretKey).toString(), { expires: 1 });
          Cookies.set("roll", CryptoJS.AES.encrypt(roll, secretKey).toString(), { expires: 1 });
          Cookies.set("gmail", CryptoJS.AES.encrypt(gmail, secretKey).toString(), { expires: 1 });
          Cookies.set("profile", CryptoJS.AES.encrypt(profile, secretKey).toString(), { expires: 1 });

          // Ensure cookies are set
          const cookiesToCheck = ["token", "name", "role", "id", "roll", "gmail", "profile"];
          const areCookiesSet = cookiesToCheck.every((key) => Cookies.get(key));

          if (!areCookiesSet) {
            throw new Error("One or more cookies were not set properly.");
          }

          // Fetch routes from the API
          const decryptedRole = CryptoJS.AES.decrypt(Cookies.get("role"), secretKey).toString(CryptoJS.enc.Utf8);
          const response = await requestApi("GET", `/auth/resources?role=${decryptedRole}`);

          if (response && response.data) {
            const routes = response.data.map(route => route.path); // Extract the 'path' from the response

            // Encrypt and set the allowed routes in cookies
            Cookies.set("allowedRoutes", CryptoJS.AES.encrypt(JSON.stringify(routes), secretKey).toString(), { expires: 1 });

            // Redirect to the first route or error if no routes are available
            const redirectPath = routes.length > 0 ? routes[0] : "/attendance/error";
            setTimeout(() => {
              navigate(redirectPath);
            }, 200);
          } else {
            throw new Error("Failed to fetch routes from API");
          }

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
