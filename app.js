const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

const Campground = require('./models/campground');
const Comment = require('./models/comment');
const seedDB = require('./seeds');
seedDB();

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
app.get('/campgrounds/:id/comments/new', (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) console.log(err);
    else res.render('comments/new', { campground: dbCampground });
  });
});

app.post('/campgrounds/:id/comments', (req, res) => {
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


app.listen(3000, () => console.log('YelpCamp server is running on port 3000'));