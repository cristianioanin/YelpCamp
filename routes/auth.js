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
  res.render('register');
});

// Sign Up logic handler
router.post('/register', (req, res) => {
  const newUser = new User({ username: req.body.username });
  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      console.log(err);
      return res.render('register');
    }

    passport.authenticate('local')(req, res, () => {
      res.redirect('/campgrounds');
    })
  });
});

// Login Form Route
router.get('/login', (req, res) => {
  res.render('login');
});

// Login logic handler
router.post('/login', passport.authenticate('local',
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }
), (req, res) => {
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds');
});

// Middleware
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;