const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const User = require('../models/user');

// SHOW Route
router.get('/:id', (req, res) => {
  User.findById(req.params.id, (err, dbUser) => {
    if (err || dbUser === null) {
      req.flash('error', 'Database Error: The requested resource was not found or does not exist');
      res.redirect('/campgrounds');
    } else {
      Campground.find().where('author.id').equals(dbUser.id).exec((err, campgrounds) => {
        if (err || dbUser === null) {
          req.flash('error', 'Database Error: The requested resource was not found or does not exist');
          res.redirect('/campgrounds');
        }
        res.render('users/show', { user: dbUser, campgrounds: campgrounds });
      });
    }
  });
});

module.exports = router;