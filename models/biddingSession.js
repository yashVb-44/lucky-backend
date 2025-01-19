const mongoose = require('mongoose');

const BiddingSessionSchema = new mongoose.Schema({
    title: { type: String }, // Name or title of the bidding session
    description: { type: String }, // Brief description of the bidding session
    startTime: { type: Date, index: true }, // Start time of the bidding session
    endTime: {
        type: Date,
        required: true,
        validate: {
            validator: function (v) {
                return v > this.startTime; // Ensure endTime is after startTime
            },
            message: 'endTime must be after startTime.',
        },
        index: true,
    }, // End time of the bidding session
    isActive: { type: Boolean, default: false }, // Indicates if the session is active by default is false
    minBidAmount: { type: Number, default: 0 }, // Minimum allowed bid amount
    bidCoinValue: { type: Number, default: 1 }, // Coin value required for a single bid
    backgroundImage: { type: String }, // URL or path to the session's background image
}, {
    timestamps: true,
});

module.exports = mongoose.model('BiddingSession', BiddingSessionSchema);
