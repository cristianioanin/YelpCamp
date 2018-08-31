const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const passport = require('passport');
const localStrategy = require('passport-local');

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');
const seedDB = require('./seeds');
seedDB();

// Passport Configuration
app.use(require('express-session')({
  secret: "Ala, bala, portocala!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


//ROUTES
app.get('/', (req, res) => {
  res.render('landing');
});

// INDEX Route
app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) console.log('Fail:', err);
    else res.render('campgrounds/index', { campgrounds });
  });
});

// CREATE Route
app.post('/campgrounds', (req, res) => {
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
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// SHOW Route
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id).populate('comments').exec((err, dbCampground) => {
    if (err) console.log(err);
    else res.render('campgrounds/show', { campground: dbCampground });
  });
});


// COMMENTS ROUTES
// Comments - NEW Route
app.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) console.log(err);
    else res.render('comments/new', { campground: dbCampground });
  });
});

app.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else {
      Comment.create(req.body.comment, (err, comment) => {
        if (err) console.log(err);
        else {
          dbCampground.comments.push(comment);
          dbCampground.save();
          res.redirect(`/campgrounds/${dbCampground._id}`);
        }
      });
    }
  });
});


// AUTH ROUTES
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
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


app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local',
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }
), (req, res) => {
});


app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/campgrounds');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.listen(3000, () => console.log('YelpCamp server is running on port 3000'));