const express = require('express')
const router = express.Router()
const { getWallet, getTranscations, allTranscation, flutterwaveWebHook, fundWallet } = require('../controller/paymentController')
const { protected } = require('../controller/userController')

// router.get('/payment/response', paymentResponse)

router.post('/fund/wallet', fundWallet)
router.get('/user/wallet', protected, getWallet)
router.get('/user/tanscations', protected, getTranscations)
router.get('/tanscations', allTranscation)

// WEBHOOK
router.post('/flw-webhook', flutterwaveWebHook)

module.exports = router