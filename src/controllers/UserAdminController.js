const UserAdmin = require("../models/UserAdmin");
const bcrypt = require("bcrypt");
exports.createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Comprueba si el correo electrónico ya existe en la base de datos
    const existingAdminUser = await UserAdmin.findOne({ email });
    if (existingAdminUser) {
      return res
        .status(409)
        .json({ message: "El correo ya existe, no se puede usar" });
    }

    const passwordHash = await encryptPassword(password);

    const user = new UserAdmin({
      name,
      email,
      password: passwordHash,
    });
    await user.save();
    res
      .status(200)
      .json({ message: "Nuevo usuario administrador creado", ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar un nuevo usuario" });
  }
};

exports.getAllAdminUser = async (req, res) => {
  try {
    const adminUsers = await UserAdmin.find({});
    if (!adminUsers) {
      return res.status(404).json({ message: "No hay usuarios que mostrar" });
    }

    return res.status(200).json({ adminUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
};

exports.updateAdminUserActive = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const isActive = req.body.isActive;

    const userAdmin = await UserAdmin.findByIdAndUpdate(
      user_id,
      {
        updated_at: new Date(),
        ...req.body,
      },
      { new: true }
    );

    if (!userAdmin)
      return res.status(404).json({ message: `Usuario no encontrado` });

    return res.status(200).json({ userAdmin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar estado del usuarios" });
  }
};

exports.updateAdminInfo = async function encryptPassword(password) {
  try {
    const passString = password.toString();
    const saltRounds = await bcrypt.genSalt(10); // Espera a que se resuelva la promesa de genSalt
    const passwordHash = await bcrypt.hash(passString, saltRounds);

    return passwordHash;
  } catch (error) {
    throw error;
  }
};

exports.getAdminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const profile = await UserAdmin.findOne({ email });

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
