const User= require('../models/users');
const passport= require('passport');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');


module.exports.home = function(req,res){
    res.render('home');
}

module.exports.signIn= function(req,res){

    if(req.user)
      return res.redirect('/');

    res.render('signin');
}

module.exports.signUp = function (req, res) {
  
    if (req.user) 
        return res.redirect("/");

    res.render("signup");
};


module.exports.reset = function(req,res)
{
  res.render('reset');
}

module.exports.forgot = function(req,res)
{
  res.render('forgot');
}

//POST SIGNUP CONTROLLER...PASSWORDS WILL BE HASHED BEFORE GETTING SAVED IN DB BY BCRYPT
module.exports.usersCreate = function (req, res) {
  if (req.body.password != req.body.confirm_password) {
    req.flash('error', "Password and Confirm Password are not matching.")
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("Error Found!");
      return;
    }

      if (!user) {
        User.create(req.body, function (err, createdUser) {
        if (err) {
          console.log("Error Found!");
          return;
        }

        bcrypt.genSalt(10, function (err, salt) {
          if (err) return next(err);
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) return next(err);
            createdUser.password = hash; 
            createdUser.save(function (err, saved) {

              if (!err) {
                req.flash("success","Hi "+ createdUser.name+"! You now have access to application. Enjoy!!");
                passport.authenticate("local")(req, res, function () {
                  res.redirect('/');
                });
              }

            });
          });
        }); 

      });

    } else {
      req.flash("error", "User with this email already exists");
      return res.redirect("back");
    }
  });

};


//RESET PASSWORD AFTER SIGNIN CONTROLLER
module.exports.resetPassword = function(req,res)
{
  bcrypt.compare(req.body.old_password, req.user.password, function (err, result) {
    if (err) 
    {
      console.log("Error found: ", err);
      return;
    }

    if (result === false) {
      req.flash("error", "Old Password you entered didn't matched with password saved in database.")
      return res.redirect('back');
    }

    if(req.body.new_password === req.body.confirm_new_password)
    {      
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(req.body.new_password, salt, function (err, hash) {
          if (err) return next(err);
          req.user.password = hash;
          req.user.save(function (err, saved) {

            if (!err) {
              req.flash("success","Password has been successfully changed.")
              return res.redirect('/')
            }

          });
        });
      }); 
    }
    else
    {
      req.flash("error","New Password and Confirm New Passwords didn't matched");
      return res.redirect('back');
    }

  });
}

//POST SIGNIN CONTROLLER
module.exports.createSession = function (req, res) {
  res.redirect("/");
};

//SIGNOUT CONTROLLER
module.exports.destroySession = function (req, res) {
  req.flash("success", "You have been successfully signed out!");
  req.logout();
  res.redirect("/signin");
};
