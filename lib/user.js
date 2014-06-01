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
  googleRefreshToken: String,
  googleTokenExpires: {type: Date},
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
      user.googleToken = profile.token;
      user.googleRefreshToken = profile.refreshToken;
      user.googleTokenExpires = Time.addTo(new Date(), 60 * 60);
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
    googleRefreshToken: profile.refreshToken,
    googleTokenExpires: Time.addTo(new Date(), 60 * 60),
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
        cb(err);
      });
  }
};

module.exports.isTokenExpired = function isTokenExpired(user) {
  return (!user.googleTokenExpires ||
    user.googleTokenExpires.getTime() < new Date().getTime());
};
