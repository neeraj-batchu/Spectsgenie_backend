const express = require('express');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../auth/jwtUtils');
const pool = require('../config/db'); // Import the MySQL pool

const router = express.Router();

// Mock user database
const users = [
  { id: 1, username: 'user1', password: '$2b$10$zc8jg8kCO7iTruxAaebClupEoEPySq/BGPeBa/EIOBVI1IGLz.0la', role: 'user' }, // password: 'test123'
];

// Login API
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log("Request body:", req.body); // Log request body

  const user = users.find((u) => u.username === username);

  console.log("Found user:", user); // Log the user found

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  console.log("Password match result:", passwordMatch); // Log the bcrypt compare result

  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  try {
    // Save tokens into the authentication_details table using raw SQL query
    const [results] = await pool.execute(
      `INSERT INTO authentication_details (user_name, token, refresh_token, created_date_time, updated_date_time) 
      VALUES (?, ?, ?, NOW(), NOW())`,
      [user.username, accessToken, refreshToken]
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving tokens to the database' });
  }
});

// Logout API
router.post('/logout', async (req, res) => {
  const { username, refreshToken } = req.body;

  console.log("Request body:", req.body); // Log request body

  try {
    // Delete the tokens from the database for the specified user
    const [results] = await pool.execute(
      `DELETE FROM authentication_details WHERE user_name = ? AND refresh_token = ?`,
      [username, refreshToken]
    );

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'No matching session found to log out' });
    }

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error logging out' });
  }
});

module.exports = router; 
