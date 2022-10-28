const logger = require("../logger/logger");
const services = require("../services/postService");
const helpers = require("../config/helper");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

module.exports = {
  //create deposit and redirect it to profile to show changes
  createPost: (req, res) => {
    let upload = multer({
      storage: storage,
      fileFilter: helpers.imageFilter,
    }).single("file");

    upload(req, res, async function (err) {
      // req.file contains information of uploaded file
      // req.body contains information of text fields, if there were any
      if (req.fileValidationError) {
        return res.send(req.fileValidationError);
      } else if (!req.file) {
        return res.send("Please select an image to upload");
      } else if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      }
      console.log("File path: ", req.file.path);
      const body = req.body;
      console.log(req.body)
      await services.createPost(body.postName, body.description, body.userId, req.file.path, body.price);
      logger.info('Post created');
      res.redirect("/");

    });


  },
  getUserPosts: async (req, res) => {
    const body = req.body;
    let data = await services.getUserPosts(body.id);
    logger.info('Get User Posts');
    return res.status(201).json({
      success: 1,
      data: data,
    });
  },

  deletePost: async (req, res) => {
    const body = req.body;
    let data = await services.deletePost(body.postId);
    logger.info('Deleted Post');
    return res.redirect('/profile');
    
  },

  updatePost: async (req, res) => {
    const body = req.body;
    let data = await services.updatePost(body.postId, body.postName, body.description, body.price);
    logger.info('Updated Post');
    return res.redirect('/profile');
    
  },

  showPosts: async (req, res) => {
    const body = req.body;
    let posts = await services.showPosts(body.postName);
    logger.info('Searched For Posts');
    return res.render("showPosts", {
      userId: body.userId,
      posts: posts,
    });
    
  },

};