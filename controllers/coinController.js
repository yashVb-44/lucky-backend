const asyncHandler = require('express-async-handler');
const Coins = require('../models/coins');
// const Package = require('../models/package');
const { addCoinsOnUser } = require('../utils/coinUtils');

// Purchase Coins with Package
// const purchaseCoinsWithPackage = asyncHandler(async (req, res) => {
//     try {
//         const { id } = req.user
//         const { packageId, amount } = req.body;

//         const coinPackage = await Package.findById(packageId);
//         if (!coinPackage) {
//             return res.status(404).json({
//                 message: 'Package not found',
//                 type: 'error'
//             });
//         }

//         const newTransaction = new Coins({
//             userId: id,
//             transactionType: '1', // Credit
//             type: '1', // Coin Purchased
//             value: coinPackage.value,
//             amount,
//             packageId,
//             description: `Purchased ${coinPackage.value} coins`,
//             message: 'Coins purchased successfully'
//         });

//         await addCoinsOnUser(userId, value)
//         await newTransaction.save();

//         return res.status(201).json({
//             message: 'Coins purchased successfully',
//             type: 'success',
//             transaction: newTransaction
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: 'Failed to purchase coins',
//             error: error.message,
//             type: 'error'
//         });
//     }
// });

// Purchase Coins without Package
const purchaseCoinsWithoutPackage = asyncHandler(async (req, res) => {
    try {
        const { id } = req.user
        const { value, amount } = req.body;

        const newTransaction = new Coins({
            userId: id,
            transactionType: '1', // Credit
            type: '1', // Coin Purchased
            value,
            amount,
            description: `Purchased ${value} coins without package`,
        });

        await addCoinsOnUser(id, value)
        await newTransaction.save();

        return res.status(201).json({
            message: 'Coins purchased successfully',
            type: 'success',
            transaction: newTransaction
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to purchase coins',
            error: error.message,
            type: 'error'
        });
    }
});

// Get Coins History (with pagination and search)
const getCoinsHistory = asyncHandler(async (req, res) => {
    try {
        const { id: userId } = req.user;
        const { page = 1, limit = 10, search = '' } = req.query;

        const query = { userId };
        if (search) {
            query.$or = [
                { description: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }

        const transactions = await Coins.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Coins.countDocuments(query);

        return res.status(200).json({
            message: 'Coins history retrieved successfully',
            type: 'success',
            transactions,
            total,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve coins history',
            error: error.message,
            type: 'error'
        });
    }
});

module.exports = {
    // purchaseCoinsWithPackage,
    purchaseCoinsWithoutPackage,
    getCoinsHistory
};
