const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const { findUserByEmail } = require("../Controllers/auth/user");
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
        const user = await findUserByEmail(email);

        if (user) {
          return done(null, user);
        } else {
          return done(null, false, {
            message: "User not found in the database",
          });
        }
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
    const user = await findUserByEmail(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;
