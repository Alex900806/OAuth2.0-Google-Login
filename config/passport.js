const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const User = require("../models/user.module");
const bcrypt = require("bcrypt");

// 接收下面 passport 的 done 後執行的函數
// 會將 req.isAuthenticated 設定為 True
passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  // 這個 user._id 會存在 session，然後簽名後用 cookies 傳給使用者
  done(null, user._id);
});

// 將 session 內部的 id 跟資料庫做比對
passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("找到使用者了");
    // deserializeUser 會自動將 req.user 設定為 user
    done(null, user);
  });
});

//本地登入
passport.use(
  //資料庫的name名稱(username, password)
  new LocalStrategy((username, password, done) => {
    // console.log(username, password);
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        }
        await bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            return done(null, false);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        console.log(err);
        return done(null, false);
      });
  })
);

//Google登入
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.Google_Client_ID,
      clientSecret: process.env.Google_Client_Secret,
      //最終導向的地方（要事先在google cloud那邊申請）
      callbackURL: "/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      //passport callback
      // console.log(profile);

      //儲存使用者資料
      User.findOne({ googleID: profile.id }).then((foundUser) => {
        if (foundUser) {
          done(null, foundUser);
          console.log("使用者已存在");
        } else {
          new User({
            name: profile.displayName,
            googleID: profile.id,
            thumbnail: profile.photos[0].value,
            email: profile.emails[0].value,
          })
            .save()
            .then((newUser) => {
              done(null, newUser);
              console.log("使用者已儲存");
            })
            .catch((err) => {
              console.log("ERROR :" + err);
            });
        }
      });
    }
  )
);
