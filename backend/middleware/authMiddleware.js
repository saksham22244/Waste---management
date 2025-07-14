// middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  const rawAuth = req.header('Authorization');
  console.log('Incoming Auth Header:', rawAuth);

  // Validate if the Authorization header has a Bearer token
  if (!rawAuth || !rawAuth.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Access Denied. Invalid token format.' });
  }

  // Extract the token part after "Bearer "
  const token = rawAuth.replace('Bearer ', '');

  try {
    // Decode and verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Check if the token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }

    // Check if user exists based on the decoded userId
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user object to the request object
    req.user = user;
    console.log('Authenticated User:', req.user);

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    console.error('Error in authMiddleware:', err.message);

    // Handle specific error types
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Unauthorized. Invalid token.' });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please login again.' });
    }

    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
  }
};

module.exports = authMiddleware;
