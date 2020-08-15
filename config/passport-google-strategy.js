const passport = require("passport");
const googleStrategy = require("passport-google-oauth").OAuth2Strategy;
const User = require("../models/users");
const crypto = require("crypto");
var dotenv=require('dotenv');

dotenv.config();

//authenticating using google passport strategy
passport.use(
  new googleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },

    function (accessToken, refreshToken, profile, done) {
      User.findOne({ email: profile.emails[0].value }).exec(function (err,user) {
        if (err) {
          console.log("error in google strategy-passport", err);
          return;
        }

        console.log(profile);

        if (user) return done(null, user, {message: "Welcome Back "+user.name});
        else {
          User.create(
            {
              name: profile.displayName,
              email: profile.emails[0].value,
              password: crypto.randomBytes(20).toString("hex"),
            },
            function (err, user) {
              if (err) {
                console.log("error in creating user google strategy-passport",err);
                return;
              }

              return done(null, user,{message: "Hi "+user.name+"! You now have access to application. Enjoy!!"});
            }
          );
        }
      });
    }
  )
);

module.exports = passport;
