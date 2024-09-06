import CryptoJS from "crypto-js";

// Secret key for encryption and decryption
const secretKey = "secretKey123";

// Function to encrypt data
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

// Function to decrypt data
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

// Function to set encrypted cookies
export const setEncryptedCookie = (key, value) => {
  const encryptedKey = encryptData(key);    // Encrypt the key
  const encryptedValue = encryptData(value); // Encrypt the value
  Cookies.set(encryptedKey, encryptedValue);
};

// Function to get decrypted cookies
export const getDecryptedCookie = (encryptedKey) => {
  const decryptedKey = decryptData(encryptedKey); // Decrypt the key
  const encryptedValue = Cookies.get(encryptedKey); // Get the encrypted value
  if (encryptedValue) {
    return decryptData(encryptedValue); // Decrypt the value
  }
  return null;
};

// Function to remove encrypted cookies
export const removeEncryptedCookie = (encryptedKey) => {
  Cookies.remove(encryptedKey); // Remove the cookie by encrypted key
};
