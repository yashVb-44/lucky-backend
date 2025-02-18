const BiddingSession = require("../models/biddingSession");
const User = require('../models/user');
const Coins = require('../models/coins');

async function getBiddingSessionAtBidTime({ sessionId }) {
    try {
        const session = await BiddingSession.findById(sessionId).select("bidCoinValue title")
        return session
    } catch (error) {
        return 1
    }
}

const debitCoinsFromUser = async (userId, amount) => {
    try {
        const user = await User.findById(userId).select("coins")

        if (!user) {
            throw new Error('User not found');
        }

        if (user.coins < amount) {
            return false; // Insufficient balance
        }

        // Deduct coins
        user.coins -= amount;
        await user.save();

        return true; // Successful debit
    } catch (error) {
        console.error('Error in debitCoinsFromUser:', error.message);
        throw new Error('Failed to debit coins from user');
    }
};

const addCoinsOnUser = async (userId, amount) => {
    try {
        const user = await User.findById(userId).select("coins")

        if (!user) {
            throw new Error('User not found');
        }

        // Deduct coins
        user.coins += amount;
        await user.save();

        return true; // Successful credit
    } catch (error) {
        console.error('Error in creditCoinsOnUser:', error.message);
        throw new Error('Failed to debit coins from user');
    }
};

const addCoinTransaction = async (entry) => {
    try {
        const coinEntry = new Coins({
            ...entry,
        });
        await coinEntry.save();
        return coinEntry;
    } catch (error) {
        console.error('Error in addCoinTransaction:', error.message);
        throw new Error('Failed to add coin transaction');
    }
};


module.exports = { getBiddingSessionAtBidTime, debitCoinsFromUser, addCoinTransaction,addCoinsOnUser };
