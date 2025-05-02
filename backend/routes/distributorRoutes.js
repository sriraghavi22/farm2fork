const express = require("express");
const { getFarmers, getAllWarehouses, getAllCatalogs, getAllDistributors, getDistributorById, updateSustainabilty } = require("../controllers/distributorController");

const router = express.Router();

// Route to fetch farmers
router.get("/farmers", getFarmers);
router.get("/warehouses", getAllWarehouses);
router.get("/catalogs", getAllCatalogs);

// Route to fetch all distributors
router.get("/", getAllDistributors);

// Route to fetch a distributor by ID
router.get("/:id", getDistributorById);

router.put("/update-sustainability", updateSustainabilty);

module.exports = router;