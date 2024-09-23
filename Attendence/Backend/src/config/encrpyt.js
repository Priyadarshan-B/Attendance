const CryptoJS = require("crypto-js");

const secretKey = process.env.ENCRYPTION_KEY;

const hashName = (name) => {
  return CryptoJS.SHA256(name).toString(CryptoJS.enc.Hex);
};

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
  try {
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error("Decryption failed", error);
    return null; 
  }
};

const setEncryptedCookie = (res, key, value) => {
  const hashedKey = hashName(key);
  const encryptedValue = encryptData(value);
  res.cookie(hashedKey, encryptedValue, {  maxAge: 1000 * 60 * 60 * 24 * 1 }); 
};

const getDecryptedCookie = (req, key) => {
  const hashedKey = hashName(key);
  const encryptedValue = req.cookies[hashedKey];
  if (encryptedValue) {
    return decryptData(encryptedValue);
  }
  return null;
};

const removeEncryptedCookie = (res, key) => {
  const hashedKey = hashName(key);
  res.clearCookie(hashedKey);
};

module.exports = {
  encryptData,
  decryptData,
  setEncryptedCookie,
  getDecryptedCookie,
  removeEncryptedCookie,
  hashName
};
