const mongoose = require('mongoose');

const CoinsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        transactionType: {
            type: String,
            enum: ['0', '1'], // 0 = debit, 1 = credit
            default: '2', // Correct default to 2 (nothing) for uninitialized transactions
        },
        type: {
            type: String,
            enum: ['0', '1', '2'], // 0 = bid placed, 1 = coin purchased, 2 = coin withdrwal
            default: '0',
        },
        numberOfBid: {
            type: Number
        },
        value: {
            type: Number,
            default: 0,
        },
        amount: {
            type: Number,
        },
        BiddingSessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BiddingSession', // Correct refPath
            index: true,
        },
        description: { type: String },
        packageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Package', // Correct refPath
            index: true,
        }
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Coins', CoinsSchema);
