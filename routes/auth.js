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
  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    username: req.body.username,
    avatar: req.body.avatar,
    appliedForAdmin: req.body.appliedForAdmin,
    isAdmin: req.body.adminCode === 'AC123' ? true : false
  });

  User.register(newUser, req.body.password, (err, user) => {
    if (err && err.code === 11000) {
      req.flash('error', `There is already an account with the following e-mail: ${newUser.email}`);
      return res.redirect('/register');
    } else if (err) {
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