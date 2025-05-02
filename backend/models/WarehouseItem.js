const mongoose = require('mongoose');

const warehouseItemSchema = new mongoose.Schema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  productId: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  bestBefore: {
    type: Date,
    required: true
  },
  packaging: {
    type: String,
    required: true
  },
  batchNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'shipped'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  ipfsHash: { type: String }
});

const WarehouseItem = mongoose.model('WarehouseItem', warehouseItemSchema);
module.exports = WarehouseItem;