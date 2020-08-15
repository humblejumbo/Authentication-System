const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/auth-system");

//MAKING THE CONNECTION TO DATABASE

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

module.exports = db;
