const { Schema } = require("mongoose");
const mongoose = require('mongoose');

const walletSchema = Schema(
    {
        balance: { type: Number, default: 0 },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
    },
    { timestamps: true }
);

walletSchema.pre(/^find/, function(next) {
    this.populate({ path: 'user'})
    next()
})

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet