const User = require("../models/User");
const bcrypt = require("bcrypt");
const JWT = require("../JWT");
require("dotenv").config();
const nodemailer = require("nodemailer");

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
    const link =
      process.env.HOST_URL + `/auth/reset-password/${user._id}/${token}`;
    await sendOneTimeEmail(user._doc.email, link);
    return res.status(200).json({
      link: process.env.HOST_URL + `/auth/reset-password/${user._id}/${token}`,
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

function sendOneTimeEmail(userEmail, link) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "Recuperacion de contraseña",
    text: `Ingrese al link para poder restaurar su contraseña, el link solo durara 15 minutos. ${link}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
    } else {
      console.log("Correo enviado:", info.response);
    }
  });
}
