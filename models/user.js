const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String },
        profileImage: { type: String },
        username: { type: String, index: true }, // Index for unique usernames
        email: { type: String, index: true }, // Index for unique emails
        mobileNo: { type: String, index: true }, // Index for unique mobile numbers
        password: { type: String },
        isBlocked: { type: Boolean, default: false },
        coins: { type: Number, default: 0 },
        walletAmount: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        country: { type: String },
        state: { type: String },
        city: { type: String },
        language: { type: String },
        gender: { type: String },
        otp: { type: String },
        otpExpiresAt: { type: Date },
        role: { type: String, default: "user" },
        dateOfBirth: { type: String },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', UserSchema);
