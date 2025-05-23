const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./../models/user');
const authMiddleware = require('./../middleware/authMiddleware');

// Use environment variable or fallback secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

// --- Signup Route ---
router.post('/signup', async (req, res) => {
  try {
    let { name, email, password, dateofbirth } = req.body;

    name = name?.trim();
    email = email?.trim();
    password = password?.trim();
    dateofbirth = dateofbirth?.trim();

    if (!name || !email || !password || !dateofbirth) {
      return res.status(400).json({ status: "failed", message: "Empty input fields" });
    }

    if (!/^[a-zA-Z\s]*$/.test(name)) {
      return res.status(400).json({ status: "failed", message: "Invalid name" });
    }

    if (!/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      return res.status(400).json({ status: "failed", message: "Invalid email" });
    }

    if (isNaN(new Date(dateofbirth).getTime())) {
      return res.status(400).json({ status: "failed", message: "Invalid date of birth" });
    }

    if (password.length < 8) {
      return res.status(400).json({ status: "failed", message: "Password too short" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ status: "failed", message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      dateofbirth: new Date(dateofbirth),
    });

    const savedUser = await newUser.save();

    res.status(201).json({ status: "success", message: "Signup successful", data: savedUser });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
});

// --- Login Route ---
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = email?.trim();
    password = password?.trim();

    if (!email || !password) {
      return res.status(400).json({ status: "failed", message: "Empty credentials" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: "failed", message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "failed", message: "Invalid email or password" });
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      status: "success",
      message: "Login successful",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: "failed", message: "Internal Server Error" });
  }
});

// --- Protected Profile Route ---
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ status: 'failed', message: 'User not found' });
    res.json({ status: 'success', data: user });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ status: 'failed', message: 'Internal Server Error' });
  }
});

module.exports = router;
