const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: String,
  active: Boolean,
  username: String,
  first_name: String,
  last_name: String,
  observableAddresses: [
    {
      type: String,
      ref: 'Address'
    }
  ],
  lastActivity: Number,
  language: String,
  totalAddresses: Number
},
{
  _id: false,
  timestamps: true,
});

userSchema
  .pre('find', function() {
    this.populate('observableAddresses');
  })
  .pre('findOne', function() {
    this.populate('observableAddresses');
  });

const User = mongoose.model('User', userSchema);

module.exports = User
