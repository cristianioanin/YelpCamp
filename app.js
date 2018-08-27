const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/yelp_camp', { useNewUrlParser: true });
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String
});

const Campground = mongoose.model('Campground', campgroundSchema);

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/campgrounds', (req, res) => {
  Campground.find({}, (err, campgrounds) => {
    if (err) console.log('Fail:', err);
    else res.render('campgrounds', { campgrounds });
  });
});

app.post('/campgrounds', (req, res) => {
  const name = req.body.name;
  const image = req.body.image;
  const newCampground = { name, image };

  Campground.create(newCampground, (err, dbCampground) => {
    if (err) console.log('Fail:', err);
    else res.redirect('/campgrounds');
  });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('new');
});


app.listen(3000, () => console.log('YelpCamp server is running on port 3000'));