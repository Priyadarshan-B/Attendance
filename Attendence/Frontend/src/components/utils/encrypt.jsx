import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

const secretKey = import.meta.env.VITE_ENCRYPT_KEY;

const hashName = (name) => {
  return CryptoJS.SHA256(name).toString(CryptoJS.enc.Hex);
};

export const encryptData = (data) => {
  try {
    const stringifiedData = JSON.stringify(data);  
    return CryptoJS.AES.encrypt(stringifiedData, secretKey).toString(); 
  } catch (error) {
    console.error("Encryption failed", error);
    return null;
  }
};

export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey); 
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8); 
    return JSON.parse(decryptedData);  
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
};

export const setEncryptedCookie = (key, value) => {
  try {
    const hashedKey = hashName(key);  
    const encryptedValue = encryptData(value);  
    if (encryptedValue) {
      Cookies.set(hashedKey, encryptedValue, { expires: 1 / 12 });  
    }
  } catch (error) {
    console.error("Failed to set encrypted cookie", error);
  }
};

export const getDecryptedCookie = (key) => {
  try {
    const hashedKey = hashName(key);  
    const encryptedValue = Cookies.get(hashedKey); 
    if (encryptedValue) {
      return decryptData(encryptedValue); 
    }
    return null;
  } catch (error) {
    console.error("Failed to get decrypted cookie", error);
    return null;
  }
};

export const removeEncryptedCookie = (key) => {
  try {
    const hashedKey = hashName(key); 
    Cookies.remove(hashedKey);  
  } catch (error) {
    console.error("Failed to remove encrypted cookie", error);
  }
};
