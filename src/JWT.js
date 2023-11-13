const jwt = require("jsonwebtoken");

function generateJWT(payload) {
  return jwt.sign(payload, "secret", { expiresIn: "15m" });
}

function validateJWT(token) {
  try {
    jwt.verify(token, "secret");
    return true; // If verification is successful, return true
  } catch (error) {
    return false; // If verification fails, return false
  }
}

module.exports = {
  generateJWT,
  validateJWT,
};
