const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema(
    {
        biddingSession: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BiddingSession',
            index: true, // Add index for faster lookup
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true, // Add index for faster lookup
        },
        amount: { type: Number }, // Single bid amount (if not a range)
        // range: { type: String }, // Bid range (e.g., "1.1-3.1")
        isRange: { type: Boolean, default: false }, // Indicates if the bid is a range
        // numberOfBids: { type: Number, default: 1 }, // Total bids represented by the range
        coinValueAtBid: { type: Number },
    },
    {
        timestamps: true,
    }
);

// BidSchema.pre('save', function (next) {
//     if (this.isRange && this.range) {
//         const [start, end] = this.range.split('-').map(Number); // Parse the range
//         if (!isNaN(start) && !isNaN(end) && end > start) {
//             this.numberOfBids = Math.floor((end - start) / 0.1) + 1; // Calculate number of bids
//         } else {
//             this.numberOfBids = 1; // Default to 1 if range is invalid
//         }
//     }
//     next();
// });

// Middleware to calculate numberOfBids based on range
// BidSchema.pre('save', function (next) {
//     if (this.isRange && this.range) {
//         const rangePattern = /^\d+(\.\d+)?-\d+(\.\d+)?$/; // Validate range format (x.x-y.y)
//         if (!rangePattern.test(this.range)) {
//             return next(new Error('Invalid range format. Use x.x-y.y.'));
//         }

//         const [start, end] = this.range.split('-').map(Number); // Parse the range
//         if (!isNaN(start) && !isNaN(end) && end > start) {
//             this.numberOfBids = Math.floor((end - start) / 0.1) + 1; // Calculate number of bids
//         } else {
//             this.numberOfBids = 1; // Default to 1 if range is invalid
//         }
//     }
//     next();
// });

module.exports = mongoose.model('Bid', BidSchema);
