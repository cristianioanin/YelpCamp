const express = require('express');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('landing');
});

app.get('/campgrounds', (req, res) => {
  const campgrounds = [
    {
      name: 'Salmon Creek',
      image: 'https://images.pexels.com/photos/221436/pexels-photo-221436.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    },
    {
      name: 'Granite Hill',
      image: 'https://images.pexels.com/photos/45241/tent-camp-night-star-45241.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    },
    {
      name: 'Mountain Goat\'s Rest',
      image: 'https://images.pexels.com/photos/344100/pexels-photo-344100.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'
    }
  ];

  res.render('campgrounds', { campgrounds });
});



app.listen(3000, () => console.log('YelpCamp server is running on port 3000'));