const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const connection = require('./database');
const path = require("path");
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
        const email = profile.emails[0].value;
        const profilePhoto = profile.photos[0]?.value;

        const mentorQuery = "SELECT id, name, gmail, role_id FROM mentor WHERE gmail = ?";
        connection.query(mentorQuery, [email], (error, results) => {
          if (error) {
            return done(error);
          }

          if (results.length > 0) {
            const user = { ...results[0], profilePhoto };
            return done(null, user);
          } else {
            const studentQuery = "SELECT id, name, gmail, register_number, role_id FROM students WHERE gmail = ?";
            connection.query(studentQuery, [email], (error, results) => {
              if (error) {
                return done(error);
              }

              if (results.length > 0) {
                const user = { ...results[0], profilePhoto };
                return done(null, user);
              } else {
                return done(null, false, { message: "User not found" });
              }
            });
          }
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  connection.query(
    "SELECT id, name, gmail, role_id FROM mentor WHERE id = ? UNION SELECT id, name, gmail, register_number, role_id FROM students WHERE id = ?",
    [id, id],
    (error, results) => {
      if (error) {
        return done(error);
      }

      if (results.length > 0) {
        return done(null, results[0]);
      } else {
        return done(null, false);
      }
    }
  );
});

module.exports = passport;
