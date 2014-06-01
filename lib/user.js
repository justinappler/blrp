var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Google = require('../lib/googleapi');
var Time = require('../lib/time');

var userSchema = Schema({
  name: String,
  username: String,
  email: String,
  googleId: {type: String, index: true},
  googleToken: String,
  created: {type: Date, default: Date.now},
  friendIds: [String],
  friendIdsAge: {type: Date},
  photo: String
});

module.exports = User = mongoose.model('User', userSchema);

module.exports.findOrCreate = function findOrCreate(profile, cb) {
  User.findOne({googleId: profile.id}, function foundUser(err, user) {
    if (err) {
      cb(err);
    } else if (!user) {
      User.createFromProfile(profile, cb);
    } else {
      user.googleToken = profile.accessToken;
      user.photo = profile._json.picture;
      user.save();

      cb(err, user);
    }
  });
};

module.exports.createFromProfile = function createFromProfile(profile, cb) {
  User.create({
    name: profile.displayName,
    googleId: profile.id,
    googleToken: profile.token,
    email: profile.emails[0].value,
    photo: profile._json.picture,
  }, function afterCreate(err, user) {
    cb(err, user);
  });
};

module.exports.getFriends = function getFriends(user, cb) {
  if (user.friendIds && user.friendIdsAge && Time.hoursAgo(user.friendIdsAge) < 1) {
    User.find().where('googleId').in(user.friendIds).exec(cb);
  } else {
    Google
      .getPeople(user)
      .then(function (peopleIds) {
        user.friendIds = peopleIds;
        user.friendIdsAge = new Date();
        user.save();

        User.find().where('googleId').in(user.friendIds).exec(cb);
      }, function (err) {
        if (user.friendIds) {
          User.find().where('googleId').in(user.friendIds).exec(cb);
        } else {
          cb(err);
        }
      });
  }
};

module.exports.updateToken = function updateToken(authResult) {
  Google
    .getTokenInfo(authResult['access_token'])
    .then(function(tokenInfo) {
      if (tokenInfo && tokenInfo['user_id']) {
        User.findOne({googleId: tokenInfo['user_id']}, function foundUser(err, user) {
          if (err) {
            console.log('couldnt find user with token');
          } else if (user) {
            user.googleToken = authResult['access_token'];
            user.save();
          }
        });
      }
    });
};
