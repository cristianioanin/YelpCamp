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

// EDIT Route
router.get('/:comment_id/edit', checkCommentOwnership, (req, res) => {
  Comment.findById(req.params.comment_id, (err, dbComment) => {
    if (err) res.redirect('back');
    else {
      res.render('comments/edit', {
        campgroundId: req.params.id,
        comment: dbComment
      });
    }
  });
});

// UPDATE Route
router.put('/:comment_id', checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) res.redirect('back');
    else res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// DESTROY Route
router.delete('/:comment_id', checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) res.redirect('back');
    else res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, (err, dbComment) => {
      if (err) res.redirect('back');
      else {
        if (dbComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    });
  } else {
    res.redirect('back');
  }
}

module.exports = router;