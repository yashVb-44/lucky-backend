
const express = require('express');
const router = express.Router();
const { authenticateAndAuthorize } = require('../middleware/authMiddleware');
const { purchaseCoinsWithoutPackage, getCoinsHistory } = require('../controllers/coinController');

router.post('/purchase', authenticateAndAuthorize(['user']), purchaseCoinsWithoutPackage);
router.get('/history', authenticateAndAuthorize(['user']), getCoinsHistory);

module.exports = router;