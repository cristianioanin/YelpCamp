const express = require('express');
const router = express.Router({ mergeParams: true });
const Campground = require('../models/campground');
const User = require('../models/user');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// PASSWORD RESET
router.get('/reset', (req, res) => {
  res.render('users/forgot');
});

router.post('/reset', (req, res, next) => {
  async.waterfall([
    done => {
      crypto.randomBytes(20, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
          req.flash('error', 'Something went wrong, please try again');
          return res.redirect('/users/reset');
        }

        if (!user) {
          req.flash('error', `No account was found with the following email address: ${req.body.email}`);
          return res.redirect('/users/reset');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        user.save(err => {
          done(err, token, user);
        });
      });
    },
    (token, user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'cristian.ioanin@gmail.com',
          pass: process.env.GMAILPW
        }
      });

      const mailOptions = {
        to: user.email,
        from: 'cristian.ioanin@gmail.com',
        subject: 'YelpCamp Password Reset',
        text: `Hi!

        
You are receiving this email because you (and, hopefully, not someone else) have requested the reset of the password for your YelpCamp account.
Please click on the following link or paste this into your browser to complete the process:
    http://${req.headers.host}/users/reset/${token}

If you did not request this, please ignore the link and your password will remain unchanged.
Also, reply with a short note if this email was sent eroneously.

Thank you!
        `
      };

      smtpTransport.sendMail(mailOptions, err => {
        if (err) {
          req.flash('error', 'Something went wrong, please try again');
          return res.redirect('/users/reset');
        }
        console.log('Password reset mail sent');
        req.flash('info', `An email has been sent to ${user.email} with further instructions.`);
        done(err, 'done');
      });
    }
  ], err => {
    if (err) return next(err);
    res.redirect('/users/reset');
  });
});

router.get('/reset/:token', (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
    if (err) {
      req.flash('error', 'Something went wrong, please try again');
      return res.redirect('/users/reset');
    }
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/users/reset');
    }
    res.render('users/reset', { token: req.params.token });
  });
});

router.put('/reset/:token', (req, res) => {
  async.waterfall([
    done => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (err) {
          req.flash('error', 'Something went wrong, please try again');
          return res.redirect('/users/reset');
        }
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('/users/reset');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, err => {
            if (err) {
              req.flash('error', 'Something went wrong, please try again');
              return res.redirect('/users/reset');
            }
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(err => {
              if (err) {
                req.flash('error', 'Something went wrong, please try again');
                return res.redirect('/users/reset');
              }
              req.logIn(user, err => {
                done(err, user);
              });
            });
          });
        } else {
          req.flash('warning', 'Your password inputs do not match. Please, try again');
          return res.redirect('back');
        }
      });
    },
    (user, done) => {
      const smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'cristian.ioanin@gmail.com',
          pass: process.env.GMAILPW
        }
      });

      const mailOptions = {
        to: user.email,
        from: 'cristian.ioanin@gmail.com',
        subject: 'YelpCamp - Your password has been changed',
        text: `Hi!


This is a confirmation that the password for your YelpCamp account has just been reset.

Keep in touch!
        `
      };

      smtpTransport.sendMail(mailOptions, err => {
        console.log('Confirmation mail for password change sent');
        req.flash('success', 'Great! Your password has been updated. You are now logged in.');
        done(err, 'done');
      });
    }
  ], err => {
    res.redirect('/campgrounds');
  });
});

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