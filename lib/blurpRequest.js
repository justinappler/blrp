var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = mongoose.Types,
    ObjectId = Schema.ObjectId;

var blurpRequestSchema = Schema({
  creator: {type: ObjectId,  ref: 'User'},
  targetUser: {type: ObjectId, ref: 'User'},
  text: String
});

module.exports = BlurpRequest = mongoose.model('BlurpRequest', blurpRequestSchema);

module.exports.createRequest = function createRequest(user, to, message, cb) {
  BlurpRequest.create({
    creator: user,
    targetUser: Types.ObjectId.createFromHexString(to),
    text: message
  }, cb);
};

module.exports.allRequestsByUser = function allRequestsByUser(user, cb) {
  BlurpRequest.find({creator: user.id}).populate('targetUser').exec(cb);
};
