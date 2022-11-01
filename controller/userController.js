const asyncHandler = require('../middleware/async');
const User = require('../models/user')
const ErrorResponse = require('../utils/errorResponse')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const SendEmail = require('../utils/AdvanceEmail')
const SendSms = require('../utils/Sms')
const cloudinary = require('../utils/Cloudinary');
const Wallet = require('../models/wallet');

exports.userRegistration = asyncHandler(async (req, res, next) => {

    const checkEmail = await User.findOne({ email: req.body.email })

    if (checkEmail) {
        return next(new ErrorResponse('Email address already exists', 500));
    }
    const checkPhone = await User.findOne({ phone: req.body.phone })

    if (checkPhone) {
        return next(new ErrorResponse('Phone number already exists', 500));
    }

    const user = await User.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        password: req.body.password,
    })

    verifyUser(user)

    // create users wallet account
     await validateUserWallet(user._id);

    return res.status(201).json({
        status: 'success',
        message: 'An Email sent to your mail, Please verify your account',
        data: {
            user
        }
    })

})

exports.userLogin = asyncHandler(async (req, res, next) => {

    const { email, password } = req.body

    if (!email || !password) {
        return next(new ErrorResponse('Please enter your email address and password', 401))
    }

    const user = await User.findOne({ email: req.body.email }).select('+password +verified')

    const message = 'To receive a link to reset your password, please enter your email address.'

    await SendSms(message, user.phone)

    if (!user || (!await user.checkPassword(password))) {
        return next(new ErrorResponse('Invalid login credentials', 401));
    }

    if (user.verified === false) {
        verifyUser(user)
        return next(new ErrorResponse('An Email sent to your mail, Please verify your account', 401));
    }

    const jwt = await user.JwtToken()

    return res.status(200).json({
        status: 'success',
        token: jwt
    })

})

const verifyUser = async (user) => {

    const token = await user.createVerifyToken()
    await user.save({ validateBeforeSave: false })

    const url = `${process.env.BASEURL}/auth/${user._id}/verify/${token}`

    try {

        await new SendEmail(user, url).sendWelcome()

    } catch (error) {
        user.verifyToken = undefined
        user.verifyTokenExpires = undefined
        await user.save({ validateBeforeSave: false })
    }

}

exports.activateUser = asyncHandler(async (req, res, next) => {

    const hashedToken = await crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ verifyToken: hashedToken, verifyTokenExpires: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorResponse('Verification is invalid or has expired', 400));
    }

    user.verified = true,
        user.verifyToken = undefined,
        user.verifyTokenExpires = undefined
    await user.save()

    return res.status(200).json({
        status: 'success',
        message: 'your account have been verfied'
    })

})

exports.forgotPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('No user found with email address', 404));
    }

    const token = await user.resetPassword()
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${process.env.BASEURL}/resetpassword/${token}`

    try {

        await new SendEmail(user, resetUrl).sendPasswordReset()

        return res.status(200).json({
            status: 'success',
            message: 'Your password reset token has been send to your email address'
        })

    } catch (error) {
        user.verifyToken = undefined
        user.verifyTokenExpires = undefined
        await user.save({ validateBeforeSave: false })
    }

})

exports.resetPassword = asyncHandler(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorResponse('Reset Token is invalid or has expired', 400));
    }

    user.password = req.body.password,
        user.resetPasswordToken = undefined,
        user.resetPasswordExpire = undefined
    await user.save()

    return res.status(200).json({
        status: 'success',
        message: 'Your password has been reset !'
    })

})

exports.protected = asyncHandler(async (req, res, next) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(new ErrorResponse('You are not logged in, Please Login', 401))
    }

    const decode = await jwt.verify(token, process.env.JWT_SECRET_KEY)

    const user = await User.findById({ _id: decode.id })

    // CHECK IF USER STILL EXIST
    if (!user) {
        return next(new ErrorResponse('User Belonging to this token does not exist', 404))
    }

    req.user = user

    next()

})

// PROFILE

exports.UserProfile = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 400));
    }

    return res.status(200).json({
        status: 'success',
        user
    })

})


exports.UpdateUser = asyncHandler(async (req, res, next) => {

    let user = await User.findById(req.user.id)

    if (!user) {
        return next(new ErrorResponse(`No user found with ID ${req.user.id}`, 400));
    }

    if (user.image.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id)
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'wallet_system/user',
        width: 500, height: 500, crop: "fill"
    })

    const updateField = {
        email: req.body.email,
        name: req.body.name,
        image: {
            public_id: result.public_id,
            url: result.url
        }
    }

    user = await User.findByIdAndUpdate(req.user.id, updateField, {
        new: true,
        runValidators: true
    })

    return res.status(200).json({
        status: 'success',
        user
    })

})

exports.UpdateUserPassword = asyncHandler(async (req, res, next) => {

    const user = await User.findById(req.user.id).select('+password')

    if (!(await user.checkPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Current password is incorrect', 400));
    }

    user.password = req.body.password
    await user.save()

    const token = await user.JwtToken()

    return res.status(200).json({
        status: 'success',
        message: 'Password has been updated successfully',
        token
    })

})

  
  const validateUserWallet = asyncHandler(async(userId) => {

    const userWallet = await Wallet.findOne({ user: userId });

    if (!userWallet) {
         await Wallet.create({
            balance: 0,
            user: userId
         });
    }

  });