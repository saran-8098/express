const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  dateofbirth: { type: Date, required: true }
}, {
  timestamps: true // optional: adds createdAt and updatedAt fields
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
