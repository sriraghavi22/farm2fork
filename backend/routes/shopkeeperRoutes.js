const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { 
  getAllShopkeepers, 
  getShopkeeperById, 
  createInventoryRequest, 
  updateInventoryStatus, 
  placePurchaseRequest,
  getDistributors,
  getShopkeeperInventory 
} = require('../controllers/shopkeeperController'); // Adjust path
const { get } = require('mongoose');
const router = express.Router();

router.get('/distributors', getDistributors);
router.get('/', getAllShopkeepers);
router.get('/:id', getShopkeeperById);
router.get('/:id/inventory', getShopkeeperInventory);
router.post('/:id/inventory', createInventoryRequest);
router.patch('/:shopkeeperId/inventory/:requestId', updateInventoryStatus);
router.post('/purchase', authenticateToken, placePurchaseRequest);
// router.get('/traceability', getTraceabilityData);

module.exports = router;