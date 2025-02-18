// models/Wallet.js
const mongoose = require('mongoose');

const walletSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    transactionType: { type: String, enum: ['0', '1'], default: "2" }, // 0 = debit , 1 = credit, 2 = nothing
    type: { type: String, default: "0" }, // 0 = add money in to wallet , 1 = withdrawal mondey, 2 = buy coins
    description: { type: String },
    value: {
        type: Number,
        default: 0
    },
    packageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
        index: true,
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model('Wallet', walletSchema);
