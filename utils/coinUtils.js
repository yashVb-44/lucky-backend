async function getCoinsValueAtBidTime({ sessionId }) {
    try {
        const session = await BiddingSession.findById(sessionId).select("bidCoinValue")
        return session.bidCoinValue
    } catch (error) {
        return 1
    }
}


module.exports = { getCoinsValueAtBidTime };
