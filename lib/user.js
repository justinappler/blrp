var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Plus = require('../lib/plus');

var userSchema = Schema({
  name: String,
  username: String,
  email: String,
  googleId: {type: String, index: true},
  googleToken: String,
  googleRefreshToken: String,
  created: {type: Date, default: Date.now},
  friendIds: [String],
  friendIdsAge: {type: Date}
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
    email: profile.emails[0].value,
  }, function afterCreate(err, user) {
    cb(err, user);
  });
};

function daysOld(date) {
  return ((new Date().getTime()) - date.getTime()) / (1000 * 60 * 60 * 24);
}

module.exports.populateFriends = function populateFriends(user, cb) {
  if (user.friendIds && user.friendIdsAge && daysOld(user.friendIdsAge) < 1) {
    User.find().where('googleId').in(user.friendIds).exec(cb);
  } else {
    Plus.getPeople(user)
    .then(function (peopleIds) {
      user.friendIds = peopleIds;
      user.friendIdsAge = new Date();
      user.save();
      User.find().where('googleId').in(user.friendIds).exec(cb);
    }, function (err) {
      console.error(err);
      cb(null);
    });
  }
};
