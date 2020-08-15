const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt= require('bcryptjs');

const User = require("../models/users");

//authentication using passport
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    function (email, password, done) {
      User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect email." });
        }

        bcrypt.compare(password, user.password, function (err, res) {
          if (err) return done(err);

          if (res === false) {
            return done(null, false, { message: "Password is wrong or maybe you have signed in with google previously." });
          } 

          return done(null, user, {message: "Welcome Back "+user.name});

        });
      });
    }
  )
);

//Serializing the user to decide which key is to be kept in cookies
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

//Deserializing the user fro key in cookies.
passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    if (err) {
      console.log("Some Error");
      return done(err);
    }

    return done(null, user);
  });
});

passport.checkAuthentication = function (req, res, next) {
  // if the user is signed in, then pass on the request to the next function(controller's action)
  if (req.isAuthenticated()) return next();

  // if the user is not signed in
  return res.redirect("/signin");
};

passport.setAuthenticatedUser = function (req, res, next) {
  // if req.user contains the current signedin  user from the session cookie and we are just fetching this to the locals
  //for view
  if (req.isAuthenticated()) {
    res.locals.user = req.user;
  }
  return next();
};

module.exports = passport;
