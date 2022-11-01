const express = require('express')
const router = express.Router()
const { transferFund, transferFee, resolveAccount, getBanks } = require('../controller/transferController')
const { protected } = require('../controller/userController')

router.post('/', protected, transferFund)
router.get('/fee', protected, transferFee)
router.get('/resolve/bank', protected, resolveAccount)
router.get('/get/bank', protected, getBanks)

module.exports = router