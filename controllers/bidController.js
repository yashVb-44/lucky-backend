const asyncHandler = require('express-async-handler');
const Bid = require('../models/bid');
const BiddingSession = require('../models/biddingSession');
const { generateImageUrls } = require('../utils/utils');
const { default: mongoose } = require('mongoose');
const { addCoinTransaction, debitCoinsFromUser, getBiddingSessionAtBidTime } = require('../utils/coinUtils');
const { findWinningUser } = require('../utils/bidSessionUtils');

// Add a new Bid
// const addBid = asyncHandler(async (req, res) => {
//     try {
//         const io = req.app.get('io')

//         const { id } = req.user;
//         const { biddingSession, amount, range, isRange } = req.body;
//         const coinValueAtBid = await getCoinsValueAtBidTime({ sessionId: biddingSession })
//         // Validate if the bidding session exists
//         const session = await BiddingSession.findById(biddingSession);
//         if (!session) {
//             return res.status(404).json({
//                 message: 'Bidding session not found',
//                 type: 'error',
//             });
//         }

//         // Handle range bidding if isRange is true
//         if (isRange && range) {
//             const rangePattern = /^\d+(\.\d+)?-\d+(\.\d+)?$/; // Validate range format (x.x-y.y or x.xx-y.yy)
//             if (!rangePattern.test(range)) {
//                 return res.status(400).json({
//                     message: 'Invalid range format. Use x.x-y.y or x.xx-y.yy.',
//                     type: 'error',
//                 });
//             }

//             const [start, end] = range.split('-').map(str => parseFloat(str)); // Normalize the range values as floats
//             if (isNaN(start) || isNaN(end) || end <= start) {
//                 return res.status(400).json({
//                     message: 'Invalid range values. Ensure the end is greater than the start.',
//                     type: 'error',
//                 });
//             }

//             // Generate individual bid values within the range
//             let bids = [];
//             for (let i = start; i <= end + 0.01; i += 0.01) {  // Include the last value by adding 0.01 to the end
//                 const bidAmount = parseFloat(i.toFixed(2)); // Round to 2 decimal places to handle variations in input
//                 if (bidAmount > end) break;  // Stop if we exceed the end value
//                 bids.push({
//                     biddingSession,
//                     user: id,
//                     amount: bidAmount, // Assign the value of the bid from the range
//                     isRange: false, // Set to false since we are saving individual bids
//                     coinValueAtBid, // Store the coin value at the time of the bid
//                 });
//             }

//             // Save all individual bids
//             await Bid.insertMany(bids);
//             return res.status(201).json({
//                 message: 'Bids added successfully',
//                 type: 'success',
//                 bids,
//             });
//         } else {
//             // If not a range, just save a single bid entry
//             const newBid = new Bid({
//                 biddingSession,
//                 user: id,
//                 amount, // Directly use the provided amount
//                 isRange: false, // Single bid
//                 coinValueAtBid
//             });

//             await newBid.save();

//             return res.status(201).json({
//                 message: 'Bid added successfully',
//                 type: 'success',
//                 bid: newBid,
//             });
//         }
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: 'Failed to add bid',
//             error: error.message,
//             type: 'error',
//         });
//     }
// });

const addBid = asyncHandler(async (req, res) => {
    try {
        const io = req.app.get("io");

        const { id } = req.user;
        const { biddingSession, amount, range, isRange } = req.body;
        const session = await BiddingSession.findById(biddingSession);
        if (!session) {
            return res.status(404).json({
                message: "Bidding session not found",
                type: "error",
            });
        }
        const biddingSessionDetails = await getBiddingSessionAtBidTime({ sessionId: biddingSession });
        const coinValueAtBid = biddingSessionDetails?.bidCoinValue
        const sessionName = biddingSessionDetails?.title
        let numberOfBids = 1
        let totalCoins = numberOfBids * coinValueAtBid

        if (isRange && range) {
            const rangePattern = /^\d+(\.\d+)?-\d+(\.\d+)?$/;
            if (!rangePattern.test(range)) {
                return res.status(400).json({
                    message: "Invalid range format. Use x.x-y.y or x.xx-y.yy.",
                    type: "error",
                });
            }

            const [start, end] = range.split("-").map((str) => parseFloat(str));
            if (isNaN(start) || isNaN(end) || end <= start) {
                return res.status(400).json({
                    message: "Invalid range values. Ensure the end is greater than the start.",
                    type: "error",
                });
            }

            numberOfBids = Math.floor((end - start) / 0.01) + 1 || 1
            totalCoins = numberOfBids * coinValueAtBid
            const isDebited = await debitCoinsFromUser(id, totalCoins);
            if (!isDebited) {
                return res.status(400).json({ message: 'Insufficient coins', type: 'error' });
            }

            let bids = [];
            for (let i = start; i <= end + 0.01; i += 0.01) {
                const bidAmount = parseFloat(i.toFixed(2));
                if (bidAmount > end) break;
                bids.push({
                    biddingSession,
                    user: id,
                    amount: bidAmount,
                    isRange: false,
                    coinValueAtBid,
                });
            }

            await Bid.insertMany(bids);
        } else {
            const newBid = new Bid({
                biddingSession,
                user: id,
                amount,
                isRange: false,
                coinValueAtBid,
            });
            const isDebited = await debitCoinsFromUser(id, totalCoins);
            if (!isDebited) {
                return res.status(400).json({ message: 'Insufficient coins', type: 'error' });
            }
            await newBid.save();
        }

        await addCoinTransaction({
            userId: id,
            transactionType: '0', // Debit  
            type: '0', // Bid placed
            value: totalCoins,
            BiddingSessionId: biddingSession,
            numberOfBids, // Pass the calculated number of bids
            description: `You have used ${totalCoins} coins in the bid of ${sessionName}`,
        });


        // Find the winning user and emit the result
        const { user: winningUser, amount: winningAmount, totalBids } = await findWinningUser(biddingSession);

        io.to(biddingSession).emit("winningUser", {
            user: winningUser || null,
            amount: winningAmount || null,
            totalBids: totalBids || 0
        });

        return res.status(201).json({
            message: "Bid added successfully",
            type: "success",
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Failed to add bid",
            error: error.message,
            type: "error",
        });
    }
});

// Get all bids for a specific bidding session
const getBidsForSession = asyncHandler(async (req, res) => {
    try {
        const { biddingSessionId } = req.params;

        // Fetch bids for a specific session
        const bids = await Bid.find({ biddingSession: biddingSessionId })
            .populate('user', 'name email') // Populate user details
            .populate('biddingSession', 'startTime endTime');

        if (!bids.length) {
            return res.status(404).json({
                message: 'No bids found for this session',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'Bids fetched successfully',
            type: 'success',
            bids,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve bids',
            error: error.message,
            type: 'error',
        });
    }
});

// Get the total bid amount for a specific bidding session
const getUserTotalBidsForSession = asyncHandler(async (req, res) => {
    try {
        const { biddingSessionId } = req.params;
        const { page = 1, limit = 10 } = req.query; // Default pagination values
        const skip = (page - 1) * limit;

        const totalUsers = await Bid.distinct("user", { biddingSession: new mongoose.Types.ObjectId(biddingSessionId) });

        // Aggregate the total bids and amounts for each user in the session
        const userBids = await Bid.aggregate([
            { $match: { biddingSession: new mongoose.Types.ObjectId(biddingSessionId) } }, // Match the session
            {
                $group: {
                    _id: '$user', // Group by user
                    totalBids: { $sum: 1 }, // Count total bids for each user
                    totalAmount: { $sum: { $multiply: ['$amount', '$coinValueAtBid'] } }, // Calculate total bid value
                }
            },
            {
                $lookup: {
                    from: 'users', // Match with the 'users' collection
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails',
                },
            },
            {
                $unwind: '$userDetails', // Unwind the user details
            },
            {
                $project: {
                    _id: 0, // Exclude the default `_id` field
                    userId: '$_id', // Include user ID
                    username: '$userDetails.name', // Include user name (adjust according to your User model)
                    totalBids: 1,
                    totalAmount: 1,
                },
            },
            { $sort: { totalAmount: -1 } }, // Sort by highest bid amount
            { $skip: skip }, // Implement pagination
            { $limit: parseInt(limit) }, // Implement pagination
        ])

        if (!userBids.length) {
            return res.status(404).json({
                message: 'No bids found for this session',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'User total bids fetched successfully',
            type: 'success',
            data: userBids,
            pagination: {
                currentPage: parseInt(page),
                limit: parseInt(limit),
                totalUsers: totalUsers.length,
                totalPages: Math.ceil(totalUsers.length / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user total bids',
            error: error.message,
            type: 'error',
        });
    }
});

// Get a specific bid
const getBid = asyncHandler(async (req, res) => {
    try {
        const { bidId } = req.params;

        const bid = await Bid.findById(bidId)
            .populate('user', 'name email')
            .populate('biddingSession', 'startTime endTime');

        if (!bid) {
            return res.status(404).json({
                message: 'Bid not found',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'Bid fetched successfully',
            type: 'success',
            bid,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve bid',
            error: error.message,
            type: 'error',
        });
    }
});

// Get all bids for a specific user in a specific bidding session
const getUserBidsForSession = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user
        const { biddingSessionId } = req.params;
        const { page = 1, limit = 10 } = req.query; // Default pagination values
        const skip = (page - 1) * limit;

        const totalBids = await Bid.countDocuments({ biddingSession: biddingSessionId, user: id });

        // Fetch bids for a specific user in a specific session
        const bids = await Bid.find({ biddingSession: biddingSessionId, user: id })
            .populate('user', 'name email') // Populate user details
            .populate('biddingSession', 'startTime endTime')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        if (!bids.length) {
            return res.status(404).json({
                message: 'No bids found for this user in this session',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'User\'s bids fetched successfully',
            type: 'success',
            bids,
            pagination: {
                currentPage: parseInt(page),
                limit: parseInt(limit),
                totalBids,
                totalPages: Math.ceil(totalBids / limit),
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve user\'s bids',
            error: error.message,
            type: 'error',
        });
    }
});

// Update an existing bid
const updateBid = asyncHandler(async (req, res) => {
    try {
        const { bidId } = req.params;
        const { amount, range, isRange, numberOfBids } = req.body;

        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({
                message: 'Bid not found',
                type: 'error',
            });
        }

        // Update bid fields
        bid.amount = amount;
        bid.range = range;
        bid.isRange = isRange;
        bid.numberOfBids = numberOfBids;

        // Save updated bid
        await bid.save();

        return res.status(200).json({
            message: 'Bid updated successfully',
            type: 'success',
            bid,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update bid',
            error: error.message,
            type: 'error',
        });
    }
});

const deleteAllBid = asyncHandler(async (req, res) => {
    try {
        const { id, role } = req.user;

        if (role === 'admin') {
            // If the role is admin, delete all bids from the database
            await Bid.deleteMany();
        } else if (role === 'user') {
            // If the role is user, delete only the bids belonging to that user
            await Bid.deleteMany({ user: id });
        } else {
            return res.status(400).json({
                message: 'Invalid role',
                type: 'error',
            });
        }

        return res.status(200).json({
            message: 'Bids deleted successfully',
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete bids',
            error: error.message,
            type: 'error',
        });
    }
});


module.exports = {
    addBid,
    getBidsForSession,
    getBid,
    updateBid,
    getUserTotalBidsForSession,
    getUserBidsForSession, // Added controller to fetch user's bids for a session
    deleteAllBid
};
