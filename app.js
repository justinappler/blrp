var express = require('express');
var app = express();

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var util = require('util');
var path = require('path');
var favicon = require('static-favicon');

var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/blrp';
mongoose.connect(mongoUri);
var MongoStore = require('connect-mongo')(session);

var User = require('./lib/user');

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var host = process.env.HOST || 'http://localhost:5000/';

// passport configuration
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: host + 'auth/google/callback',
  },
  function(token, refreshToken, profile, done) {
    profile.token = token;
    profile.refreshToken = refreshToken;
    User.findOrCreate(profile, function(err, user) {
       done(err, user);
    });
  }
));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

app.use(logger('dev'));

// force ssl
if (app.get('env') === 'production') {
  app.use(function forceSSL(req, res, next) {
      if (req.protocol != 'https') {
        res.redirect('https://' + req.host + req.url);
      } else {
        next();
      }
  });
}

app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({
  store: new MongoStore({db: 'blrp', mongoose_connection: mongoose.connection}),
  secret: process.env.SESSION_SECRET || 'keyboard cat'
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

// auth middleware
app.get('/auth/google', passport.authenticate('google', {
  scope: [
    'https://www.googleapis.com/auth/plus.login', 'profile']
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { successRedirect: '/home',
                                    failureRedirect: '/' }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// route setup
var index = require('./routes/index');
var home = require('./routes/home');
var blrprequest = require('./routes/blrprequest');

app.use('/', index);
app.use('/home', home);
app.use('/blrprequest', blrprequest);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
