const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Comment = require('./models/comment');

const data = [
  {
    name: 'Cloud\'s Rest',
    image: 'https://images.pexels.com/photos/221436/pexels-photo-221436.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut ornare lectus sit amet est placerat in. Molestie at elementum eu facilisis sed. Cursus metus aliquam eleifend mi in. Sed elementum tempus egestas sed sed risus pretium quam vulputate. Malesuada fames ac turpis egestas integer eget aliquet nibh. Vitae semper quis lectus nulla at. Aliquet sagittis id consectetur purus ut faucibus pulvinar. Tempor nec feugiat nisl pretium fusce id velit ut. Euismod elementum nisi quis eleifend quam adipiscing. Ut etiam sit amet nisl purus in mollis nunc sed.'
  },
  {
    name: 'Desert Mesa',
    image: 'https://images.pexels.com/photos/134073/pexels-photo-134073.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. In massa tempor nec feugiat nisl pretium fusce id velit. Nibh praesent tristique magna sit amet purus gravida. Tellus id interdum velit laoreet id donec. Sed risus pretium quam vulputate dignissim suspendisse in est. Lorem ipsum dolor sit amet consectetur.'
  },
  {
    name: 'Canyon Floor',
    image: 'https://images.pexels.com/photos/457444/pexels-photo-457444.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut porttitor leo a diam.'
  },
];

function seedDB() {
  Campground.deleteMany({}, err => {
    if (err) console.log(err);
    else {
      console.log('Initial campground data removed from database');
      data.forEach(seed => {
        Campground.create(seed, (err, campground) => {
          if (err) console.log(err);
          else {
            console.log('Campground added');
            Comment.create(
              {
                text: 'This place is great, but, boy! do I miss Internet',
                author: 'Homer'
              }, (err, comment) => {
                if (err) console.log(err);
                else {
                  campground.comments.push(comment);
                  campground.save();
                  console.log('Created new comment');
                }
              }
            );
          }
        });
      });
    }
  });
}

module.exports = seedDB;