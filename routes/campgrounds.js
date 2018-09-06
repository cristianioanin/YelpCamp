const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

// INDEX Route
router.get('/', (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) {
      req.flash('error', 'Database Error: The requested resource was not found or does not exist');
      res.redirect('/campgrounds');
    }
    else res.render('campgrounds/index', { campgrounds, page: 'campgrounds' });
  });
});

// CREATE Route
router.post('/', middleware.isLoggedIn, (req, res) => {
  const name = req.body.name;
  const image = req.body.image;
  const price = req.body.price;
  const description = req.body.description;
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newCampground = { name, image, price, description, author };

  Campground.create(newCampground, (err, dbCampground) => {
    if (err) req.flash('warning', 'Something went wrong...');
    else res.redirect('/campgrounds');
  });
});

// NEW Route
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

// SHOW Route
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, dbCampground) => {
    if (err || dbCampground === null) {
      req.flash('error', 'Database Error: The requested resource was not found or does not exist');
      res.redirect('/campgrounds');
    }
    else res.render('campgrounds/show', { campground: dbCampground });
  });
});

// EDIT Route
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) res.redirect('back');
    else res.render('campgrounds/edit', { campground: dbCampground });
  });
});

// UPDATE Route
router.put('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
    if (err) res.redirect('back');
    else res.redirect(`/campgrounds/${req.params.id}`);
  });
});

// DESTROY Route
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findByIdAndRemove(req.params.id, (err) => {
    if (err) res.redirect('back');
    else res.redirect('/campgrounds');
  });
});

module.exports = router;