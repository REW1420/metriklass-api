const User = require("../models/User");

exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(200).json({ mesagge: "New user added.", ...user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error adding a new user." });
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
    const user = await User.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      req.body
    );
    res.status(200).json({ mesagge: "user update.", ...user._doc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error updating users." });
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
  } catch (error) {}
};
