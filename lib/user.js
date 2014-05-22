var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = Schema({
  name: String,
  username: String,
  email: String,
  googleId: String,
  googleToken: String,
  created: {type: Date, default: Date.now},
  friends: [ObjectId]
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
    token: profile.token,
    email: profile.emails[0].value,
    friends: [mongoose.Types.ObjectId.createFromHexString("537d76547b01a5948675350e")]
  }, function afterCreate(err, user) {
    cb(err, user);
  });
};

module.exports.populateFriends = function getFriends(user, cb) {
  User.findById(user.id).populate('friends').exec(function gotFriends(err, user) {
    if (err) {
      cb(err);
    }
    cb(null, user);
  });
};
