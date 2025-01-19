const express = require('express');
const router = express.Router();
const {
    addBid,
    getBidsForSession,
    getBid,
    updateBid,
    getUserBidsForSession,
    deleteAllBid,
    getUserTotalBidsForSession,  // Route for user's bids in a session
} = require('../controllers/bidController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');

router.post('/add', authenticateAndAuthorize(['user']), addBid);
router.get('/:biddingSessionId', authenticateAndAuthorize(['admin', 'user']), getBidsForSession);
router.get('/bid/:bidId', authenticateAndAuthorize(['admin', 'user']), getBid);
router.get('/userWise/total/forSession/:biddingSessionId', authenticateAndAuthorize(['user', 'admin']), getUserTotalBidsForSession);
router.get('/ofUser/forSession/:biddingSessionId', authenticateAndAuthorize(['user']), getUserBidsForSession);
router.delete('/all/delete', authenticateAndAuthorize(['admin', 'user']), deleteAllBid);

module.exports = router;
