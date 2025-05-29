const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  name: String
});

module.exports = mongoose.model('Customer', customerSchema);
