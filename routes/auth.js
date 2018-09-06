const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');

// ROOT Route
router.get('/', (req, res) => {
  res.render('landing');
});

// AUTH ROUTES
// Register Form Route
router.get('/register', (req, res) => {
  res.render('register', { page: 'register' });
});

// Sign Up logic handler
router.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/register');
    }

    passport.authenticate('local')(req, res, () => {
      req.flash('success', `Welcome to YelpCamp, ${user.username}!`)
      res.redirect('/campgrounds');
    });
  });
});

// Login Form Route
router.get('/login', (req, res) => {
  res.render('login', { page: 'login' });
});

// Login logic handler
router.post('/login', passport.authenticate('local',
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('warning', 'You have logged out');
  res.redirect('/campgrounds');
});

module.exports = router;