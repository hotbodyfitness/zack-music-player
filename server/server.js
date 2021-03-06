var express = require('express');
var app = express();
var Users = require('../db.js');
var userGenerator = require('./userGenerator.js');
var AWS = require('aws-sdk');
var path = require('path');
var request = require('request');
var expressStaticGzip = require('express-static-gzip');
require('dotenv').config();

// app.use('/', express.static('public/dist'));

app.use('/', expressStaticGzip('public/dist', {
  enableBrotli: true,
  orderPreference: ['br', 'gz']
}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
 });

app.get('/user*/:username', (req, res) => {
  Users.find({ username: req.params.username }).limit(1)
    .then((results) => {
      if (results.length) {
        res.send(results);
      } else {
        res.send('That username is not in the database, please try again. OR ... to see all users go to "localhost:3004/users"');
      }
    });
});

app.get('/user*', (req, res) => {
  Users.find().limit(100)
    .then((results) => {
      res.send(results);
    });
});

app.get('/*', (req, res) => {
  console.log('REQ', req.url)
  var string = req.url + ' is not a valid endpoint for localhost:3004 ... A specific user is accessed by going to: "localhost:3004/users/[username]" where [username] is the name of the user ... OR all users are accessed at "/users"';
  res.send(string);
});

// app.get('/mainTrack', (req, res) => { // from Alastair's data
//   request('http://localhost:3001/tracks/:artist/:track', (err, result) => {
//     var data = {
//       artist: req.params.artist,
//       track: req.params.track,
//       songfile: result.cdn_url,
//       image: result.art_url
//     };
//     res.send(data);
//   });
// });

// Below function used to populate 100 records with one Post Request to /users
app.post('/users', (req, res) => {
  var records = 0;
  setInterval(() => { // had to delay 4s -> to generate unique imgs from the img gallery api
    userGenerator(records);
    records++;
    if (records >= 100) {
      clearInterval();
      // res.send('Finished');
    }
  }, 4000);
  res.send('Started'); // this will allow the next command to execute while this server handles the db seed in the background
});

// Below funciton used to post MongoDB data to AWS S3
// app.post('/aws', (req, res) => {
//   var s3 = new AWS.S3();
//   Users.find().then((data) => {
//     s3.putObject({ // takes an object with these param, then a callback
//       Bucket: 'soundcloudusers',
//       Key: 'ALL_USERS_ARRAY',         // name of file
//       Body: JSON.stringify(data),
//       ContentType: 'application/json'
//     }, (err, data) => {
//       if (err) { console.log(err) } else { console.log('Successful AWS putObject:', data) }
//       res.end();
//     });
//   });
// });

// To generate an array of usernames
// app.get('/usernames', (req, res) => {
//   Users.find({}, 'username').then((data) => {
//     var arr = [];
//     data.forEach((e) => {
//       arr.push(e.username);
//     });
//     console.log('List of Usernames:', arr)
//     res.end();
//   });
// });

app.listen(3004, () => { console.log('listening on 3004') });