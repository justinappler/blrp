var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var util = require('util');

var mongoose = require('mongoose');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/blurp';
mongoose.connect(mongoUri);

var User = require('./lib/user');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var GoogleStrategy = require('passport-google').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var host = process.env.HOST || 'http://localhost:5000/';

passport.use(new GoogleStrategy({
    returnURL: host + 'auth/google/return',
    realm: host
  },
  function(identifier, profile, done) {
    profile.identifier = identifier;
    User.findOrCreate(profile, function(err, user) {
       done(err, user);
    });
  }
));

var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');

var routes = require('./routes/index');
var blurp = require('./routes/blurp');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ store: new MongoStore({db: 'blurp'}), secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.use('/', routes);
app.use('/blurp', blurp);

app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return',
  passport.authenticate('google', { successRedirect: '/blurp',
                                    failureRedirect: '/' }));

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
