var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var blurpRequestSchema = Schema({
  creator: ObjectId,
  targetUser: ObjectId,
  text: String
});

module.exports = mongoose.model('BlurpRequest', blurpRequestSchema);
