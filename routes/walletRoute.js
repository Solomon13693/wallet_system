const express = require('express')
const router = express.Router()
const { paymentResponse, getWallet, getTranscations, allTranscation } = require('../controller/paymentController')
const { protected } = require('../controller/userController')

router.get('/payment/response', paymentResponse)

router.get('/user/wallet', protected, getWallet)
router.get('/user/tanscations', protected, getTranscations)
router.get('/tanscations', allTranscation)

module.exports = router