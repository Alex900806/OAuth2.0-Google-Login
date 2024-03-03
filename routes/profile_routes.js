const router = require("express").Router();
const Post = require("../models/post.module");

//profile需要先認證過才能看
const authCheck = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    res.redirect("/auth/login");
  } else {
    next();
  }
};

//個人資料
router.get("/", authCheck, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile.ejs", { user: req.user, posts: postFound });
});

//貼文相關
router.get("/post", authCheck, (req, res) => {
  res.render("post.ejs", { user: req.user });
});

router.post("/post", authCheck, async (req, res) => {
  let { title, content } = req.body;
  let newPost = new Post({ title, content, author: req.user._id });
  try {
    await newPost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "請填寫標題和內容");
    res.redirect("/profile/post");
  }
});

module.exports = router;
