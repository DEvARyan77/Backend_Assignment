const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const Admin = require('../../models/admin');
const { withRetry } = require('../../utils/retry');

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    try {
        // 🔍 Retryable DB query
        const user = await withRetry(() => Admin.findOne({ email }));

        if (!user) {
            return res.status(401).json({ message: "No account with the email exists" });
        }

        // 🔐 Retryable bcrypt comparison
        const isMatch = await withRetry(() => bcrypt.compare(password, user.password));
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // 🔑 Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: true },
            SECRET_KEY,
            { expiresIn: '1d' }
        );

        // 🍪 Set JWT as cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // set to true in production with HTTPS
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ message: "Login successful" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error during login", error: err.message });
    }
};

module.exports = {
    loginAdmin,
};
