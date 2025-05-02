const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const catalogItemSchema = new Schema({
  farmerId: {
    type: Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  distributorId: {
    type: Schema.Types.ObjectId,
    ref: 'Distributor',
    required: true
  },
  distributorName: {
    type: String,
    required: true
  },
  cropName: {
    type: String, 
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  negotiationPrice: {
    type: Number,
    required: true,
    min: 0
  },
  negotiatedDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  farmerRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'delivered', 'canceled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  ipfsHash: { type: String }
});

catalogItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CatalogItem', catalogItemSchema);
