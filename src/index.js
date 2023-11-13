const express = require("express");
const app = express();
const path = require('path');
const morgan = require("morgan");
const bodyParse = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
let isDBReady = false;
let isServerReady = false;

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
    isDBReady = true;
  })
  .catch((err) => {
    console.log("Conexion a mongo rechazada", err);
    isDBReady = false;
  });

//middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//routes
app.use(require("./routes/index"));

//start the server
app.listen(port, (err) => {
  if (err) {
    console.log("Server got error ", err);
    isServerReady = false;
  }
  console.log("server listening on port ", port);
  isServerReady = true;
});

app.get("/status", (req, res) => {
  if (isDBReady && isServerReady) {
    const data = {
      isOnline: true,
      message: "API running",
    };

    res.status(200).json(data);
  } else {
    const data = {
      isOnline: false,
      message: "API not runnig",
    };

    res.status(200).json(data);
  }
});
