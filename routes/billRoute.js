const express = require('express')
const { getBillsCategories, buyRechargeCard, getRechargeCardPin, dataLookup, dataSubscription, RechargeCardPin, getEpins, buyEpin, RetrieveEpin, ElectricityValidate, ElectricityPayment } = require('../controller/BillsController')
const router = express.Router()
const { protected } = require('../controller/userController')

router.get('/categories', protected, getBillsCategories)

// Recharge cards

router.post('/airtime', protected, buyRechargeCard)

router.post('/rechargecard', protected, RechargeCardPin)

router.get('/rechargecardpins', protected, getRechargeCardPin)

// Data Subscriptions
router.get('/data/lookup', protected, dataLookup)
router.post('/data/subscribe', protected, dataSubscription)

// E PINS
router.get('/get/epins', protected, getEpins)
router.post('/buy/epins', protected, buyEpin)
router.get('/retrieve/epins', protected, RetrieveEpin)


// ELECTRICITY
router.post('/electricity/validate', protected, ElectricityValidate)
router.post('/electricity/payment', protected, ElectricityPayment)

module.exports = router