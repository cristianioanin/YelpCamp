const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

const Campground = mongoose.model('Campground', campgroundSchema);

// // FOR TESTING PURPOSES - arbitrarily add data to database
// Campground.create(
//   {
//     name: 'Granite Hill',
//     image: 'https://images.pexels.com/photos/450441/pexels-photo-450441.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
//     description: 'This is a huge granite hill. No bathrooms, no water, just beautiful granite!'
//   },
//   (err, campground) => {
//     if (err) console.log(err);
//     else console.log(campground);
//   }
// );

app.get('/', (req, res) => {
  res.render('landing');
});

// INDEX Route
app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) console.log('Fail:', err);
    else res.render('index', { campgrounds });
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
  res.render('new');
});

// SHOW Route
app.get('/campgrounds/:id', (req, res) => {
  Campground.findById(req.params.id, (err, dbCampground) => {
    if (err) console.log(err);
    else res.render('show', { campground: dbCampground });
  });
});


app.listen(3000, () => console.log('YelpCamp server is running on port 3000'));