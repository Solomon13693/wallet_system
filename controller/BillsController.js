const asyncHandler = require("../middleware/async")
const axios = require('axios')
const qs = require('querystring')

exports.getBillsCategories = asyncHandler(async (req, res, next) => {

  const type = req.query
  const payload = qs.stringify(type)

  const url = `https://api.flutterwave.com/v3/bill-categories?${payload}`;

  // Network call to confirm transaction status
  const response = await axios({
    url,
    method: "get",
    headers: {
      Authorization: `${process.env.FLUTTERWAVE_V3_SECRET_KEY}`,
    },
  });

  const result = response.data

  res.status(200).json({
    status: 'success',
    length: result.data.length,
    data: {
      result
    }
  })

})

// RECHARGE CARD

exports.buyRechargeCard = asyncHandler(async (req, res, next) => {

  const data = {
    amount: req.body.amount,
    recipent: req.body.phone,
    network: req.body.network,
    ported: false
  }

  var config = {
    method: 'post',
    url: `${process.env.PAYSCRIBE_URL}/airtime`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data : data
  };

  const response = await axios(config)

  res.status(200).json({
    data: response.data
  })

})

exports.RechargeCardPin = asyncHandler(async (req, res, next) => {

  const data = {
    qty: req.body.qty,
    amount: req.body.amount,
    display_name: 'Adeoye Solomon'
  }

  var config = {
    method: 'post',
    url: `${process.env.PAYSCRIBE_URL}/rechargecard`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data : data
  };
  
  const response = await axios(config)

  res.status(200).json({
    status: 'success',
    data: response.data
  })

})

exports.getRechargeCardPin = asyncHandler(async (req, res, next) => {

  const type = req.query
  const payload = qs.stringify(type)

  const url = `${process.env.PAYSCRIBE_URL}/rechargecardpins?${payload}`

  var config = {
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
  };

  const response = await axios(config)

  res.status(200).json({
    status: 'success',
    data: response.data
  })

})

// DATA

exports.dataLookup = asyncHandler(async (req, res, next) => {

  const url = `${process.env.PAYSCRIBE_URL}/data/lookup`

  const data = req.body

  var config = {
    method: 'post',
    url,
    headers: {
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data
  };

  const response = await axios(config)

  res.status(200).json({
    status: 'success',
    data: response.data.message.details
  })

})

exports.dataSubscription = asyncHandler(async (req, res, next) => {

  const url = `${process.env.PAYSCRIBE_URL}/data/vend`

  const data = req.body

  var config = {
    method: 'post',
    url,
    headers: {
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data
  };

  const response = await axios(config)
  res.status(200).json({
    status: 'success',
    data: response.data
  })

})


// EPINS

exports.getEpins = asyncHandler(async (req, res, next) => {

  var config = {
    method: 'GET',
    url: `${process.env.PAYSCRIBE_URL}/epins`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    }
  };

  const response = await axios(config)

  res.status(200).json({
    status: 'success',
    data: response.data.message.details
  })

})

exports.buyEpin = asyncHandler(async (req, res, next) => {

  const data = {
    id: req.body.id,
    qty: req.body.qty
  }

  var config = {
    method: 'post',
    url: `${process.env.PAYSCRIBE_URL}/epins/vend`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data : data
  };

  const response = await axios(config)

  res.status(200).json({
    data: response.data
  })

})

exports.RetrieveEpin  = asyncHandler(async (req, res, next) => {

  const type = req.query
  const payload = qs.stringify(type)

  console.log(payload);

  const url = `${process.env.PAYSCRIBE_URL}/epins/retrieve?trans_id=${payload}`

  var config = {
    method: 'get',
    url,
    headers: {
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
  };

  const response = await axios(config)

  res.status(200).json({
    status: 'success',
    data: response.data
  })

})

// ELECTRICITY
exports.ElectricityValidate = asyncHandler(async (req, res, next) => {

  const data = {
    meter_number: req.body.meter_number,
    meter_type: req.body.meter_type,
    amount: req.body.amount,
    service: req.body.service
  }

  var config = {
    method: 'post',
    url: `${process.env.PAYSCRIBE_URL}/electricity/validate`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data : data
  };

  const response = await axios(config)

  res.status(200).json({
    data: response.data
  })

})

exports.ElectricityPayment = asyncHandler(async (req, res, next) => {

  const data = {
    productCode: req.body.productCode,
    productToken: req.body.productToken,
    phone: req.body.phone
  }

  var config = {
    method: 'post',
    url: `${process.env.PAYSCRIBE_URL}/electricity/vend`,
    headers: { 
      'Authorization': `Bearer ${process.env.PAYSCRIBE_KEY}`
    },
    data : data
  };

  const response = await axios(config)

  res.status(200).json({
    data: response.data
  })

})
