import axios from "axios";
import apiHost from "./api";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js"; 

const requestApi = async (method, url, data) => {
  const secretKey = "secretKey123"; 
  
  try {
    const encryptedToken = Cookies.get("token");
    let token = null;
    
    if (encryptedToken) {
      token = CryptoJS.AES.decrypt(encryptedToken, secretKey).toString(CryptoJS.enc.Utf8);
    }
    
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let response;
    switch (method) {
      case "POST":
        response = await axios.post(apiHost + url, data, { headers });
        break;
      case "GET":
        response = await axios.get(apiHost + url, { headers });
        break;
      case "PUT":
        response = await axios.put(apiHost + url, data, { headers });
        break;
      case "DELETE":
        response = await axios.delete(apiHost + url, { headers });
        break;
      default:
        throw new Error(`Unsupported request method: ${method}`);
    }
    if (!response) {
      throw new Error("No response from the server");
    }

    return { success: true, data: response.data };
    
  } catch (error) {
    // Log error details for debugging
    console.error("Error in requestApi:", error);
    return { success: false, error: error.response ? error.response.data : error.message };
  }
};

export default requestApi;
