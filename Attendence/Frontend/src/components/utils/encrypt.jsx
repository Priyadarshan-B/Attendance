import CryptoJS from "crypto-js";
import Cookies from "js-cookie";

// Define your secret key for encryption
const secretKey = import.meta.env.VITE_ENCRYPT_KEY;

// Function to hash the name using SHA-256
const hashName = (name) => {
  return CryptoJS.SHA256(name).toString(CryptoJS.enc.Hex);
};

// Function to encrypt the value
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Function to decrypt the value
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

// Function to set an encrypted cookie with hashed name
export const setEncryptedCookie = (key, value) => {
  const hashedKey = hashName(key);   
  const encryptedValue = encryptData(value); 
  Cookies.set(hashedKey, encryptedValue);
};

// Function to get a decrypted cookie value using hashed name
export const getDecryptedCookie = (key) => {
  const hashedKey = hashName(key);
  const encryptedValue = Cookies.get(hashedKey); 
  if (encryptedValue) {
    return decryptData(encryptedValue); 
  }
  return null;
};

// Function to remove a cookie with hashed name
export const removeEncryptedCookie = (key) => {
  const hashedKey = hashName(key);
  Cookies.remove(hashedKey);
};
