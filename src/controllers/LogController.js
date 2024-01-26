const Log = require("../models/Log");
const eventEmitterListener = require("../utils/Events/EventListener");
const { eliminarUsuario } = require("../utils/Events/EventEmitter");
exports.createLog = async (req, res) => {
  try {
    const { message, severity, origin } = req.body;

    const newLog = new Log({
      message,
      severity,
      origin: origin,
    });

    const savedLog = await newLog.save();

    res.status(201).json(savedLog);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find({}).sort({ created_at: -1 }); // Ordena por createdAt de manera descendente
    if (!logs || logs.length === 0) {
      return res.status(404).json({ message: "No hay logs" });
    }

    return res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
