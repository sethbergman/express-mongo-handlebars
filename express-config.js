var express = require('express');
var app = express();
var fs = require('fs');
const path = require('path')
var engines = require('consolidate');
var JSONStream = require('JSONStream');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);


var User = require('./db').User;

app.engine('hbs', engines.handlebars);

app.set('views', './views');
app.set('view engine', 'hbs');

app.use('/profilepics', path.join(express.static('images')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/favicon.ico', function (req, res) {
  res.end();
});

app.get('/', function (req, res) {
  User.find({}, function (err, users) {
    if (err) console.error(err);
    res.render('index', {users: users});
  });
});

app.get('*.json', function (req, res) {
  res.download('./users/' + req.path, 'virus.exe');
});

app.get('/data/:username', function (req, res) {
  var username = req.params.username;
  var readable = fs.createReadStream('./users/' + username + '.json');
  readable.pipe(res);
});

app.get('/users/by/:gender', function (req, res) {
  var gender = req.params.gender;
  var readable = fs.createReadStream('users.json');

  readable
    .pipe(JSONStream.parse('*', function (user) {
      if (user.gender === gender) return user.name;
    }))
    .pipe(JSONStream.stringify('[\n  ', ',\n  ', '\n]\n'))
    .pipe(res);
});

app.get('/error/:username', function (req, res) {
  res.status(404).send('No user named ' + req.params.username + ' found');
});

module.exports.expressSetup = function(app){
  app.set('port', process.env.PORT || 5000);
  app.use(session({
    store: new MongoStore({
      url: process.env.MONGOLAB_URI
    }),
    resave: true,
    saveUninitialized: true
  }));
}
