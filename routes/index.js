var express = require('express');
var router = express.Router();
var util = require('util');

/* GET home page. */
router.get('/', redirectIfAuthed, function(req, res) {
    res.render('index');
});

function redirectIfAuthed(req, res, next) {
  if (req.isAuthenticated()) { 
      res.redirect('/blurp'); 
  }
  next();
}

module.exports = router;
