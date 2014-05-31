var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = mongoose.Types,
    ObjectId = Schema.ObjectId;

var blrpRequestSchema = Schema({
  creator: {type: ObjectId,  ref: 'User'},
  targetUser: {type: ObjectId, ref: 'User'},
  text: String
});

module.exports = BlrpRequest = mongoose.model('BlrpRequest', blrpRequestSchema);

module.exports.createRequest = function createRequest(user, to, message) {
  return BlrpRequest.create({
    creator: user,
    targetUser: Types.ObjectId.createFromHexString(to),
    text: message
  });
};

module.exports.allRequestsByUser = function allRequestsByUser(user) {
  return BlrpRequest.find({creator: user.id}).populate('targetUser').exec();
};

module.exports.allRequestsForUser = function allRequestsByUser(user) {
  return BlrpRequest.find({targetUser: user.id}).populate('creator').exec();
};
