const jwt = require("jsonwebtoken");
const userMiddleware = require("./userMiddleware");
const User = require("../models/userModel");
const Pet = require("../models/petsModel");

const findUser = async (req, res, next) => {
  const { userId, petId } = req.body;
  if (!userId) {
    return res.status(400).send({ message: "UserId missing" });
  }
  try {
    const user = await userMiddleware.FindUserById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.savedPets.includes(petId)) {
      return res.status(400).send("Pet already saved");
    }
    await User.updateOne({ _id: userId }, { $push: { savedPets: petId } });
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error updating user" });
  }
};

const updateUsersSavedPets = async (req, res, next) => {
  const { userId, petId } = req.body;
  if (!userId) {
    return res.status(400).send({ message: "UserId missing" });
  }
  try {
    await User.updateOne({ _id: userId }, { $pull: { savedPets: petId } });
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error updating user" });
  }
};

const updateUsersAdoptedPets = async (req, res, next) => {
  const { userId, petId, status } = req.body;
  if (!userId) {
    return res.status(400).send({ message: "UserId missing" });
  }
  if (!petId) {
    return res.status(400).send({ message: "PetId missing" });
  }
  try {
    if (status === "adopt") {
      await User.updateOne({ _id: userId }, { $push: { adoptedPets: petId } });
    }
    if (status === "foster") {
      await User.updateOne({ _id: userId }, { $push: { fosteredPets: petId } });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error updating user" });
  }
};

const removeUsersAdoptedPets = async (req, res, next) => {
  const { userId, petId, status } = req.body;
  if (!userId) {
    return res.status(400).send({ message: "UserId missing" });
  }
  if (!petId) {
    return res.status(400).send({ message: "PetId missing" });
  }
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { fosteredPets: petId, adoptedPets: petId } }
    );
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error updating user" });
  }
};

const findPets = async (req, res, next) => {
  const userId = req.userId;
  try {
    let pets = {};
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    pets.savedPets = await Promise.all(
      user.savedPets.map(async (id) => {
        const petCard = await Pet.findOne({ _id: id });
        return petCard;
      })
    );
    pets.adoptedPets = await Promise.all(
      user.adoptedPets.map(async (id) => {
        const petCard = await Pet.findOne({ _id: id });
        return petCard;
      })
    );
    pets.fosteredPets = await Promise.all(
      user.fosteredPets.map(async (id) => {
        const petCard = await Pet.findOne({ _id: id });
        return petCard;
      })
    );
    req.body.pets = pets;
    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  findUser,
  updateUsersSavedPets,
  updateUsersAdoptedPets,
  removeUsersAdoptedPets,
  findPets,
};
