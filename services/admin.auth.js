const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Customer = require('../models/admin'); // or Admin depending on your use case

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY;

const authenticate = async (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Token missing' });
  }

  try {
    // ✅ Verify and decode the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // ✅ Check if user with the email exists
    const user = await Customer.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: User not found' });
    }

    // ✅ Attach the user to req object
    req.user = user; // full user data available downstream

    next(); // proceed to next middleware/route
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = { authenticate };
