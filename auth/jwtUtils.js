const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '1d',
  });
};

const verifyToken = (token, secret) => {
  try {
    console.log("token ",token)
    console.log("secret ", secret)
    return jwt.verify(token, secret);
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
