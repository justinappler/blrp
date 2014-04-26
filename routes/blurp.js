var express = require('express');
var router = express.Router();
var amqp = require('amqp');
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
router.get('/', function(req, res) {
    res.send('blurp a string');
});

/* GET blurp name . */
router.post('/', function(req, res) {
    ex.publish('incomingBlurps', { body: req.body.blurpText }, {}, function(err) {
        res.render('index', { blurpText: req.body.blurpText });
    });
});

module.exports = router;
