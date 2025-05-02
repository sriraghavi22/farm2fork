// routes/warehouse.js
const express = require('express');
const router = express.Router();
const {
  createWarehouse,
  getWarehouses,
  getWarehouseById,
  updateWarehouse
} = require('../controllers/warehouseController');

const {
  addWarehouseItem,
  getWarehouseItems,
  getItemsByWarehouse
} = require('../controllers/warehouseItemController');

// Warehouse routes
router.post('/warehouses', createWarehouse);
router.get('/warehouses', getWarehouses);
router.get('/warehouses/:id', getWarehouseById);
router.put('/warehouses/:id', updateWarehouse);

// Warehouse items routes
router.post('/warehouse-items', addWarehouseItem);
router.get('/warehouse-items', getWarehouseItems);
router.get('/warehouses/:warehouseId/items', getItemsByWarehouse);

module.exports = router;