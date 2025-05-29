const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Customer = require('../../models/customer');
const { withRetry } = require('../../utils/retry');

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await withRetry(() => Customer.findOne({ email }));
    if (!user) {
      return res.status(401).json({ message: "No account with the email exists" });
    }

    const isMatch = await withRetry(() => bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error during login", error: err.message });
  }
};

const signupCustomer = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  try {
    const existingUser = await withRetry(() => Customer.findOne({ email }));
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await withRetry(() => bcrypt.hash(password, 10));

    const newUser = new Customer({
      name,
      email,
      password: hashedPassword
    });

    await withRetry(() => newUser.save());

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      SECRET_KEY,
      { expiresIn: '1d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    });

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error during signup", error: err.message });
  }
};

module.exports = {
  loginCustomer,
  signupCustomer
};
