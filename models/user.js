const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: [8, 'name must be atleast 8 Characters or above'],
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      validate: [validator.isEmail, 'Email address is invalid'],
      required: [true, 'Please add an email'],
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Please add an phone'],
      unique: true,
    },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      }
    },
    role: {
      type: String,
      enum: ['user'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: 6,
      select: false
    },
    verified: {
      type: Boolean,
      select: false,
      default: false
    },
    verifyToken: String,
    verifyTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      select: false
    }
  })

userSchema.pre('save', async function(req, res, next) {
    if(!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.checkPassword = async function(userPassword){
  return await bcrypt.compare(userPassword, this.password)
}

userSchema.methods.JwtToken = async function(){
  return await jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION
  })
}

userSchema.methods.createVerifyToken = function(){
  const token = crypto.randomBytes(16).toString('hex')
  this.verifyToken = crypto.Hash('sha256').update(token).digest('hex')
  this.verifyTokenExpires = Date.now() + 60 * 60 * 1000
  return token
}

userSchema.methods.resetPassword = function(){
  const passwordToken = crypto.randomBytes(32).toString('hex')
  this.resetPasswordToken = crypto.Hash('sha256').update(passwordToken).digest('hex')
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000
  return passwordToken
}

const User = mongoose.model("User", userSchema);

module.exports = User