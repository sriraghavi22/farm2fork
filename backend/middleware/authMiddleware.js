// filepath: /c:/Users/22211/OneDrive/Documents/home/home/backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // ✅ Attach user data to request
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            console.error("❌ Token expired:", error);
            return res.status(401).json({ message: "Unauthorized. Token expired." });
        } else {
            console.error("❌ Invalid Token:", error);
            return res.status(401).json({ message: "Unauthorized. Token invalid or expired." });
        }
    }
};

module.exports = authMiddleware;