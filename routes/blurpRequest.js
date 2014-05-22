var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');
var auth = require('../lib/auth');

var BlurpRequest = require('../lib/blurpRequest');

/* POST blurp request */
router.post('/', auth.isAuthenticated, function(req, res) {
    if (req.body.message && req.body.to) {
      BlurpRequest.createRequest(
        req.user,
        req.body.to,
        req.body.message)
      .then(function createFinished(br) {
        res.redirect('/home');
      });
    }
});

router.get('/delete/:id', auth.isAuthenticated, function(req, res) {
  BlurpRequest.remove({_id: req.params.id, creator: req.user.id}, function (err) {
    res.redirect('/home');
  });
});

module.exports = router;
