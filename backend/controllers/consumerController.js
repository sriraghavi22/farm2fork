require("dotenv").config;
const pinataSDK = require('@pinata/sdk');
const Shopkeeper = require('../models/Shopkeeper');
const CatalogItem = require('../models/CatalogItem');
const Farmer = require('../models/Farmer');
const WarehouseItem = require('../models/WarehouseItem');
const QRCode = require('qrcode');

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_API_SECRET);

const getTraceabilityData = async (req, res) => {
  try {
    const { shopkeeperId, requestId } = req.params;

    // Fetch Shopkeeper and confirmed order
    const shopkeeper = await Shopkeeper.findById(shopkeeperId);
    if (!shopkeeper) throw new Error('Shopkeeper not found');
    const order = shopkeeper.inventory.id(requestId);
    if (!order || order.status !== 'confirmed' || !order.ipfsHash) {
      throw new Error('Confirmed order not found or no IPFS data');
    }

    const orderUrl = `https://gateway.pinata.cloud/ipfs/${order.ipfsHash}`;
    const orderResponse = await fetch(orderUrl);
    if (!orderResponse.ok) throw new Error('Failed to fetch order IPFS data');
    const orderData = await orderResponse.json();

    // Fetch Catalog Item
    const catalogItem = await CatalogItem.findById(orderData.inventoryRequest.catalogItemId);
    if (!catalogItem) throw new Error('Catalog item not found');
    const catalogUrl = `https://gateway.pinata.cloud/ipfs/${catalogItem.ipfsHash}`;
    const catalogResponse = await fetch(catalogUrl);
    if (!catalogResponse.ok) throw new Error('Failed to fetch catalog IPFS data');
    const catalogData = await catalogResponse.json();

    // Fetch Farmer Crop
    const farmer = await Farmer.findById(catalogData.farmerId);
    if (!farmer) throw new Error('Farmer not found');
    const crop = farmer.crops.find(c => c.cropType === catalogData.cropName);
    let cropData = {};
    if (crop && crop.ipfsHash) {
      const cropUrl = `https://gateway.pinata.cloud/ipfs/${crop.ipfsHash}`;
      const cropResponse = await fetch(cropUrl);
      if (!cropResponse.ok) throw new Error('Failed to fetch crop IPFS data');
      cropData = await cropResponse.json();
    }

    // Fetch Warehouse Item
    const warehouseItem = await WarehouseItem.findOne({ productId: catalogData.cropName });
    let warehouseData = {};
    if (warehouseItem && warehouseItem.ipfsHash) {
      const warehouseUrl = `https://gateway.pinata.cloud/ipfs/${warehouseItem.ipfsHash}`;
      const warehouseResponse = await fetch(warehouseUrl);
      if (!warehouseResponse.ok) throw new Error('Failed to fetch warehouse IPFS data');
      warehouseData = await warehouseResponse.json();
    }

    // Structured data
    const traceabilityData = {
      farmer: {
        name: catalogData.farmerName,
        cropType: cropData.cropType || catalogData.cropName,
        quantity: cropData.quantity || catalogData.quantity,
        startDate: cropData.startDate || 'N/A',
        harvestDate: cropData.harvestDate || 'N/A',
        fertilizersUsed: cropData.fertilizersUsed || 'N/A'
      },
      distributor: {
        name: catalogData.distributorName,
        negotiationPrice: catalogData.negotiationPrice,
        deliveryDate: catalogData.deliveryDate,
        warehouse: warehouseData.productId ? {
          productId: warehouseData.productId,
          quantity: warehouseData.quantity,
          bestBefore: warehouseData.bestBefore,
          batchNumber: warehouseData.batchNumber
        } : null
      },
      shopkeeper: {
        name: orderData.shopName,
        fullName: orderData.fullName,
        address: orderData.businessAddress,
        productName: orderData.inventoryRequest.productName,
        quantity: orderData.inventoryRequest.quantity,
        price: orderData.inventoryRequest.price,
        confirmedDate: orderData.confirmationTimestamp
      }
    };

    const qrCodeUrl = `http://localhost:3000/traceability/${shopkeeperId}/${requestId}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);

    res.status(200).json({
      success: true,
      data: traceabilityData,
      qrCodeImage
    });
  } catch (error) {
    console.error('Error fetching traceability data:', error);
    res.status(500).json({ message: 'Failed to fetch traceability data', error: error.message });
  }
};

module.exports = { getTraceabilityData };