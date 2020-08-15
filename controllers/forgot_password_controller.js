const User = require("../models/users");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const async = require('async');
const nodemailer = require("nodemailer");
var dotenv = require("dotenv");

dotenv.config();

//GENERATING A TOKEN WITH CRYPTO..ATTACHING IT TO USER WITH THE EXPIRY TIME..THEN SENDING THE MAIL TO USER
//CONTAINING THE LINK TO RESET PASSWORD
module.exports.forgotPassword = function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error", "No account with that email address exists.");
            return res.redirect("/forgot-password");
          }

          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 360000;  

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        var smtpTransport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "imsg895@gmail.com",
            pass: process.env.GMAILPASSWORD,
          },
        });
        var mailOptions = {
          to: user.email,
          from: "imsg895@gmail.com",
          subject: "Authentication System Password Reset",
          text:
            "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
            "Please click on the following link, or paste this into your browser to complete the process:\n\n" +

            "http://" + req.headers.host + "/forgot-reset-password/" + token + "\n\n" +

            "If you did not request this, please ignore this email and your password will remain unchanged.\n",
        };
        smtpTransport.sendMail(mailOptions, function (err) {
          req.flash("success","An e-mail has been sent to " + user.email + " with further instructions.");
          console.log("An e-mail has been sent");
          done(err, "done");
        });
      },
    ],
    function (err) {
      if (err) return next(err);
      res.redirect("/forgot-password");
    }
  );
};


//GETTING THE RESET PASSWORD FORM ..ONLY WHEN THE USER HAS VALID TOKEN
module.exports.forgotResetForm = function(req,res)
{
    User.findOne(
      {
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() },
      },
      function (err, user) {
        if (!user) {
          req.flash("error", "Password reset token is invalid or has expired.");
          //console.log(err);
          console.log("Password reset token is invalid");
          return res.redirect("/forgot-password");
        }
        console.log(user);
        res.render("forgot-reset", { token: req.params.token });
      }
    );
}

//RESETTING THE PASSWORD AND SENDING THE CONFIRMATION MAIL TO USER
module.exports.forgotResetPassword = function(req,res){
  async.waterfall([
    function(done) {

      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.new_password === req.body.confirm_new_password) {
           user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: "imsg895@gmail.com",
          pass: process.env.GMAILPASSWORD,
        },
      });
      var mailOptions = {
        to: user.email,
        from: 'imsg895@gmail.com',
        subject: 'Authentication System - Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        console.log("Success! Your password has been changed.");
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
}

