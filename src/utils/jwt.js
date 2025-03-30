const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    SECRET_KEY,
    { expiresIn: "7d" } // Token expires in 7 days
  );
};

// Middleware to Verify JWT Token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied! No Token Provided." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user details to request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid Token!" });
  }
};

// Middleware for Role-Based Access Control
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden! Insufficient permissions." });
    }
    next();
  };
};

module.exports = { generateToken, verifyToken, authorizeRole };
