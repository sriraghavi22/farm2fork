const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Distributor = require("../models/Distributor");
const Shopkeeper = require("../models/Shopkeeper");
const  Farmer = require("../models/Farmer");    
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const authMiddleware = require("../middleware/authMiddleware");
// const shopId = localStorage.getItem("shopkeeperId");
// Distributor Signup API
router.post("/signup/distributor", async (req, res) => {
    try {
        const { fullName, businessName, phoneNumber, businessAddress, password } = req.body;
        
        // Validate all fields
        if (!fullName || !businessName || !phoneNumber || !businessAddress || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the phone number is already registered
        const existingDistributor = await Distributor.findOne({ phoneNumber });
        if (existingDistributor) {
            return res.status(400).json({ message: "Phone number already registered" });
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new distributor
        const newDistributor = new Distributor({
            fullName,
            businessName,
            phoneNumber,
            businessAddress,
            passwordHash: hashedPassword
        });

        await newDistributor.save();
        
        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: "7d" });
        
        res.status(201).json({ message: "Signup successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

router.post("/signup/shopkeeper", async (req, res) => {
    try {
        console.log(req.body); // Debugging
        const { fullName, shopName, phoneNumber, businessAddress, password } = req.body;
        // Validate required fields
        if (!fullName || !shopName || !phoneNumber || !businessAddress || !password) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if phone number is already registered
        const existingShopkeeper = await Shopkeeper.findOne({ phoneNumber });
        if (existingShopkeeper) {
            return res.status(400).json({ message: "Phone number already registered" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new shopkeeper
        const newShopkeeper = new Shopkeeper({
            fullName,
            shopName,
            phoneNumber,
            businessAddress,
            passwordHash: hashedPassword
        });

        await newShopkeeper.save();

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "Signup successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
router.post("/signup/farmer", async (req, res) => {
    try {
        const { fullName, phoneNumber, password ,address } = req.body;
        // Validate required fields
        if (!fullName || !phoneNumber || !password || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if phone number is already registered
        const existingFarmer = await Farmer.findOne({ phoneNumber });
        if (existingFarmer) {
            return res.status(400).json({ message: "Phone number already registered" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new farmer
        const newFarmer = new Farmer({
            fullName,
            phoneNumber,
            address,
            passwordHash: hashedPassword
        });

        await newFarmer.save();

        // Generate JWT token
        const token = jwt.sign({ phoneNumber }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({ message: "Signup successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );
};

// 🔐 Generate Refresh Token
const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "20d" }
    );
};

// 🛠️ Login API
// 🛠️ Login API
router.post("/login", async (req, res) => {
    try {
        const { phoneNumber, password } = req.body;

        console.log("Login Attempt:", { phoneNumber });

        // 🔎 Check all user collections
        let user = await Farmer.findOne({ phoneNumber });
        let role = "farmer";

        if (!user) {
            user = await Distributor.findOne({ phoneNumber });
            role = "distributor";
        }
        if (!user) {
            user = await Shopkeeper.findOne({ phoneNumber });
            role = "shopkeeper";
        }
        if (!user) {
            console.error("❌ User not found for phone number:", phoneNumber);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // 🔐 Validate Password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            console.error("❌ Incorrect password for user:", phoneNumber);
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // ✅ Generate JWT Token
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        console.log("✅ Login Successful:", { userId: user._id, role });
        user.refreshToken = refreshToken;
        await user.save();

        // 🎯 Include sustainabilityScore and sustainabilityBadge for farmers
        const userData = {
            _id: user._id,
            fullName: user.fullName,
            phoneNumber: user.phoneNumber,
            role: role
        };

        
            userData.sustainabilityScore = user.sustainabilityScore || null;
            userData.sustainabilityBadge = user.sustainabilityBadge || null;
        

        // 🔗 Blockchain Verification: Check if user exists in blockchain
        // let isRegisteredOnBlockchain = false;
        // try {
        //     if (role === "farmer") {
        //         console.log("🔗 Verifying farmer on blockchain:", user.walletAddress);
        //         isRegisteredOnBlockchain = await retailerContract.isFarmerRegistered(user.walletAddress);
        //     } else if (role === "distributor") {
        //         isRegisteredOnBlockchain = await retailerContract.isDistributorRegistered(user.walletAddress);
        //     } else if (role === "shopkeeper") {
        //         isRegisteredOnBlockchain = await retailerContract.isShopkeeperRegistered(user.walletAddress);
        //     }
        // } catch (blockchainError) {
        //     console.error("⚠ Blockchain verification failed:", blockchainError.message);
        // }

        // userData.isRegisteredOnBlockchain = isRegisteredOnBlockchain;

        res.status(200).json({ 
            accessToken,
            refreshToken,
            user: userData 
        });

    } catch (error) {
        console.error("🔥 Login Error:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// 🔄 Refresh Token API
// 🔄 Refresh Token API
router.post("/refresh", async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            console.error("No refresh token provided");
            return res.status(400).json({ message: "Refresh token is required." });
        }

        console.log("Received refresh token:", refreshToken);

        // 🔍 Verify Refresh Token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log("Decoded refresh token:", decoded);

        // 🔎 Check all user collections
        let user = await Farmer.findOne({ _id: decoded.id, refreshToken }) ||
                   await Distributor.findOne({ _id: decoded.id, refreshToken }) ||
                   await Shopkeeper.findOne({ _id: decoded.id, refreshToken });

        if (!user) {
            console.error("Invalid refresh token or user not found.");
            return res.status(403).json({ message: "Invalid refresh token." });
        }

        // ✅ Generate a new Access Token
        const accessToken = generateAccessToken(user);

        res.status(200).json({ accessToken });

    } catch (error) {
        console.error("Error in refresh token:", error.message);
        res.status(403).json({ message: "Invalid or expired refresh token." });
    }
});
// 🛠️ Get User Details
router.get("/user", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;

        let user = await Farmer.findById(userId).select("-passwordHash -refreshToken") ||
                   await Distributor.findById(userId).select("-passwordHash -refreshToken") ||
                   await Shopkeeper.findById(userId).select("-passwordHash -refreshToken");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ 
            message: "User details retrieved successfully.", 
            user 
        });

    } catch (error) {
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});


module.exports = router;
