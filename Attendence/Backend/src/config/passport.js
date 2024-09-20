const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const connection = require('./database');
const {get_database} = require('./db_utils')
const path = require("path");
const {encryptData} = require('./encrpyt')
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.CALLBACK,
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // const encryptedAccessToken = encryptData(accessToken);
        // console.log("Encrypted Access Token:", encryptedAccessToken);
        const email = profile.emails[0].value;
        const profilePhoto = profile.photos[0]?.value;

        const mentorQuery = "SELECT id, name, gmail, role_id FROM mentor WHERE gmail = ?";
        let results = await get_database(mentorQuery, [email]);

        if (results.length > 0) {
          const user = { ...results[0], profilePhoto };
          return done(null, user);
        } 

        const studentQuery = "SELECT id, name, gmail, register_number, role_id FROM students WHERE gmail = ?";
        results = await get_database(studentQuery, [email]);

        if (results.length > 0) {
          const user = { ...results[0], profilePhoto };
          return done(null, user);
        } 

        return done(null, false, { message: "User not found" });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const query = `
      SELECT id, name, gmail, NULL AS register_number, role_id 
      FROM mentor 
      WHERE id = ? 
      UNION 
      SELECT id, name, gmail, register_number, role_id 
      FROM students 
      WHERE id = ?
    `;
    
    const results = await get_database(query, [id, id]);
    
    if (results.length > 0) {
      return done(null, results[0]);
    } else {
      return done(null, false);
    }
  } catch (error) {
    return done(error);
  }
});

module.exports = passport;