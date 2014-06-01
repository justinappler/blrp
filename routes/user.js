var express = require('express');
var router = express.Router();
var util = require('util');

var User = require('../lib/user')

router.post('/token', function (req, res) {
  User.updateToken(req.body);
  res.send(200);
});

module.exports = router;
