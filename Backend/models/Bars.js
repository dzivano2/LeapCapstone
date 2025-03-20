const mongoose = require('mongoose');

const BarSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'], // 'Point' is the most common type for a single location
            required: true,
        },
        coordinates: {
            type: [Number], // Array of [longitude, latitude]  *Important: Longitude first!*
            required: true,
        },
    },
    // Address string is good for display purposes to the end user.
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    imageUrl: {
        type: String, // Field for storing image URL
    },
    locationType: {
        type: String,
        enum: ['Bar', 'Restaurant', 'Sports','Concert','Clinic','Event','Other'], // ✅ New field for location type
        default: 'Bar', // ✅ Default to 'Indoor' if not provided
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Create a 2dsphere index on the 'location' field. This is ESSENTIAL for geospatial queries.
BarSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Bar', BarSchema);
