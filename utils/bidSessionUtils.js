const { default: mongoose } = require("mongoose");
const Bid = require("../models/bid");
const User = require("../models/user");
const BiddingSession = require("../models/biddingSession")


const findWinningUser = async (biddingSession) => {
    const totalBids = await Bid.countDocuments({ biddingSession });
    const winningBid = await Bid.aggregate([
        { $match: { biddingSession: new mongoose.Types.ObjectId(biddingSession) } }, // Filter by session
        {
            $group: {
                _id: "$amount", // Group by bid amount
                users: { $push: "$user" }, // Collect users for each bid amount
                count: { $sum: 1 }, // Count occurrences of each bid amount
            },
        },
        { $match: { count: 1 } }, // Keep only unique bid amounts
        { $sort: { _id: 1 } }, // Sort by amount (ascending)
        { $limit: 1 }, // Get the lowest unique bid
    ]);
    if (winningBid.length > 0) {
        const userId = winningBid[0].users[0];
        const winningUser = await User.findById(userId).select("name email"); // Fetch user details
        await BiddingSession.findByIdAndUpdate(biddingSession, {
            winnerId: new mongoose.Types.ObjectId(userId),
            winningBid: winningBid[0]._id
        });
        return {
            user: winningUser,
            amount: winningBid[0]._id,
            totalBids: totalBids || 0
        };
    } else {
        // If no winner, remove winnerId and winningBid
        await BiddingSession.findByIdAndUpdate(biddingSession, {
            $unset: { winnerId: "", winningBid: "" }
        });

        return {
            user: null,
            amount: null,
            totalBids: totalBids || 0
        };
    }
};

module.exports = { findWinningUser };

