const mongoose = require("mongoose");

const DistributorSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    businessName: { type: String, required: true },
    phoneNumber: { type: String, required: true, unique: true },
    businessAddress: { type: String, required: true },
    passwordHash: { type: String, required: true },
    sustainabilityScore: { type: Number, default: 0 }, // Store calculated score
    sustainabilityBadge: { type: String, default: "Sprout" }, // Default to "Sprout"
    // ethAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Distributor", DistributorSchema);
