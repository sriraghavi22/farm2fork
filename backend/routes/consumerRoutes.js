const express = require('express');
const { getTraceabilityData } = require('../controllers/consumerController');
const router = express.Router();

router.get('/traceability/:shopkeeperId/:requestId', getTraceabilityData);

module.exports = router;