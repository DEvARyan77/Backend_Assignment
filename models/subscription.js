const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    planName: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'],
        default: 'ACTIVE' // optional: set default if needed
    },
    endDate: { type: Date } 
}, {
    timestamps: true
}
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
