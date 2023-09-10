const jwt = require("jsonwebtoken");

function generateJWT(payload) {
  return jwt.sign(payload, "secret", { expiresIn: "1h" });
}

function validateJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, "secret", (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function test() {
  const token =
    "sInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMiIsIm5hbWUiOiJ1c2VyNSIsImlhdCI6MTY5MjQyNjkwNiwiZXhwIjoxNjkyNDMwNTA2fQ.ieZ8ALw07b-Fj6ZhRwmygbubcWhdjQX51EFJC60Mk3o";
  const isValid = await validateJWT(token);
  if (isValid) {
    console.log("El token es válido");
  } else {
    console.log("El token no es válido");
  }
}

module.exports = {
  generateJWT,
  validateJWT,
};
