const jwt = require("jsonwebtoken");
require("dotenv").config();

function generateJWT(payload) {
  return jwt.sign(payload, process.env.SECRET, { expiresIn: "15m" });
}


function validateJWT(token) {
  try {
    jwt.verify(token, process.env.SECRET);
    return true; // If verification is successful, return true
  } catch (error) {
    return false; // If verification fails, return false
  }
}

module.exports = {
  generateJWT,
  validateJWT,
};
