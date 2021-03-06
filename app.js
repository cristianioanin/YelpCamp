require('dotenv').config();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const flash = require('connect-flash');

const passport = require('passport');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride('_method'));
app.use(flash());

const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require('./models/user');

const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

app.locals.moment = require('moment');

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
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.warning = req.flash('warning');
  res.locals.info = req.flash('info');
  next();
});

// Express Routers
app.use('/', authRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use('/users', userRoutes);

app.listen(process.env.PORT, process.env.IP, () => console.log('YelpCamp server is running'));