require("dotenv").config();
const pinataSDK = require('@pinata/sdk');
const { createHash } = require("crypto");
const WarehouseItem = require('../models/WarehouseItem');
const Warehouse = require('../models/Warehouse');

// Initialize Pinata with your API key and secret
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

exports.addWarehouseItem = async (req, res) => {
  console.log(req.body);
  try {
    const warehouse = await Warehouse.findById(req.body.warehouseId);
    if (!warehouse) {
      return res.status(404).json({
        success: false,
        error: 'Warehouse not found'
      });
    }

    // Prepare warehouse item data for IPFS
    const warehouseItemData = {
      ...req.body, // Spread all fields from req.body
      timestamp: new Date().toISOString()
    };

    // Generate a unique transaction ID (SHA-256 hash)
    const itemString = JSON.stringify(warehouseItemData);
    const transactionId = createHash('sha256').update(itemString).digest('hex');
    warehouseItemData.transactionId = transactionId;

    // Store on IPFS via Pinata
    let ipfsHash;
    try {
      const result = await pinata.pinJSONToIPFS(warehouseItemData, {
        pinataMetadata: { name: `WarehouseItem-${transactionId}` },
        pinataOptions: { cidVersion: 0 }
      });
      ipfsHash = result.IpfsHash;
      console.log("IPFS hash:", ipfsHash);
    } catch (error) {
      console.error("Error pinning to IPFS:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to store warehouse item on IPFS: " + error.message
      });
    }

    // Add IPFS hash to the warehouse item data
    const warehouseItem = new WarehouseItem({
      ...req.body, // Spread original fields
      ipfsHash // Add IPFS hash
    });
    await warehouseItem.save();

    // Return exactly the same structure as before
    res.status(201).json({
      success: true,
      data: warehouseItem
    });
  } catch (error) {
    console.error("Error adding warehouse item:", error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getWarehouseItems = async (req, res) => {
  try {
    const warehouseItems = await WarehouseItem.find()
      .populate('warehouseId', 'name location');
    
    res.status(200).json({
      success: true,
      count: warehouseItems.length,
      data: warehouseItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

exports.getItemsByWarehouse = async (req, res) => {
  try {
    const warehouseItems = await WarehouseItem.find({
      warehouseId: req.params.warehouseId
    }).populate('warehouseId', 'name location');

    res.status(200).json({
      success: true,
      count: warehouseItems.length,
      data: warehouseItems
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};