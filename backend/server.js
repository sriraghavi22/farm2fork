require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Route imports
const authRoutes = require("./routes/auth");
const farmerRoutes = require("./routes/farmerRoutes");
const distributorRoutes = require("./routes/distributorRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const shopkeeperRoutes = require("./routes/shopkeeperRoutes");
const warehouseRoutes = require("./routes/warehouseRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
const consumerRoutes = require('./routes/consumerRoutes');
app.use('/api', consumerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/distributor", distributorRoutes);
app.use("/api/distributor/catalog", catalogRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/shopkeeper", shopkeeperRoutes);
app.use("/api", warehouseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🛠 Loaded Routes");
});