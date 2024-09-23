import axios from "axios";
import { getDecryptedCookie, removeEncryptedCookie } from "./encrypt"; 
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const apiHost = import.meta.env.VITE_API_HOST;

const requestApi = async (method, url, data) => {
  const token = getDecryptedCookie("token");
  const navigate = useNavigate(); 

  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };

  let response;

  if (method === "POST") {
    response = await axios.post(apiHost + url, data, { headers });
  } else if (method === "GET") {
    response = await axios.get(apiHost + url, { headers });
  } else if (method === "PUT") {
    response = await axios.put(apiHost + url, data, { headers });
  } else if (method === "DELETE") {
    response = await axios.delete(apiHost + url, { headers });
  } else {
    toast.error(`Unsupported request method: ${method}`);
    return { success: false, error: `Unsupported request method: ${method}` };
  }

  // Check the response for token validity
  if (response) {
    // Check for a specific error status indicating an expired token (e.g., 401)
    if (response.status === 401) {
      removeEncryptedCookie("token");
      navigate("/attendance/login");
      toast.error("Session expired. Please log in again.");
      return { success: false, error: "Session expired" };
    }
    return { success: true, data: response.data };
  } else {
    toast.error("No response from the server");
    return { success: false, error: "No response from the server" };
  }
};

export default requestApi;
