const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  //Google登入
  name: {
    type: String,
    require: true,
    minLength: 2,
    maxLength: 15,
  },
  googleID: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  email: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },

  //本地登入
  email: {
    type: String,
  },
  password: {
    type: String,
    minLength: 6,
    maxLength: 1024,
  },
});

module.exports = mongoose.model("User", userSchema);
