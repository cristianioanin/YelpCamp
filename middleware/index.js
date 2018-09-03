const Campground = require('../models/campground');
const Comment = require('../models/comment');

// Middleware
const middleware = {};

middleware.checkCampgroundOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Campground.findById(req.params.id, (err, dbCampground) => {
      if (err || dbCampground === null) {
        req.flash('error', 'Database Error: The requested resource was not found or does not exist');
        res.redirect('/campgrounds');
      } else {
        if (dbCampground.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'You are not authorized to access extended features over this specific resource');
          res.redirect('/campgrounds');
        }
      }
    });
  } else {
    req.flash('info', 'Log in to your user account or sign up to access that feature');
    res.redirect('/login');
  }
}

middleware.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, dbComment) => {
      if (err || dbComment === null) {
        req.flash('error', 'Database Error: The requested resource was not found or does not exist');
        res.redirect(`/campgrounds/${req.params.id}`);
      } else {
        if (dbComment.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'You are not authorized to access extended features over this specific resource');
          res.redirect('/campgrounds');
        }
      }
    });
  } else {
    req.flash('info', 'Log in to your user account or sign up to access that feature');
    res.redirect('/login');
  }
}

middleware.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('info', 'Log in to your user account or sign up to access that feature');
  res.redirect('/login');
}

module.exports = middleware;