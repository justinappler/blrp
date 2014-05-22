var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var userSchema = Schema({
  name : String,
  username : String,
  email : String,
  profileId : String,
  created: {type: Date, default: Date.now},
  friends: [ObjectId]
});

module.exports = User = mongoose.model('User', userSchema);

module.exports.findOrCreate = function findOrCreate(profile, cb) {
  User.findOne({profileId: profile.identifier}, function foundUser(err, user) {
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
  var newUser = new User({
    name: profile.displayName,
    profileId: profile.identifier,
    email: profile.emails[0].value
  }).save(function onSave(err, user) {
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
