const Shopkeeper = require('../models/Shopkeeper');
const CatalogItem = require('../models/CatalogItem');
const Distributor = require('../models/Distributor');
const Farmer = require('../models/Farmer');
const WarehouseItem = require('../models/WarehouseItem');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const pinataSDK = require('@pinata/sdk');
const { createHash } = require("crypto");
const QRCode = require('qrcode');

require("dotenv").config();
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

// Get all shopkeepers with pending orders
const getAllShopkeepers = async (req, res) => {
  try {
    const shopkeepers = await Shopkeeper.find().select('-passwordHash');
    const filteredShopkeepers = shopkeepers.map(shopkeeper => ({
      ...shopkeeper._doc,
      inventory: shopkeeper.inventory.filter(item => item.status === 'pending')
    })).filter(shopkeeper => shopkeeper.inventory.length > 0);
    console.log(filteredShopkeepers);
    res.json(filteredShopkeepers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shopkeepers', error: error.message });
  }
};

// Get shopkeeper by ID
const getShopkeeperById = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id).select('-passwordHash');
    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }
    res.json(shopkeeper);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shopkeeper', error: error.message });
  }
};

// Create inventory request
const createInventoryRequest = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id);
    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    const newRequest = {
      productName: req.body.productName,
      quantity: req.body.quantity,
      unit: req.body.unit,
      price: req.body.price
    };

    shopkeeper.inventory.push(newRequest);
    await shopkeeper.save();

    res.status(201).json(shopkeeper);
  } catch (error) {
    res.status(500).json({ message: 'Error creating inventory request', error: error.message });
  }
};

// Update inventory status with Pinata integration
const updateInventoryStatus = async (req, res) => {
  try {
    const { shopkeeperId, requestId } = req.params;
    const { status } = req.body;

    if (!['pending', 'confirmed', 'rejected', 'delivered'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const shopkeeper = await Shopkeeper.findById(shopkeeperId)
      .populate({
        path: 'inventory.catalogItemId',
        model: 'CatalogItem',
        populate: {
          path: 'farmerId',
          model: 'Farmer'
        }
      });
    
    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }

    const request = shopkeeper.inventory.id(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    let ipfsHash;
    let qrCodeImage;
    let traceabilityData = {};

    if (status === 'confirmed' && request.status !== 'confirmed') {
      // Gather traceability data
      const catalogItem = request.catalogItemId;
      const farmer = catalogItem?.farmerId;
      const warehouseItem = await WarehouseItem.findOne({ productId: request.productName });

      // Prepare transaction data for IPFS
      const transactionData = {
        shopkeeperId,
        fullName: shopkeeper.fullName,
        shopName: shopkeeper.shopName,
        phoneNumber: shopkeeper.phoneNumber,
        businessAddress: shopkeeper.businessAddress,
        inventoryRequest: {
          requestId: request._id,
          productName: request.productName,
          quantity: request.quantity,
          unit: request.unit,
          price: request.price,
          status: 'confirmed',
          requestDate: request.requestDate,
          distributorId: request.distributorId,
          distributorName: request.distributorName,
          catalogItemId: request.catalogItemId,
          requestedDeliveryDate: request.requestedDeliveryDate
        },
        confirmationTimestamp: new Date().toISOString(),
        traceability: {
          farmer: farmer ? {
            name: farmer.fullName,
            cropType: request.productName,
            quantity: catalogItem?.quantity,
            startDate: farmer?.crops.find(c => c.cropType === request.productName)?.startDate?.toISOString() || 'N/A',
            harvestDate: farmer?.crops.find(c => c.cropType === request.productName)?.harvestDate?.toISOString() || 'N/A',
            fertilizersUsed: farmer?.crops.find(c => c.cropType === request.productName)?.fertilizersUsed || 'N/A'
          } : null,
          distributor: {
            name: request.distributorName,
            negotiationPrice: catalogItem?.negotiationPrice,
            deliveryDate: request.requestedDeliveryDate
          },
          warehouse: warehouseItem ? {
            productId: warehouseItem.productId,
            quantity: warehouseItem.quantity,
            bestBefore: warehouseItem.bestBefore.toISOString(),
            batchNumber: warehouseItem.batchNumber
          } : null
        }
      };

      const transactionString = JSON.stringify(transactionData);
      const transactionId = createHash('sha256').update(transactionString).digest('hex');
      transactionData.transactionId = transactionId;

      // Pin to IPFS
      try {
        const result = await pinata.pinJSONToIPFS(transactionData, {
          pinataMetadata: { name: `ConfirmedOrder-${transactionId}` },
          pinataOptions: { cidVersion: 0 }
        });
        ipfsHash = result.IpfsHash;
        console.log("IPFS hash for confirmed order:", ipfsHash);
      } catch (error) {
        console.error("Error pinning to IPFS:", error);
        return res.status(500).json({ message: 'Failed to store transaction on IPFS', error: error.message });
      }

      // Generate QR code with traceability data
      const qrCodeUrl = `http://localhost:3000/traceability/${shopkeeperId}/${requestId}`;
      traceabilityData = {
        shopkeeper: {
          name: shopkeeper.shopName,
          address: shopkeeper.businessAddress,
          productName: request.productName,
          quantity: request.quantity,
          confirmedDate: transactionData.confirmationTimestamp,
          transactionId
        },
        ...transactionData.traceability
      };
      
      qrCodeImage = await QRCode.toDataURL(JSON.stringify(traceabilityData));
      request.ipfsHash = ipfsHash;
      request.qrCodeImage = qrCodeImage;
    }

    // Update request status
    request.status = status;
    if (status === 'confirmed' && request.status !== 'confirmed') {
      shopkeeper.activeOrders += 1;
    }

    await shopkeeper.save();

    // Response with QR code and traceability data if confirmed
    if (status === 'confirmed' && qrCodeImage) {
      res.json({
        success: true,
        message: 'Inventory status updated successfully',
        shopkeeper,
        traceabilityData,
        qrCodeImage
      });
    } else {
      res.json({
        success: true,
        message: 'Inventory status updated successfully',
        shopkeeper
      });
    }
  } catch (error) {
    console.error('Error updating inventory status:', error);
    res.status(500).json({ 
      message: 'Error updating inventory status', 
      error: error.message 
    });
  }
};

// Place purchase request
const placePurchaseRequest = async (req, res) => {
  try {
    const { shopkeeperId, productId, quantity, requestedDeliveryDate } = req.body;
    
    if (!shopkeeperId || !productId || !quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: shopkeeperId, productId, and quantity are required' 
      });
    }

    if (req.user.id !== shopkeeperId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Shopkeeper ID does not match authenticated user'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopkeeperId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid shopkeeperId or productId format' 
      });
    }

    const shopkeeper = await Shopkeeper.findById(shopkeeperId).select('inventory activeOrders');
    if (!shopkeeper) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shopkeeper not found' 
      });
    }

    const catalogItem = await CatalogItem.findById(productId).select('cropName quantity negotiationPrice distributorId distributorName');
    if (!catalogItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found in catalog' 
      });
    }

    if (catalogItem.quantity < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: 'Requested quantity exceeds available quantity' 
      });
    }

    const newInventoryRequest = {
      productName: catalogItem.cropName,
      quantity: quantity,
      unit: 'kg',
      price: catalogItem.negotiationPrice,
      status: 'pending',
      requestDate: new Date(),
      distributorId: catalogItem.distributorId,
      distributorName: catalogItem.distributorName,
      catalogItemId: catalogItem._id,
      requestedDeliveryDate: requestedDeliveryDate || new Date(Date.now() + 7*24*60*60*1000)
    };

    const updatedShopkeeper = await Shopkeeper.findByIdAndUpdate(
      shopkeeperId,
      {
        $push: { inventory: newInventoryRequest },
        $inc: { activeOrders: 1 }
      },
      { new: true, runValidators: true }
    );

    if (!updatedShopkeeper) {
      throw new Error('Failed to update shopkeeper inventory');
    }

    const newRequestId = updatedShopkeeper.inventory[updatedShopkeeper.inventory.length - 1]._id;

    return res.status(200).json({
      success: true,
      message: 'Purchase request placed successfully',
      data: {
        requestId: newRequestId,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error in placePurchaseRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get distributors
const getDistributors = async (req, res) => {
  console.log("reached api controller");
  try {
    console.log("reached try block");
    const distributors = await Distributor.find({}, "-passwordHash -refreshToken");
    console.log(distributors);
    res.status(200).json(distributors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching distributors", error });
  }
};

const getShopkeeperInventory = async (req, res) => {
  try {
    const shopkeeper = await Shopkeeper.findById(req.params.id).select('inventory');
    if (!shopkeeper) {
      return res.status(404).json({ message: 'Shopkeeper not found' });
    }
    console.log("u")
    console.log(shopkeeper.inventory);
    res.status(200).json(shopkeeper.inventory);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching shopkeeper inventory', error: error.message });
  }
}



module.exports = { 
  getAllShopkeepers, 
  getShopkeeperById, 
  createInventoryRequest, 
  updateInventoryStatus, 
  placePurchaseRequest,
  getDistributors,
  getShopkeeperInventory
};