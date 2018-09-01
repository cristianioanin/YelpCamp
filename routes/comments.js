const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');

// NEW Route
router.get('/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) console.log(err);
    else res.render('comments/new', { campground: dbCampground });
  });
});

// CREATE Route
router.post('/', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) console.log(err);
        else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();

          dbCampground.comments.push(comment);
          dbCampground.save();

          res.redirect(`/campgrounds/${dbCampground._id}`);
        }
      });
    }
  });
});

// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;