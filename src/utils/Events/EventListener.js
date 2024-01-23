const { eventEmitter } = require("./EventEmitter");
const Log = require("../../models/Log");

eventEmitter.on("newLogTrigger", (args) => {
  const { message, origin, severity } = args;
  const newLog = new Log({
    message: message,
    origin: origin,
    severity: severity,
  });
  // Guardar el log en la base de datos
  newLog
    .save()
    .then(async (savedLog) => {
      await newLog.save();
    })
    .catch((error) => {
      console.error("Error al crear el log:", error);
    });
});
module.exports = eventEmitter;
