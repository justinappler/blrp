var express = require('express');
var router = express.Router();
var amqp = require('amqp');
var exchange, mq;

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
  // declare the default exchange
  exchange = conn.exchange('');

  // create a queue
  conn.queue('queue1', { durable: true }, function(queue) { 
      mq = queue;
  });
});

/* GET blurp listing. */
router.get('/', function(req, res) {
    res.send('blurp a string');
});

/* GET blurp name . */
router.get('/:name', function(req, res) {
    exchange.publish(mq.name, { body: req.params.name });
    res.send('blurped: ' + req.params.name);
});

module.exports = router;
