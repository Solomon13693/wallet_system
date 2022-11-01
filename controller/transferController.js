const asyncHandler = require("../middleware/async")
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLUTTERWAVE_V3_PUBLIC_KEY, process.env.FLUTTERWAVE_V3_SECRET_KEY);

exports.transferFund = asyncHandler(async (req, res, next) => {

    const { bank, account_number, amount, narration } = req.body

    const payload = {
        "account_bank": bank, //This is the recipient bank code. Get list here :https://developer.flutterwave.com/v3.0/reference#get-all-banks
        "account_number": account_number,
        "amount": amount,
        "narration": narration,
        "currency": "NGN",
        "reference": "transfer-" + Date.now(), //This is a merchant's unique reference for the transfer, it can be used to query for the status of the transfer
        "callback_url": "https://webhook.site/b3e505b0-fe02-430e-a538-22bbbce8ce0d",
        "debit_currency": "NGN"
    }


    const response = await flw.Transfer.initiate(payload)
    
    res.status(200).json({
        data: response
    })

})

exports.transferFee = asyncHandler(async (req, res, next) => {

    const { amount } = req.body

    const payload = {
        "amount": amount,
        "currency":"NGN"
    }

    const response = await flw.Transfer.fee(payload)
    
    res.status(200).json({
        data: response
    })

})

exports.resolveAccount = asyncHandler(async (req, res, next) => {

    const { bank, account_number} = req.body

    const payload = {
        "account_number": account_number,
        "account_bank": bank
    }

    const response = await flw.Misc.verify_Account(payload)
    
    res.status(200).json({
        data: response
    })

})

exports.getBanks = asyncHandler(async (req, res, next) => {

    const { country } = req.query

    const payload = {
        "country": country //Pass either NG, GH, KE, UG, ZA or TZ to get list of banks in Nigeria, Ghana, Kenya, Uganda, South Africa or Tanzania respectively
    }
    
    const response = await flw.Bank.country(payload)
    
    res.status(200).json({
        data: response
    })

})
