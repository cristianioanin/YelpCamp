const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const middleware = require('../middleware');

const NodeGeocoder = require('node-geocoder');
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

const geocoder = NodeGeocoder(options);

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

  geocoder.geocode(req.body.location, (err, data) => {
    if (err || !data.length) {
      console.log('Error:', err);

      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    console.log('Data:', data);
    const lat = data[0].latitude;
    const long = data[0].longitude;
    const location = data[0].formattedAddress;
    const newCampground = { name, image, location, lat, long, price, description, author };

    Campground.create(newCampground, (err, dbCampground) => {
      if (err) req.flash('warning', 'Something went wrong...');
      else res.redirect('/campgrounds');
    });
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
  geocoder.geocode(req.body.location, (err, data) => {
    console.log(req.body);
    console.log('Error:', err);

    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    console.log('Data:', data);

    const lat = data[0].latitude;
    const long = data[0].longitude;
    const location = data[0].formattedAddress;
    const newData = {
      name: req.body.name,
      image: req.body.image,
      location: location,
      lat: lat,
      long: long,
      price: req.body.price,
      description: req.body.description,
    };
    Campground.findByIdAndUpdate(req.params.id, newData, (err, updatedCampground) => {
      if (err) res.redirect('back');
      else res.redirect(`/campgrounds/${req.params.id}`);
    });
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