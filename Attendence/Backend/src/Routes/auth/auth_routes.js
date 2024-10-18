const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const AuthApp = require("../../Controllers/auth/auth_app");
const router = express.Router();



router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback route
router.get("/google/callback", passport.authenticate("google", { failureRedirect: `${process.env.CLIENT_URL}/login` }), function(req, res) {
    req.user.token = generateToken(req.user, 600, req.user.name, req.user.register_number, req.user.role_id, req.user.id, req.user.gmail, req.user.profilePhoto);
    console.log("token:", req.user.token);
    const responseJson = {
      token: req.user.token,
      name: req.user.name,
      roll: req.user.register_number,
      role: req.user.role_id,
      id: req.user.id,
      gmail:req.user.gmail,
      profile:req.user.profilePhoto
    };
    console.log(responseJson)
    res.redirect(`${process.env.CLIENT_URL}/welcome?data=${encodeURIComponent(JSON.stringify(responseJson))}`);
});

const generateToken = (user, expiresIn, name, roll, role_id, id, gmail, profile) => {
    const JWT_SECRET = process.env.JWT_SECRET;
    return jwt.sign({ userId: user.id, name: name, roll: roll, role: role_id, id: id, gmail: gmail, profile:profile }, JWT_SECRET, { expiresIn: '24h' });
};

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
