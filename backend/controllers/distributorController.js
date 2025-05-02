const Farmer = require("../models/Farmer");
const Distributor = require("../models/Distributor");
const CatalogItem = require("../models/CatalogItem");
const Warehouse = require("../models/WarehouseItem");

// Controller to fetch all farmers
const getFarmers = async (req, res) => {
  console.log("reached api")
  try {
    const farmers = await Farmer.find({}, "-passwordHash -refreshToken"); // Exclude sensitive fields
    res.status(200).json(farmers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching farmers", error });
  }
};

const getAllDistributors = async (req, res) => {
  try {
    const distributors = await Distributor.find().select('-passwordHash');
    res.status(200).json(distributors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching distributors', error: error.message });
  }
};

const getDistributorById = async (req, res) => {
  try {
    const distributor = await Distributor.findById(req.params.id).select('-passwordHash');
    if (!distributor) {
      return res.status(404).json({ message: 'Distributor not found' });
    }
    res.status(200).json(distributor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching distributor', error: error.message });
  }
};

const updateSustainabilty =  async (req, res) => {
  try {
    const { score, badge, userId } = req.body;
    
    // Update the distributor's sustainability score and badge
    const updatedDistributor = await Distributor.findByIdAndUpdate(
      userId, // Assuming auth middleware adds user to request
      {
        sustainabilityScore: score,
        sustainabilityBadge: badge
      },
      { new: true }
    );

    if (!updatedDistributor) {
      return res.status(404).json({ message: "Distributor not found" });
    }

    res.json(updatedDistributor);
  } catch (error) {
    console.error("Error updating sustainability score:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCatalogs = async (req, res) => {
  try {
    const catalogs = await CatalogItem.find();
    res.status(200).json(catalogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching catalogs', error: error.message });
  }
};

const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.status(200).json(warehouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching warehouses', error: error.message });
  }
}

module.exports = { getFarmers, getAllDistributors, getDistributorById, updateSustainabilty, getAllCatalogs, getAllWarehouses };