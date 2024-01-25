const UserAdmin = require("../models/UserAdmin");
const bcrypt = require("bcrypt");
const {
  onUserAdminCreate,
  onLogEventTrigger,
} = require(".././utils/Events/EventEmitter");
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
    // Dispara evento cuando un usuario admin es creado
    onLogEventTrigger("Usuario administrador creado", "info", user);
    res
      .status(200)
      .json({ message: "Nuevo usuario administrador creado", ...user._doc });
  } catch (error) {
    onLogEventTrigger(
      "Error al agregar un nuevo usuario",
      "error",
      "Server error"
    );
    res.status(500).json({ error: "Error al agregar un nuevo usuario" });
  }
};

exports.getAllAdminUser = async (req, res) => {
  try {
    const adminUsers = await UserAdmin.find({});
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({ message: "No hay usuarios que mostrar" });
    }

    res.status(200).json({ adminUsers });
  } catch (error) {
    onLogEventTrigger("Error al obtener usuarios", "error", "Server error");
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
    // Dispara evento cuando un usuario admin es creado
    onLogEventTrigger(
      `Usuario administrador ${
        req.body.active ? "Habilitado" : "Deshabilitado"
      }`,
      "warning",
      userAdmin
    );
    return res.status(200).json({ userAdmin });
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar estado del usuarios",
      "error",
      "Server error"
    );
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
    onLogEventTrigger("Error al iniciar sesión", "error", "Server error");
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

exports.getActiveStatus = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const userAdmin = await UserAdmin.findById(user_id);
    if (!userAdmin) {
      return res.status(404).json("No existe el usuario");
    }

    return res.status(200).json({ isActive: userAdmin.active });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener estado" });
  }
};
exports.deleteAdminUserByID = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const user = await UserAdmin.findByIdAndDelete(user_id);
    if (!user) {
      return res.status(404).json({ message: "El usuario no existe" });
    }
    res.status(200).json({
      message: `Se ha eliminado correctamente
    el usuario `,
    });

    onLogEventTrigger("Usuario administrador eliminado", "alert", user);
  } catch (error) {
    onLogEventTrigger(
      "Error al eliminar usuario administrador",
      "error",
      "Server error"
    );
    res.status(500).json({ error: "Error al eliminar usuario administrador" });
  }
};
exports.updateInfo = async (req, res) => {
  try {
    const allUsersEmail = await UserAdmin.find({
      _id: { $ne: req.params.user_id },
    });

    const emailExists = await checkIfEmailExists(allUsersEmail, req.body.email);

    if (emailExists) {
      return res
        .status(401)
        .send({ message: "Este correo ya esta registrado" });
    } else {
      const updatedUser = await UserAdmin.findByIdAndUpdate(
        req.params.user_id,
        req.body,
        { new: true }
      );

      // Dispara evento cuando un usuario admin es creado
      onLogEventTrigger(
        "Usuario administrador actualizado",
        "info",
        updatedUser
      );
      return res
        .status(200)
        .json({ message: "Usuario actualizado.", ...updatedUser._doc });
    }
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar usuario administrador",
      "error",
      "Server error"
    );
    res.status(500).json({ error: "Error al actualizar usuarios." });
  }
};
exports.updaterAdminPassword = async (req, res) => {
  const user_id = req.params.user_id;
  const { newPassword } = req.body;

  try {
    // Buscar al usuario por su ID
    const user = await UserAdmin.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Encriptar la nueva contraseña
    const newPasswordHash = await encryptPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    user.password = newPasswordHash;
    await user.save();
    // Dispara evento cuando un usuario admin es creado
    onLogEventTrigger(
      "Usuario administrador contraseña actualizada",
      "warning",
      user
    );
    res.status(200).json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    onLogEventTrigger(
      "Error al actualizar contraseña de administrador",
      "error",
      "Server error"
    );
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
