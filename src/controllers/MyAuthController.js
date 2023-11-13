const User = require("../models/User");
const bcrypt = require("bcrypt");
const JWT = require("../JWT");
const HOST_URL = "https://metriklass-api-qgrw-dev.fl0.io";
exports.findEmail = async (req, res) => {
  try {
    const email = req.body;
    const user = await User.findOne(email);
    if (!user) {
      return res
        .status(404)
        .json({ message: `No user found for the email: ${email}` });
    }

    const token = JWT.generateJWT(user._doc);

    return res.status(200).json({
      link: HOST_URL + `/auth/reset-password/${user._id}/${token}`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 500, message: "Error finding user" });
  }
};

exports.sendEmailWithOneTimeLink = async (req, res) => {
  try {
    const { id, token } = req.params;

    if (JWT.validateJWT(token)) {
      const user = await User.findById(id);

      res.render("reset-password", { email: user._doc.email });
    } else {
      return res.status(401).json({ message: "Unauthorized response" });
    }
  } catch (error) {
    console.log(error);
    res.send("Ocurrio un error");
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password, confirm_password } = req.body;

    if (JWT.validateJWT(token)) {
      const user = await User.findById(id);

      if (password !== confirm_password) {
        return res
          .status(400)
          .json({ message: "Las contraseñas no coinciden" });
      }

      const encryptedPassword = await encryptPassword(confirm_password);

      user.password = encryptedPassword;
      await user.save();

      return res.status(200).send("Contraseña actualizada exitosamente");
    } else {
      // Token no válido
      return res.status(401).json({ message: "Respuesta no autorizada" });
    }
  } catch (error) {
    console.error(error);
    // Maneja otros errores
    res
      .status(500)
      .json({ error: "Ocurrió un error al cambiar la contraseña" });
  }
};

async function encryptPassword(password) {
  try {
    const passString = password.toString();
    const saltRounds = await bcrypt.genSalt(10); // Espera a que se resuelva la promesa de genSalt
    const passwordHash = await bcrypt.hash(passString, saltRounds);

    return passwordHash;
  } catch (error) {
    throw error;
  }
}
