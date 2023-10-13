const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const users = await User.find({}); // Espera la promesa y obtiene los resultados
    const { name, email, password, occupation } = req.body;

    // Comprueba si el correo electrónico ya existe en la base de datos
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "El correo ya existe" });
    }

    const passwordHash = await encryptPassword(password);
    const user = new User({
      name,
      email,
      password: passwordHash,
      occupation,
    });
    await user.save();
    res.status(200).json({ message: "Nuevo usuario agregado", ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar un nuevo usuario" });
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
    const allUsersEmail = await User.find({ _id: { $ne: req.params.id } });

    const emailExists = await checkIfEmailExists(allUsersEmail, req.body.email);

    if (emailExists) {
      return res
        .status(401)
        .send({ message: "Este correo electronico ya esta registrado" });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "Usuario actualizado.", ...updatedUser._doc });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar usuarios." });
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

exports.updatePersonalDocs = async (req, res) => {
  const userId = req.params.userId;
  const { DUI, Antecedentes, Solvencia } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "personalDocs.DUI": DUI,
          "personalDocs.Antecedentes": Antecedentes,
          "personalDocs.Solvencia": Solvencia,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Datos personales actualizados", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar datos personales" });
  }
};

exports.updatePassword = async (req, res) => {
  const userId = req.params.userId;
  const { currentPassword, newPassword } = req.body;

  try {
    // Buscar al usuario por su ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si la contraseña actual es válida
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    // Encriptar la nueva contraseña
    const newPasswordHash = await encryptPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    user.password = newPasswordHash;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la contraseña" });
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

const checkIfEmailExists = async (allUsersEmail, newEmail) => {
  const existingEmails = allUsersEmail.map((user) => user.email);
  return existingEmails.includes(newEmail);
};
