var express = require('express');
var session = require('express-session');
var router = express.Router();
var passport = require('passport');
var amqp = require('amqp');
var auth = require('../lib/auth');

var BlrpRequest = require('../lib/blrprequest');

// Auth all requests
router.use(auth.isAuthenticated);

// POST blrp request
router.post('/', function(req, res) {
    if (req.body.message && req.body.to) {
      BlrpRequest.createRequest(
        req.user,
        req.body.to,
        req.body.message)
      .then(function createFinished(br) {
        res.redirect('/home');
      });
    }
});

// GET delete blrp request
router.get('/delete/:id', function(req, res) {
  BlrpRequest.remove({_id: req.params.id, creator: req.user.id}, function (err) {
    res.redirect('/home');
  });
});

module.exports = router;
