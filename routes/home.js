var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');
var auth = require('../lib/auth');

var BlurpRequest = require('../lib/blurpRequest');

/* GET user home */
router.get('/', auth.isAuthenticated, getReqs, getFriends, function(req, res) {
    res.render('home', {
      user : req.user,
      blurpReqs : req.blurpReqs
    });
});

function getReqs(req, res, next) {
  BlurpRequest.allRequestsByUser(req.user, function (err, reqs) {
    if (err) {
      next();
    }
    req.blurpReqs = reqs;
    next();
  });
}

function getFriends(req, res, next) {
  User.populateFriends(req.user, function gotFriends(err, user) {
    req.user = user;
    next();
  });
}

module.exports = router;
