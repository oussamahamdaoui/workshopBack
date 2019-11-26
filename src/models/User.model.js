const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  isHR: { type: Boolean, default: false },
});

UserSchema.statics.findByUserName = async function findByUserName(username) {
  return this.findOne({
    username,
  });
};


const User = model('User', UserSchema);

module.exports = User;
