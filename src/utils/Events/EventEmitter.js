const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

function onLogEventTrigger(message, severity, data) {
  const { origin } = data._id != undefined ? data._id : "undefined";
  const newObject = {
    message,
    severity,
    origin,
  };
  eventEmitter.emit("newLogTrigger", newObject);
}
module.exports = {
  eventEmitter,
  onLogEventTrigger,
};
