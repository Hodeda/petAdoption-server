const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.FindUserById = async (userId) => {
  const user = await User.findOne({ _id: userId });
  if (!user) {
    return;
  }
  return user;
};

exports.isAuth = async (req, res, next) => {
  const { userEmail, userPassword } = req.body;

  const user = await User.findOne({ userEmail }).select("+userPassword");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordMatch = await bcrypt.compare(userPassword, user.userPassword);
  if (!isPasswordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  req.body.user = user;
  next();
};

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }
    const userIdHeaderField = "useridentifier";
    if (req.headers[userIdHeaderField]) {
      req.userId = req.headers[userIdHeaderField];
    } else {
      req.userId = decoded.id;
    }
    next();
  });
};

exports.authenticateUser = (req, res, next) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).send("Token missing");
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid token");
    }
    if (decoded) {
      req.body.userId = decoded.id;
      next();
    }
  });
};

exports.filterValues = (req, res, next) => {
  const { email, firstName, lastName, phoneNumber, bio } = req.body.formValues;
  const newValues = {};
  if (email) {
    newValues.userEmail = email;
  }

  if (firstName) {
    newValues.userFirstName = firstName;
  }

  if (lastName) {
    newValues.userLastName = lastName;
  }

  if (phoneNumber) {
    newValues.userPhone = phoneNumber;
  }

  if (bio) {
    newValues.bio = bio;
  }
  req.body.newValues = newValues;
  next();
};

exports.checkCurrPassword = async (req, res, next) => {
  const { currPassword, userId } = req.body;
  if (!userId) {
    return res.status(400).send("User id missing");
  }
  const result = await User.findOne({ _id: userId }).select("+userPassword");
  try {
    const isPasswordMatch = await bcrypt.compare(
      currPassword,
      result.userPassword
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }
    req.body.user = result;
    next();
  } catch (error) {
    console.log(err);
    return res.status(500).send("Server error");
  }
};

exports.isAdmin = async (req, res, next) => {
  const { userId } = req;
  try {
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findOne({ _id: userId });
    if (user.isAdmin) {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};
