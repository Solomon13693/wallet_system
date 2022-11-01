const User = require('../models/user')
const Wallet = require('../models/wallet')
const Transaction = require('../models/transcations')
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse')
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(process.env.FLUTTERWAVE_V3_PUBLIC_KEY, process.env.FLUTTERWAVE_V3_SECRET_KEY);


exports.paymentResponse = async (req, res) => {

  const { transaction_id } = req.query;

  let response

  try {

    const payload = { "id": transaction_id }
    response = await flw.Transaction.verify(payload)


    console.log(response);

  } catch (error) {
    console.log(error);
  }

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

}

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