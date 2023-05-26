const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
};

exports.addNewUser = async (req, res) => {
  try {
    const { userFirstName, userLastName, userEmail, userPassword, userPhone } =
      req.body;

    const user = await User.findOne({ userEmail });

    if (user) {
      return res.status(401).json({
        message: "An account is already registered with the email provided.",
      });
    }

    const hashedPass = await bcrypt.hash(userPassword, 10);
    const newUser = await User.create({
      userFirstName,
      userLastName,
      userEmail,
      userPassword: hashedPass,
      userPhone,
    });

    const token = signToken(newUser._id);
    newUser.userPassword = undefined;

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

exports.login = async (req, res) => {
  const token = signToken(req.body.user._id);
  const user = req.body.user;

  user.userPassword = undefined;

  res.status(200).json({
    status: "success",
    token,
    user,
  });
};

exports.sendUserDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findOne({ _id: userId });
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.body.userId;
  const newValues = req.body.newValues;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      newValues,
      {
        new: true,
      }
    );
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).send("Error updating user");
  }
};

exports.changePassword = async (req, res) => {
  const { password, currPassword, user } = req.body;
  const hashedPass = await bcrypt.hash(password, 10);
  user.userPassword = hashedPass;
  try {
    await user.save();
    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).send("Error updating password");
  }
};

exports.getMyPets = async (req, res) => {
  const { pets } = req.body;
  try {
    res.status(200).send(pets);
  } catch (error) {
    console.log(error);
    res.status(500).send("Error getting pets");
  }
};
