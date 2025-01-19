// apiRoutes.js
const express = require('express');
const app = express();
const router = express.Router();

const userRoutes = require('./routes/userRoutes');
const walletRoutes = require('./routes/walletRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const walletRoutes = require('./routes/coin');
const settingRoutes = require('./routes/settingRoutes');
const biddingSessionRoutes = require('./routes/biddingSessionRoutes');
const bidRoutes = require('./routes/bidRoutes');

router.use("/user", userRoutes)
router.use("/admin", adminRoutes)
router.use("/wallet", walletRoutes)
router.use("/settings", settingRoutes)
router.use("/bidding/session", biddingSessionRoutes)
router.use("/bid", bidRoutes)

module.exports = router;
