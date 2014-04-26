var amqp = require('amqp'); 

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
  var exchange = conn.exchange('');

  // create a queue
  conn.queue('queue1', { durable: true }, function(queue) { 
    // subscribe to that queue
    queue.subscribe(function(msg) {
      console.log(msg.body);
    });
  });
});