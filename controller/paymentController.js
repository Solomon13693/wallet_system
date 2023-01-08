const User = require('../models/user')
const Wallet = require('../models/wallet')
const Transaction = require('../models/transcations')
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse')
const Flutterwave = require('flutterwave-node-v3');
const axios = require('axios');

const flw = new Flutterwave(process.env.FLUTTERWAVE_V3_PUBLIC_KEY, process.env.FLUTTERWAVE_V3_SECRET_KEY);

exports.fundWallet = asyncHandler(async (req, res) => {

  const response = await axios.post("https://api.flutterwave.com/v3/payments", {
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_V3_SECRET_KEY}`
    },
    json: {
      tx_ref: "hooli-tx-1920bbtytty",
      amount: "100",
      currency: "NGN",
      redirect_url: "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
      meta: {
        consumer_id: 23,
        consumer_mac: "92a3-912ba-1192a"
      },
      customer: {
        email: "user@gmail.com",
        phonenumber: "080****4528",
        name: "Yemi Desola"
      },
      customizations: {
        title: "Pied Piper Payments",
        logo: "http://www.piedpiper.com/app/themes/joystick-v27/images/logo.png"
      }
    }
  });

  return res.json(200).json({
    status: 'success',
    data: {
      response
    }
  })

})

exports.flutterwaveWebHook = asyncHandler(async (req, res) => {

  // If you specified a secret hash, check for the signature
  const secretHash = process.env.FLW_SECRET_HASH;

  const signature = req.headers["verif-hash"];

  if (!signature || (signature !== secretHash)) {

    // This request isn't from Flutterwave; discard
    console.log('Secret hash is not correct');
    res.status(401).end();
  }
  const payload = req.body;

  if (payload.data.status == 'successful') {
    await verifyPayment(payload.data, res)
  } else {
    console.log('Error: ' + payload.data.status);
  }

})

exports.getWallet = asyncHandler(async (req, res, next) => {

  const wallet = await Wallet.findOne({ user: req.user.id })

  if (!wallet) {
    return next(new ErrorResponse('No wallet found', 404));
  }

  res.status(200).json({
    status: 'success',
    balance: wallet.balance,
    user: wallet.user
  })

})

exports.getTranscations = asyncHandler(async (req, res, next) => {

  const transcations = await Transaction.find({ user: req.user.id })

  if (!transcations) {
    return next(new ErrorResponse('No transaction found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      transcations
    }
  })

})

exports.allTranscation = asyncHandler(async (req, res, next) => {

  // CAN USE PAYLOAD
  const payload = {
    "from": "2020-01-01",
    "to": "2020-05-05"
  }

  const response = await flw.Transaction.fetch()

  res.status(200).json({
    status: 'success',
    data: {
      response
    }
  })

})

const verifyPayment = async (payload, res) => {

  const response = await flw.Transaction.verify({ id: payload.id });

  if (response.data.status === "successful") {

    const { status, currency, id, amount, customer } = response.data;

    // check if transaction id already exist
    const transactionExist = await Transaction.findOne({ transactionId: id });

    if (transactionExist) {
      return res.status(409).send("Transaction Already Exist");
    }

    // check if customer exist in our database
    const user = await User.findOne({ email: customer.email });

    // create transaction
    await createTransaction(user._id, id, status, currency, amount, customer);

    await updateWallet(user._id, amount);

    return res.status(200).json({
      response: "wallet funded successfully"
    });

  } else {

    return res.status(200).json({
      response: "Your payment was not successful"
    });

  }

}

// Create Transaction
const createTransaction = async (
  user,
  id,
  status,
  currency,
  amount,
  customer
) => {
  try {
    // create transaction
    const transaction = await Transaction.create({
      user,
      transactionId: id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone_number,
      amount,
      currency,
      paymentStatus: status,
      paymentGateway: "flutterwave",
    });
    return transaction;
  } catch (error) {
    console.log(error);
  }
};

// Update wallet 
const updateWallet = async (user, amount) => {
  try {
    // update wallet
    const wallet = await Wallet.findOneAndUpdate(
      { user },
      { $inc: { balance: amount } },
      { new: true }
    );
    return wallet;
  } catch (error) {
    console.log(error);
  }
};

