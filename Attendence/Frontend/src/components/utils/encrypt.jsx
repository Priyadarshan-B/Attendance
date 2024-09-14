import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

const secretKey = import.meta.env.VITE_ENCRYPT_KEY;

const hashName = (name) => {
  return CryptoJS.SHA256(name).toString(CryptoJS.enc.Hex);
};

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

export const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption failed", error);
    return null;
  }
};

export const setEncryptedCookie = (key, value) => {
  const hashedKey = hashName(key);   
  const encryptedValue = encryptData(value); 
  Cookies.set(hashedKey, encryptedValue, { expires: 1 / 12 });
};

export const getDecryptedCookie = (key) => {
  const hashedKey = hashName(key);
  const encryptedValue = Cookies.get(hashedKey); 
  if (encryptedValue) {
    return decryptData(encryptedValue); 
  }
  return null;
};

export const removeEncryptedCookie = (key) => {
  const hashedKey = hashName(key);
  Cookies.remove(hashedKey);
};
