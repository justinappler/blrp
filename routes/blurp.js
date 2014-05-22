var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');

var BlurpRequest = require('../lib/blurpRequest');

var ex;

// Get the URL from ENV or default to localhost
var url = process.env.CLOUDAMQP_URL || "amqp://localhost";

// Open a connection
var conn = amqp.createConnection({ url: url }, {
  reconnect: true, // Enable reconnection
  reconnectBackoffStrategy: 'linear',
  reconnectBackoffTime: 1000, // Try reconnect once a second
});

// When connected..
conn.on('ready', function () {
  ex = conn.exchange('blurps', { confirm: true, type: 'direct', autoDelete: false });
});

/* GET blurp listing. */
router.get('/', ensureAuthenticated, getReqs, getFriends, function(req, res) {
    res.render('blurp', { user : req.user, blurpReqs : req.blurpReqs })
});

/* GET blurp name . */
router.post('/', ensureAuthenticated, getReqs, getFriends, function(req, res) {
    if (req.body.message) {
      req.blurpReqs = ["'" + req.body.message + "' from " + req.body.to];
    }

    res.render('blurp', { user : req.user, blurpReqs: req.blurpReqs });
    // ex.publish('incomingBlurps', { body: req.body.blurpText }, {}, function(err) {
    //         res.render('blurp', { user : req.user, blurpText: req.body.blurpText });
    //     });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/');
}

function getReqs(req, res, next) {
  req.blurpReqs = [];
  next();
}

function getFriends(req, res, next) {
  User.populateFriends(req.user, function gotFriends(err, user) {
    req.user = user;
    next();
  });
}

module.exports = router;
