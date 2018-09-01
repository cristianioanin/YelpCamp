const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');

// INDEX Route
router.get('/', (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) console.log('Fail:', err);
    else res.render('campgrounds/index', { campgrounds });
  });
});

// CREATE Route
router.post('/', isLoggedIn, (req, res) => {
  const name = req.body.name;
  const image = req.body.image;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newCampground = { name, image, description, author };

  Campground.create(newCampground, (err, dbCampground) => {
    if (err) console.log('Fail:', err);
    else {
      console.log(dbCampground);
      res.redirect('/campgrounds');
    }
  });
});

// NEW Route
router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// SHOW Route
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, dbCampground) => {
    if (err) console.log(err);
    else res.render('campgrounds/show', { campground: dbCampground });
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