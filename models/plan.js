const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    email: { type: String, required: true },
    planName: { type: String, required: true, unique: true },
    planPrice: { type: Number, required: true },
    planDuration: { type: Date, required: true },
    planTimeSpan: { type: String, required: true },
    features: { type: [String], required: true },
}, {
    timestamps: true
}
);

module.exports = mongoose.model('Plan', planSchema);
