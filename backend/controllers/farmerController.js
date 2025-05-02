require("dotenv").config();
const pinataSDK = require('@pinata/sdk');
const { createHash } = require("crypto");
const Farmer = require("../models/Farmer"); // Adjust path as needed

// Initialize Pinata with your API key and secret
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const addCropDetails = async (req, res) => {
  console.log("🛠 Received Crop Details:", req.body);
  try {
    const farmerId = req.user.id; // Get farmerId from authenticated user
    const { cropType, fertilizersUsed, quantity, costPerQuintal, startDate, harvestDate } = req.body;

    if (!cropType || !fertilizersUsed || !quantity || !costPerQuintal || !startDate || !harvestDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Prepare crop data for IPFS
    const cropData = {
      farmerId,
      cropType,
      fertilizersUsed,
      quantity,
      costPerQuintal,
      startDate: new Date(startDate).toISOString(),
      harvestDate: new Date(harvestDate).toISOString(),
      timestamp: new Date().toISOString()
    };

    // Generate a unique transaction ID (SHA-256 hash)
    const cropString = JSON.stringify(cropData);
    const transactionId = createHash('sha256').update(cropString).digest('hex');
    cropData.transactionId = transactionId;

    // Store on IPFS via Pinata
    let ipfsHash;
    try {
      const result = await pinata.pinJSONToIPFS(cropData, {
        pinataMetadata: { name: `Crop-${transactionId}` },
        pinataOptions: { cidVersion: 0 }
      });
      ipfsHash = result.IpfsHash;
      console.log("IPFS hash:", ipfsHash);
    } catch (error) {
      console.error("Error pinning to IPFS:", error);
      return res.status(500).json({ message: "Failed to store crop data on IPFS", error: error.message });
    }

    // Update Farmer document with crop and IPFS hash
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmerId,
      {
        $push: {
          crops: {
            cropType,
            fertilizersUsed,
            quantity,
            costPerQuintal,
            startDate: new Date(startDate),
            harvestDate: new Date(harvestDate),
            ipfsHash // Add IPFS hash to the crop subdocument
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    // Return exactly the same structure as before
    res.status(201).json({ message: "Crop details added successfully", crops: updatedFarmer.crops });
  } catch (error) {
    console.warn("Error adding crop details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getFarmerCrops = async (req, res) => {
  try {
    const farmerId = req.user.id;
    
    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    
    res.status(200).json({ crops: farmer.crops || [] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addCropDetails, getFarmerCrops };