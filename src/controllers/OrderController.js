const Order = require("../models/Order");
const jwtUtils = require("../JWT");

exports.list = async (req, res) => {
  const token = req.query.token;

  try {
    const isValid = await jwtUtils.validateJWT(token);

    if (!isValid) {
      return res.status(401).json({ message: "Unauthorized request" });
    } else {
      const order = await Order.find({});
      res.json(order);
    }
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};

exports.show = async (req, res) => {
  try {
    const order = await Order.findOne({ id: req.params.id });
    if (!order) return res.status(404).send("No existe el pedido con ese ID.");
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};
exports.add = async (req, res) => {
  const token = req.query.token;

  try {
    const isValid = await jwtUtils.validateJWT(token);

    if (!isValid) {
      return res.status(401).json({ message: "Unauthorized request" });
    } else {
      const order = new Order(req.body);
      await order.save();
      res.json({ message: "new order added" });
    }
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        id: req.params.id,
      },
      req.bodya
    );
    res.json({ message: "Order updated" }, order);
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};
exports.delete = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({ id: req.params.id });
    res.json({ message: "Order deleted" }, order);
  } catch (error) {
    console.log(error);
    res.status(501).send({
      message: "Error al realizar la petición",
    });
  }
};
