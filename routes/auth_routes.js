const router = require("express").Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/user.module");

//登入相關
router.get("/login", (req, res) => {
  res.render("login.ejs", { user: req.user });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "錯誤的Email或是密碼",
  }),
  (req, res) => {
    // console.log("成功登入");
    if (req.session.returnTo) {
      let newPath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newPath);
    } else {
      res.redirect("/profile");
    }
  }
);

//註冊相關
router.get("/signUp", (req, res) => {
  res.render("signUp.ejs", { user: req.user });
});

router.post("/signUp", async (req, res, next) => {
  let { name, email, password } = req.body;
  const emailExist = await User.findOne({ email: email });
  if (emailExist) {
    req.flash("error_msg", "電子郵件已經被註冊過了");
    return res.redirect("/auth/signUp");
  } else {
    const hash = await bcrypt.hash(password, 10);
    password = hash;
    let newUser = new User({ name, email, password });
    try {
      await newUser.save();
      req.flash("success_msg", "帳號註冊成功");
      return res.redirect("/auth/login");
    } catch (err) {
      req.flash("error_msg", err.errors.name.properties.message);
      return res.redirect("/auth/signUp");
    }
  }
});

//登出相關
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//Oauth2.0設定
router.get(
  "/google",
  //會使用 GoogleStrategy 來檢查
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newPath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newPath);
  } else {
    res.redirect("/profile");
  }
});

module.exports = router;
