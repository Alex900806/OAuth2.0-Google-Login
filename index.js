const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoute = require("./routes/auth_routes");
const profileRoute = require("./routes/profile_routes");
require("./config/passport");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");

//連接資料庫 (用 GCP Taiwan)
mongoose
  .connect(process.env.DB_Connect, {
    // 設置連接超時為30秒（可根據需要調整）
    connectTimeoutMS: 30000,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.log("連接錯誤： " + err);
  });

//middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.Secret,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  //passport專用
  res.locals.error = req.flash("error");
  next();
});
app.use("/auth", authRoute);
app.use("/profile", profileRoute);

//routing
app.get("/", (req, res) => {
  res.render("index.ejs", { user: req.user });
});

//Server port
app.listen("8080", () => {
  console.log("Server is running on port 8080");
});
