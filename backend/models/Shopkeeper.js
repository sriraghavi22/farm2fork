
// const mongoose = require("mongoose");

// const InventoryRequestSchema = new mongoose.Schema({
//   productName: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   unit: { type: String, default: 'kg' },
//   price: { type: Number, required: true },
//   status: { 
//     type: String, 
//     enum: ['pending', 'confirmed', 'rejected', 'delivered'],
//     default: 'pending'
//   },
//   requestDate: { type: Date, default: Date.now }
// });
const mongoose = require("mongoose");

const InventoryRequestSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected', 'delivered'],
    default: 'pending'
  },
  requestDate: { type: Date, default: Date.now },
  distributorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Distributor' },
  distributorName: { type: String },
  catalogItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CatalogItem' },
  requestedDeliveryDate: { type: Date },
  ipfsHash: { type: String }
});

const ShopkeeperSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  shopName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  businessAddress: { type: String, required: true },
  passwordHash: { type: String, required: true },
  inventory: [InventoryRequestSchema],
  activeOrders: { type: Number, default: 0 },
  qrCodeImage: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Shopkeeper", ShopkeeperSchema);

