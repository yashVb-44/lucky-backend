const express = require('express');
const router = express.Router();
const {
    addBiddingSession,
    getBiddingSessions,
    updateBiddingSession,
    deleteBiddingSession,
    getBiddingSessionsByType
} = require('../controllers/biddingSessionController');
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');

router.post('/add', authenticateAndAuthorize(['admin']), addBiddingSession);
router.get('/byType', authenticateAndAuthorize(['user']), getBiddingSessionsByType);
router.get('/:id?', authenticateAndAuthorize(['admin', 'user']), getBiddingSessions);
router.put('/update/:id', authenticateAndAuthorize(['admin']), updateBiddingSession);
router.delete('/delete/:id', authenticateAndAuthorize(['admin']), deleteBiddingSession);

module.exports = router;
