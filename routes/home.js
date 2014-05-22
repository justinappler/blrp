var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');
var auth = require('../lib/auth');
var Q = require('q');

var BlurpRequest = require('../lib/blurpRequest');

/* GET user home */
router.get('/', auth.isAuthenticated, getBlurps, getFriends, function(req, res) {
    res.render('home', {
      user : req.user,
      blurps : req.blurps || [],
      blurpReqs : req.blurpReqs || [],
    });
});

function getBlurps(req, res, next) {
  Q.all(
    [BlurpRequest.allRequestsByUser(req.user),
     BlurpRequest.allRequestsForUser(req.user)]
  )
  .then(function (reqs) {
    req.blurpReqs = reqs[0];
    req.blurps = reqs[1];
    next();
  });
}

function getFriends(req, res, next) {
  User.populateFriends(req.user, function gotFriends(err, friends) {
    req.user.friends = friends || [];
    next();
  });
}

module.exports = router;
