const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");

const pss = "WilliamER1420";
const usr = "william1420";
const uri = `mongodb+srv://${usr}:${pss}@cluster0.wqlzto9.mongodb.net/?retryWrites=true&w=majority`;
//settings
const port = process.env.PORT || 3001;
app.set("json spaces", 2);

//mongodb connect
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);
mongoose
  .connect(uri)
  .then((db) => {
    console.log("Conexion a mongo exitosa");
  })
  .catch((err) => {
    console.log("Conexion a mongo rechazada", err);
  });

//middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

//routes
app.use(require('./routes/index'))

//start the server
app.listen(port, () => {
  console.log("server listening on port ", port);
});
