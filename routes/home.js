var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');
var auth = require('../lib/auth');
var Q = require('q');

var BlrpRequest = require('../lib/blrprequest');

function getBlrps(req, res, next) {
  Q.all(
    [BlrpRequest.allRequestsByUser(req.user),
     BlrpRequest.allRequestsForUser(req.user)]
  )
  .then(function (reqs) {
    req.blrpReqs = reqs[0];
    req.blrps = reqs[1];
    next();
  }, function (err) {
    next(err);
  });
}

function getFriends(req, res, next) {
  User.getFriends(req.user, function gotFriends(err, friends) {
    if (err) {
      next(err);
    } else {
      req.user.friends = friends || [];
      next();
    }
  });
}

router.use(auth.isAuthenticated);
router.use(getBlrps);
router.use(getFriends);

/* GET user home */
router.get('/', function(req, res) {
    res.render('home', {
      user : req.user,
      blrps : req.blrps || [],
      blrpReqs : req.blrpReqs || [],
    });
});

module.exports = router;
