const asyncHandler = require('express-async-handler');
const BiddingSession = require('../models/biddingSession');
const upload = require('../config/mutler');
const removeUnwantedImages = require('../utils/deletingFiles');
const { generateImageUrls } = require('../utils/utils');

// Add Bidding Session
const addBiddingSession = [
    upload.single('backgroundImage'),
    asyncHandler(async (req, res) => {
        try {
            const { startTime, endTime } = req.body;

            // Validate endTime > startTime
            if (new Date(endTime) <= new Date(startTime)) {
                return res.status(400).json({
                    message: 'endTime must be after startTime.',
                    type: 'error',
                });
            }

            const biddingSessionData = { ...req.body };

            // Handle image upload
            if (req.file) {
                biddingSessionData.backgroundImage = req.file.path;
            }

            const biddingSession = await BiddingSession.create(biddingSessionData);

            return res.status(201).json({
                message: 'Bidding session added successfully',
                type: 'success',
                biddingSession,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to add bidding session',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Get Bidding Sessions
const getBiddingSessions = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            const biddingSession = await BiddingSession.findById(id);
            if (!biddingSession) {
                return res.status(404).json({
                    message: 'Bidding session not found',
                    type: 'error',
                });
            }

            return res.status(200).json({
                biddingSession: generateImageUrls(biddingSession.toObject(), req),
                type: 'success',
            });
        }

        const biddingSessions = await BiddingSession.find();
        const sessionsWithUrls = biddingSessions.map((session) =>
            generateImageUrls(session.toObject(), req)
        );

        return res.status(200).json({
            biddingSessions: sessionsWithUrls,
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to retrieve bidding sessions',
            error: error.message,
            type: 'error',
        });
    }
});

// Update Bidding Session
const updateBiddingSession = [
    upload.single('backgroundImage'),
    asyncHandler(async (req, res) => {
        try {
            const { id } = req.params;
            const biddingSession = await BiddingSession.findById(id);

            if (!biddingSession) {
                if (req.file) {
                    removeUnwantedImages([req.file.path]);
                }
                return res.status(404).json({
                    message: 'Bidding session not found',
                    type: 'error',
                });
            }

            // Update fields
            Object.assign(biddingSession, req.body);

            // Handle image update
            if (req.file) {
                const oldImage = biddingSession.backgroundImage;
                biddingSession.backgroundImage = req.file.path;
                if (oldImage) {
                    removeUnwantedImages([oldImage]);
                }
            }

            await biddingSession.save();

            return res.status(200).json({
                message: 'Bidding session updated successfully',
                type: 'success',
                biddingSession,
            });
        } catch (error) {
            if (req.file) {
                removeUnwantedImages([req.file.path]);
            }
            return res.status(500).json({
                message: 'Failed to update bidding session',
                error: error.message,
                type: 'error',
            });
        }
    }),
];

// Delete Bidding Session
const deleteBiddingSession = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: 'Bidding session ID is required',
                type: 'error',
            });
        }

        const biddingSession = await BiddingSession.findById(id);
        if (!biddingSession) {
            return res.status(404).json({
                message: 'Bidding session not found',
                type: 'error',
            });
        }

        if (biddingSession.backgroundImage) {
            removeUnwantedImages([biddingSession.backgroundImage]);
        }
        await biddingSession.deleteOne();

        return res.status(200).json({
            message: 'Bidding session deleted successfully',
            type: 'success',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete bidding session',
            error: error.message,
            type: 'error',
        });
    }
});

module.exports = {
    addBiddingSession,
    getBiddingSessions,
    updateBiddingSession,
    deleteBiddingSession,
};
