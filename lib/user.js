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
      user.googleRefreshToken = profile.refreshToken;
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
    email: profile.emails[0].value,
    photo: profile._json.picture,
  }, function afterCreate(err, user) {
    cb(err, user);
  });
};

function hoursOld(date) {
  return ((new Date().getTime()) - date.getTime()) / (1000 * 60 * 60);
}

module.exports.getFriends = function getFriends(user, cb) {
  if (user.friendIds && user.friendIdsAge && hoursOld(user.friendIdsAge) < 1) {
    User.find().where('googleId').in(user.friendIds).exec(cb);
  } else {
    Plus
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
