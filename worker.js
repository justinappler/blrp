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
  conn.exchange('blurps', { confirm: true, type: 'direct', autoDelete: false }, function (exchange) {
      // create a queue
      conn.queue('incomingBlurps', { durable: true }, function(queue) { 
          queue.bind(exchange, 'incomingBlurps');
          queue.subscribe(function(msg) {
              console.log('Processed a blurp: ' + msg.body);
          });
      });
  });
});