import axios from "axios";
import CryptoJS from "crypto-js";

const apiHost = import.meta.env.VITE_API_HOST;
const secretKey = import.meta.env.VITE_ENCRYPT_KEY;

const requestApi = async (method, url, data, navigate) => {
  try {
    const encryptedToken = localStorage.getItem("D!");
    if (!encryptedToken) {
      navigate("/login");
      throw new Error("No auth token found. Please log in.");
    }

    // Decrypt token from localStorage
    const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (!decryptedData?.token) {
      throw new Error("Invalid or corrupted token data.");
    }

    // Prepare headers
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${decryptedData.token}`,
    };

    // Make API request
    let response;
    switch (method.toUpperCase()) {
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

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error in requestApi:", error);

    if (error.response?.status === 401) {
      navigate("/login");
    }

    return {
      success: false,
      error: error.response ? error.response.data : error.message,
    };
  }
};

export default requestApi;


// import axios from "axios";
// import { getDecryptedCookie } from "./encrypt";
// // import toast from "react-hot-toast";

// const apiHost = import.meta.env.VITE_API_HOST;

// const requestApi = async (method, url, data) => {

//   try {
//     const token = getDecryptedCookie("token");

//     const headers = {
//       "Content-Type": "application/json",
//       ...(token && { "Authorization": `Bearer ${token}` })
//     };

//     let response;
//     switch (method) {
//       case "POST":
//         response = await axios.post(apiHost + url, data, { headers });
//         break;
//       case "GET":
//         response = await axios.get(apiHost + url, { headers });
//         break;
//       case "PUT":
//         response = await axios.put(apiHost + url, data, { headers });
//         break;
//       case "DELETE":
//         response = await axios.delete(apiHost + url, { headers });
//         break;
//       default:
//         throw new Error(`Unsupported request method: ${method}`);
//     }

//     if (!response) {
//       throw new Error("No response from the server");
//     }
 
//     return { success: true, data: response.data };
//   } catch (error) {
//     // toast.error("Invalid Request..");
//     console.error("Error in requestApi:", error);
//     return { success: false, error: error.response ? error.response.data : error.message };
//   }
// };

// export default requestApi;