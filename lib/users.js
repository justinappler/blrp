var redis = require("redis");
var db = require('redis-url').connect(process.env.REDISTOGO_URL) || redis.createClient();
var util = require('util');

exports.findOrCreate = function(profile, callback) {
  db.get("guser#" + profile.identifier, function (err, userId) {
      if (err || userId == null) {
          db.incr("userid", function(err, nextid) {
              profile.id = nextid;
              
              delete profile.name;
              delete profile.emails;
              
              db.set("guser#" + profile.identifier, nextid);
              db.hmset("user#" + nextid, profile);
              
              callback(null, profile);
          });
      }
      db.hgetall("user#" + userId, function(err, user) {
          callback(null, user);
      });
  });
}

exports.findById = function(userId, callback) {
    db.hgetall("user#" + userId, function(err, user) {
       callback(null, user); 
    });
}