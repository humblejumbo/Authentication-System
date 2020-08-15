//dependencies
const express                   = require('express');
const app                       = express();
const port                      = 8080;
const db                        = require('./config/mongoose');
const flash                     = require('connect-flash');

//passport dependencies
const passport                  = require("passport");
const session                   = require("express-session");
const passportLocal             = require("./config/passport-local-strategy");
const MongoStore                = require("connect-mongo")(session);
const passportGoogle            = require("./config/passport-google-strategy");


//Middlewares of the above dependencies
app.use(express.urlencoded());
app.use(express.static("./assets"));

//storing the session
app.use(
  session({
    name: "auth-system",
    secret: "somethingrubbish",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 120,
    },
    store: new MongoStore(
      {
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);

//Messages will be passed to error and success that we can access in every page.
app.use(function (req, res, next) {
  
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//setting route
const indexRoutes = require("./routes/index");
app.use("/", indexRoutes);

//setting view engine to ejs and telling to look for views in views directory
app.set("view engine", "ejs");
app.set("views", "./views");


//server running on port 8080
app.listen(port, function (err) {
  if (err) console.log(`Error: ${err}`);

  console.log(`Server is running on: ${port}`);
});

