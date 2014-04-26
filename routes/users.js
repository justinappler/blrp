var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

/* GET users listing. */
router.get('/:id', function(req, res) {
  res.send('user id: ' + req.params.id);
});

module.exports = router;
