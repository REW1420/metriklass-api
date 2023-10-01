const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const passwordHash = await encryptPassword(password);
    const user = new User({
      name,
      email,
      password: passwordHash,
    });
    await user.save();
    res.status(200).json({ mesagge: "New user added.", ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding a new user." });
  }
};

exports.test = async (req, res) => {
  try {
    const users = await User.find({}); // Espera la promesa y obtiene los resultados
    res.status(200).json(users); // Envia los usuarios encontrados
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting users." });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      req.body
    );
    res.status(200).json({ mesagge: "user update.", ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating users." });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res
        .status(200)
        .json({ mesagge: `No user found wiht id ${req.params.id}` });
    }
    res.status(200).json(user);
  } catch (error) {
    console.log("ERROR", error);
  }
};

exports.getLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const profile = await User.findOne({ email });

    if (!profile) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isPasswordValid = await bcrypt.compare(password, profile.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    res.status(200).json({ message: "Inicio de sesión exitoso", profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al iniciar sesión" });
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
