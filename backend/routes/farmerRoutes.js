const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Farmer = require("../models/Farmer");
const { addCropDetails, getFarmerCrops } = require("../controllers/farmerController");

const router = express.Router();

router.post("/submit-score", authMiddleware, async (req, res) => {
    try {
        const { sustainabilityScore, sustainabilityBadge } = req.body;
        const userId = req.user.id;

        console.log("🛠 Received Score from Frontend:", sustainabilityScore);
        console.log("🛠 Received Badge:", sustainabilityBadge);

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized. Token invalid or missing." });
        }

        if (sustainabilityScore === undefined || isNaN(sustainabilityScore)) {
            console.error("❌ Invalid sustainabilityScore received:", sustainabilityScore);
            return res.status(400).json({ message: "Invalid score received." });
        }

        const updatedFarmer = await Farmer.findByIdAndUpdate(
            userId,
            { sustainabilityScore, sustainabilityBadge },
            { new: true }
        );

        if (!updatedFarmer) {
            console.error("❌ Farmer not found for ID:", userId);
            return res.status(404).json({ message: "Farmer not found." });
        }

        console.log("✅ Updated Farmer Data in MongoDB:", updatedFarmer);
        res.status(200).json({
            message: "Sustainability score updated successfully.",
            sustainabilityScore,
            sustainabilityBadge
        });

    } catch (error) {
        console.error("❌ Error updating sustainability score:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/add-crop", authMiddleware,  addCropDetails);
router.get("/crops", authMiddleware, getFarmerCrops);

module.exports = router;
