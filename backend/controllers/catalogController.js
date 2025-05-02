// controllers/catalogController.js
const CatalogItem = require('../models/CatalogItem');
const Farmer = require('../models/Farmer');
const Shopkeeper = require('../models/Shopkeeper');
const Distributor = require('../models/Distributor');
// const distributorContract = require('../utils/blockchain');
// const { ethers } = require('ethers');
const dotenv = require('dotenv');
dotenv.config();
const pinataSDK = require('@pinata/sdk');
const { createHash } = require("crypto");
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const catalogController = {
  // Keep the existing methods inside the object
  getCatalogItems: async (req, res) => {
    try {
      const catalogItems = await CatalogItem.aggregate([
        {
          $match: {
            status: 'pending',
            quantity: { $gt: 0 }
          }
        },
        {
          $project: {
            cropName: 1,
            farmerName: 1,
            farmerRating: 1,
            distributorName: 1,
            pricePerUnit: '$negotiationPrice',
            availableQuantity: '$quantity',
            farmerId: 1,
            distributorId: 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: catalogItems
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching catalog items',
        error: error.message
      });
    }
  },

  purchaseItem: async (req, res) => {
    try {
      const { catalogItemId, requestedQuantity } = req.body;
      const shopkeeperId = req.user.id;

      const catalogItem = await CatalogItem.findById(catalogItemId);
      if (!catalogItem) {
        return res.status(404).json({
          success: false,
          message: 'Catalog item not found'
        });
      }

      if (catalogItem.quantity < requestedQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Requested quantity not available'
        });
      }

      const shopkeeper = await Shopkeeper.findById(shopkeeperId);
      if (!shopkeeper) {
        return res.status(404).json({
          success: false,
          message: 'Shopkeeper not found'
        });
      }

      shopkeeper.inventory.push({
        productName: catalogItem.cropName,
        quantity: requestedQuantity,
        price: catalogItem.negotiationPrice,
        status: 'pending',
        requestDate: new Date()
      });

      catalogItem.quantity -= requestedQuantity;
      
      if (catalogItem.quantity === 0) {
        catalogItem.status = 'confirmed';
      }

      await Promise.all([
        shopkeeper.save(),
        catalogItem.save()
      ]);

      res.status(200).json({
        success: true,
        message: 'Purchase request created successfully',
        data: {
          inventoryRequest: shopkeeper.inventory[shopkeeper.inventory.length - 1],
          remainingQuantity: catalogItem.quantity
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error processing purchase request',
        error: error.message
      });
    }
  },

  getAllCatalogItems: async (req, res) => {
    try {
      const catalogItems = await CatalogItem.find()
        .sort({ createdAt: -1 });
      
      res.status(200).json(catalogItems);
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      res.status(500).json({ message: 'Failed to fetch catalog items', error: error.message });
    }
  },
  addCatalogItem : async (req, res) => {
    console.log("Request body:", req.body);
    try {
      const { 
        farmerId, 
        farmerName,
        distributorId,
        distributorName,
        cropName, 
        quantity, 
        negotiationPrice, 
        negotiatedDate, 
        deliveryDate,
        farmerRating 
      } = req.body;
  
      if (!farmerId || !distributorId || !cropName || !quantity || !negotiationPrice || !deliveryDate) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      // Prepare transaction data for IPFS
      const transactionData = {
        farmerId,
        farmerName,
        distributorId,
        distributorName,
        cropName,
        quantity,
        negotiationPrice,
        negotiatedDate: negotiatedDate || new Date().toISOString(),
        deliveryDate,
        farmerRating: farmerRating || 0,
        timestamp: new Date().toISOString()
      };
  
      // Generate a unique transaction ID (SHA-256 hash)
      const transactionString = JSON.stringify(transactionData);
      const transactionId = createHash('sha256').update(transactionString).digest('hex');
      transactionData.transactionId = transactionId;
  
      // Store on IPFS via Pinata
      let ipfsHash;
      try {
        const result = await pinata.pinJSONToIPFS(transactionData, {
          pinataMetadata: { name: `CatalogItem-${transactionId}` },
          pinataOptions: { cidVersion: 0 }
        });
        ipfsHash = result.IpfsHash;
        console.log("IPFS hash:", ipfsHash);
      } catch (error) {
        console.error("Error pinning to IPFS:", error);
        return res.status(500).json({ message: "Failed to store data on IPFS", error: error.message });
      }
  
      // Save to MongoDB with IPFS hash
      const newCatalogItem = new CatalogItem({
        farmerId,
        farmerName,
        distributorId,
        distributorName,
        cropName,
        quantity,
        negotiationPrice,
        negotiatedDate: negotiatedDate || new Date(),
        deliveryDate,
        farmerRating: farmerRating || 0,
        ipfsHash // Store the IPFS hash
      });
  
      const savedItem = await newCatalogItem.save();
      const qrCodeUrl = `http://localhost:3000/consumer-info/${savedItem._id}`; // Adjust domain
      console.log("QR code URL:", qrCodeUrl);
      console.log(ipfsHash)
      // res.status(201).json({
      //   ...savedItem._doc,
      //   ipfsHash,
      //   qrCodeUrl
      // });
      res.status(201).json(savedItem);
  
    } catch (error) {
      console.error('Error adding catalog item:', error);
      res.status(500).json({ message: 'Failed to add catalog item', error: error.message });
    }
  },

  updateCatalogItem: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      updateData.updatedAt = Date.now();
      
      const updatedItem = await CatalogItem.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!updatedItem) {
        return res.status(404).json({ message: 'Catalog item not found' });
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Error updating catalog item:', error);
      res.status(500).json({ message: 'Failed to update catalog item', error: error.message });
    }
  },

  deleteCatalogItem: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deletedItem = await CatalogItem.findByIdAndDelete(id);
      
      if (!deletedItem) {
        return res.status(404).json({ message: 'Catalog item not found' });
      }
      
      res.status(200).json({ message: 'Catalog item deleted successfully' });
    } catch (error) {
      console.error('Error deleting catalog item:', error);
      res.status(500).json({ message: 'Failed to delete catalog item', error: error.message });
    }
  },

  getCatalogItemsByFarmerId: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const items = await CatalogItem.find({ farmerId });
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching farmer catalog items:', error);
      res.status(500).json({ message: 'Failed to fetch farmer catalog items', error: error.message });
    }
  },

  getFarmerCrops: async (req, res) => {
    try {
      const { farmerId } = req.params;
      const farmer = await Farmer.findById(farmerId);
      
      if (!farmer) {
        return res.status(404).json({ message: 'Farmer not found' });
      }
      
      res.status(200).json(farmer.crops);
    } catch (error) {
      console.error('Error fetching farmer crops:', error);
      res.status(500).json({ message: 'Failed to fetch farmer crops', error: error.message });
    }
  }
};

module.exports = catalogController;