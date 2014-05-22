var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Plus = require('../lib/plus');

var userSchema = Schema({
  name: String,
  username: String,
  email: String,
  googleId: String,
  googleToken: String,
  googleRefreshToken: String,
  created: {type: Date, default: Date.now},
});

module.exports = User = mongoose.model('User', userSchema);

module.exports.findOrCreate = function findOrCreate(profile, cb) {
  User.findOne({googleId: profile.id}, function foundUser(err, user) {
    if (err) {
      cb(err);
    } else if (!user) {
      User.createFromProfile(profile, cb);
    } else {
      cb(null, user);
    }
  });
};

module.exports.createFromProfile = function createFromProfile(profile, cb) {
  console.dir(ObjectId);
  User.create({
    name: profile.displayName,
    googleId: profile.id,
    googleToken: profile.token,
    googleRefreshToken: profile.refreshToken,
    email: profile.emails[0].value,
    friends: [mongoose.Types.ObjectId.createFromHexString(process.env.SAMPLEFRIEND || "537d76547b01a5948675350e")]
  }, function afterCreate(err, user) {
    cb(err, user);
  });
};

module.exports.populateFriends = function getFriends(user, cb) {
  Plus.getPeople(user)
  .then(function (peopleIds) {
    User.find().where('googleId').in(peopleIds).exec(cb);
  }, function (err) {
    console.error(err);
  });
};
