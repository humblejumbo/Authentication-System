const express = require("express");
const passport= require('passport');
const router = express.Router();

//importing controllers
const homeController = require("../controllers/home_controller");
const forgotPassController = require("../controllers/forgot_password_controller");


//ROUTES

//HOME PAGE
router.get('/',passport.checkAuthentication,homeController.home);

//SIGNIN AND SIGNUP FORMS
router.get("/signin", homeController.signIn);
router.get('/signup',homeController.signUp);

//RESET PASSWORD FORM AFTER SIGNIN
router.get('/reset-password',passport.checkAuthentication,homeController.reset);

//FORGOT PASS FORM AND RESET FORM OPENED ON CLICKING LINK FROM MAIL
router.get('/forgot-password',homeController.forgot);
router.get('/forgot-reset-password/:token',forgotPassController.forgotResetForm);

//POST ROUTES
router.post('/create-user',homeController.usersCreate);
router.post('/create-session', passport.authenticate(
    'local',{
        failureRedirect:'/signin',
        failureFlash: true,
        successFlash: true
    }),homeController.createSession
);

router.post("/signout", homeController.destroySession);


router.post('/reset-password',homeController.resetPassword);
router.post('/forgot-password',forgotPassController.forgotPassword);
router.post('/forgot-reset-password/:token',forgotPassController.forgotResetPassword);


//GOOGLE AUTHENTICATION
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/signin",
    failureFlash: "Some Error Occured while signing in with google.",
    successFlash:true
  }),
  homeController.createSession
);


module.exports = router;