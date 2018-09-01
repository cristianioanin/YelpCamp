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
router.post('/', (req, res) => {
  const name = req.body.name;
  const image = req.body.image;
  const description = req.body.description;
  const newCampground = { name, image, description };

  Campground.create(newCampground, (err, dbCampground) => {
    if (err) console.log('Fail:', err);
    else res.redirect('/campgrounds');
  });
});

// NEW Route
router.get('/new', (req, res) => {
  res.render('campgrounds/new');
});

// SHOW Route
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, dbCampground) => {
    if (err) console.log(err);
    else res.render('campgrounds/show', { campground: dbCampground });
  });
});

module.exports = router;