const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const auth = require('../middleware/authMiddleware'); // Make sure this path is correct

// Regular catalog routes
router.get('/items', catalogController.getAllCatalogItems);
router.post('/items', catalogController.addCatalogItem);
router.put('/items/:id', catalogController.updateCatalogItem);
router.delete('/items/:id', catalogController.deleteCatalogItem);
router.get('/items/farmer/:farmerId', catalogController.getCatalogItemsByFarmerId);
router.get('/farmer-crops/:farmerId', catalogController.getFarmerCrops);

// Protected routes
router.get('/distributor/:id', auth, catalogController.getCatalogItems);
router.post('/distributor/purchase', auth, catalogController.purchaseItem);

module.exports = router;