const User = require("../models/User");
const Project = require("../models/Project");
const bcrypt = require("bcrypt");
const { onLogEventTrigger } = require(".././utils/Events/EventEmitter");
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
    onLogEventTrigger("Nuevo usuario agregado", "info", user);
    res.status(200).json({ message: "Nuevo usuario agregado", ...user._doc });
  } catch (error) {
    onLogEventTrigger(
      "Error al agregar nuevo usuario",
      "error",
      "Server error"
    );
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
        .send({ message: "Este correo ya esta registrado" });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      onLogEventTrigger("Usuario actualizado", "info", req.body.id);
      return res
        .status(200)
        .json({ message: "Usuario actualizado.", ...updatedUser._doc });
    }
  } catch (error) {
    onLogEventTrigger("Error al actualizar usuario", "error", "Server error");
    res.status(500).json({ error: "Error al actualizar usuarios." });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res
        .status(200)
        .json({ mesagge: `No user found with id ${req.params.id}` });
    }
    res.status(200).json(user);
  } catch (error) {
    onLogEventTrigger(
      "Error al obtener información de usuario",
      "error",
      "Server error"
    );
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
    onLogEventTrigger(
      "Error al iniciar sesión",
      "error",
      `Server error ${email}`
    );
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
    onLogEventTrigger("Datos personales actualizados", "info", user);
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar datos personales",
      "error",
      `Server error ${userId}`
    );
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
    onLogEventTrigger("Contraseña de usuario actualizada", "info", user);
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar contraseña",
      "error",
      "Server error"
    );
    res.status(500).json({ error: "Error al actualizar la contraseña" });
  }
};
exports.updatePasswordWithOutConfirmation = async (req, res) => {
  const userId = req.params.user_id;
  const { newPassword } = req.body;

  try {
    // Buscar al usuario por su ID
    const user = await User.findById(userId);

    if (!user) {
      console.error("usuario no encontrado");
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Encriptar la nueva contraseña
    const newPasswordHash = await encryptPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    user.password = newPasswordHash;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
    onLogEventTrigger("Contraseña de usuario actualizada", "info", user);
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar contraseña",
      "error",
      "Server error"
    );
    res.status(500).json({ error: "Error al actualizar la contraseña" });
  }
};

exports.DeleteUserByID = async (req, res) => {
  const userID = req.params.id;
  try {
    let user = await User.findOneAndRemove({ _id: userID }).exec();
    if (!user) {
      res.status(500).json({ error: "El usuario no existe" });
    }
    res
      .status(200)
      .json({ message: "Se ha eliminado el usuario correctamente" });
    onLogEventTrigger("Usuario eliminado", "warning", userID);
  } catch (error) {
    onLogEventTrigger("Error al eliminar usuario", "error", "Server error");
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
};
exports.addMissionCompletedCount = async (req, res) => {
  const user_id = req.params.user_id;
  try {
    let user = await User.findById(user_id);
    if (!user) {
      res.status(500).json({ error: "El usuario no existe" });
    }
    user.missionCompletedCount += 1;
    user = await user.save();
    res.status(200).json({ count: user.missionCompletedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar usuario" });
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
