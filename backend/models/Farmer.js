const mongoose = require("mongoose");

const FarmerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "farmer" },
  refreshToken: { type: String },
  sustainabilityScore: { type: Number, default: 0 },
  sustainabilityBadge: { type: String, default: "Sprout" },
  crops: [  // Updated crop schema with new date fields
    {
      cropType: { type: String, required: true },
      fertilizersUsed: { type: String, required: true },
      quantity: { type: Number, required: true },
      costPerQuintal: { type: Number, required: true },
      startDate: { type: Date, required: false },
      harvestDate: { type: Date, required: false }
    }
  ],
  ipfsHash: { type: String }
  // ethAddress: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Farmer", FarmerSchema);