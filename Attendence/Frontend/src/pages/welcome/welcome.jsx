import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Loader from "../../components/Loader/loader";
import { setEncryptedCookie, getDecryptedCookie, removeEncryptedCookie } from "../../components/utils/encrypt";
import requestApi from "../../components/utils/axios";

const Welcome = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const basePath = import.meta.env.VITE_BASE_PATH

  useEffect(() => {
    const fetchRoutes = async () => {
      const dataParam = searchParams.get("data");

      if (dataParam) {
        // console.log(dataParam)
        try {
          const parsedData = JSON.parse(dataParam);
          const { token, name, role, roll, id, gmail, profile } = parsedData;

          setEncryptedCookie("token", token);
          setEncryptedCookie("name", name);
          setEncryptedCookie("role", role.toString());
          setEncryptedCookie("id", id.toString());
          setEncryptedCookie("roll", roll || ""); 
          setEncryptedCookie("gmail", gmail);
          setEncryptedCookie("profile", profile); 

          const cookiesToCheck = ["token", "name", "role", "id", "roll", "gmail", "profile"];
          const areCookiesSet = cookiesToCheck.every((key) => getDecryptedCookie(key) !== null);

          if (!areCookiesSet) {
            throw new Error("One or more cookies were not set properly.");
          }
 
          const decryptedRole = getDecryptedCookie("role");
          const response = await requestApi("GET", `/auth/resources?role=${decryptedRole}`);

          if (response && response.data) {
            const routes = response.data.map(route => route.path); 
            setEncryptedCookie("allowedRoutes", JSON.stringify(routes));

            const redirectPath = routes.length > 0 ? `${basePath}${routes[0]}` : "/attendance/error";
            setTimeout(() => {
              navigate(redirectPath);
            }, 200);
          } else {
            throw new Error("Failed to fetch routes from API");
          }

        } catch (error) {
          console.error("Error processing data:", error);

          const cookiesToRemove = ["token", "name", "role", "id", "roll", "gmail", "profile", "allowedRoutes"];
          cookiesToRemove.forEach((key) => removeEncryptedCookie(key));

          navigate("/attendance/error");
        }
      } else {
        navigate("/attendance/error");
      }
    };

    fetchRoutes();
  }, [searchParams, navigate]);

  return <Loader />;
};

export default Welcome;
