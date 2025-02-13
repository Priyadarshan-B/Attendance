const express = require("express");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const path = require("path");
const { OAuth2Client } = require("google-auth-library");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const AuthApp = require("../../Controllers/auth/auth_app");
const router = express.Router();
const client = new OAuth2Client(process.env.CLIENT_ID);
const secretKey = process.env.ENCRYPTION_KEY;
const jwtSecret = process.env.JWT_SECRET;
const { findUserByEmail } = require("../../Controllers/auth/user");

const encrypt = (payload) => {
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(payload),
    secretKey
  ).toString();
  return encrypted;
};

router.post("/google/callback", async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(401).json({ error: "No token provided" });
  }
  const tokenId = authorization.split(" ")[1];
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, picture } = payload;

    const user = await findUserByEmail(email);
    if (user) {
      let tokenData = {
        name: user.name,
        gmail: user.gmail,
        profile: picture,
        role: user.role_id,
        roll: user.register_number || null,
        id: user.id,
      };
      const jwtToken = jwt.sign(
        { exp: Math.floor(Date.now() / 1000) + 60 * 60 },
        jwtSecret
      );

      tokenData.token = jwtToken;

      console.log("User data with JWT token:", tokenData);

      const encryptedToken = encrypt(tokenData);

      return res.status(200).json({
        message: "Login successful",
        d: encryptedToken,
      });
    } else {
      return res
        .status(401)
        .json({ message: "User not found in the database" });
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Error during logout" });
    }

    return res.status(200).json({ message: "Logout successful" });
  });
});

router.get("/auth-app", AuthApp.get_auth);

module.exports = router;
