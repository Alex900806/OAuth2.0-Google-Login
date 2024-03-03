const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const LocalStrategy = require("passport-local");
const User = require("../models/user.module");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
  console.log("Serializing user now");
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  console.log("Deserializing user now");
  User.findById({ _id }).then((user) => {
    console.log("找到使用者了");
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
