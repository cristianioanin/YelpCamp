const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const Comment = require('../models/comment');
const middleware = require('../middleware');

// NEW Route
router.get('/new', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) res.redirect('back');
    else res.render('comments/new', { campground: dbCampground });
  });
});

// CREATE Route
router.post('/', middleware.isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) {
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) req.flash('warning', 'Something went wrong...');
        else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();

          dbCampground.comments.push(comment);
          dbCampground.save();

          req.flash('success', 'Your comment was successfully added');
          res.redirect(`/campgrounds/${dbCampground._id}`);
        }
      });
    }
  });
});

// EDIT Route
router.get('/:comment_id/edit', middleware.checkCommentOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err || dbCampground === null) {
      req.flash('error', 'Database Error: The requested resource was not found or does not exist');
      return res.redirect('/campgrounds');
    }

    Comment.findById(req.params.comment_id, (err, dbComment) => {
      if (err || dbComment === null) res.redirect(`/campgrounds/${req.params.id}`);
      else {
        res.render('comments/edit', {
          campgroundId: req.params.id,
          comment: dbComment
        });
      }
    });
  });
});

// UPDATE Route
router.put('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
    if (err) res.redirect('back');
    else res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// DESTROY Route
router.delete('/:comment_id', middleware.checkCommentOwnership, (req, res) => {
  Comment.findByIdAndRemove(req.params.comment_id, (err) => {
    if (err) res.redirect('back');
    else {
      req.flash('success', 'Your comment was successfully deleted');
      res.redirect(`/campgrounds/${req.params.id}`);
    }
  });
});

module.exports = router;