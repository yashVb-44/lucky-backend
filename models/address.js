const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema(
    {
        type: { type: String, default: "1" },
        no: { type: String },
        area: { type: String },
        state: { type: String },
        city: { type: String, index: true }, // Index for city-based queries
        pincode: { type: String, index: true }, // Index for postal code-based queries
        country: { type: String },
        landmark: { type: String },
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String },
        user: { type: Schema.Types.ObjectId, ref: 'User', index: true }, // Index for user-based queries
        isDeleted: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

// Add geospatial index for location-based queries
AddressSchema.index({ lat: '2dsphere', lng: '2dsphere' });

module.exports = mongoose.model('Address', AddressSchema);
