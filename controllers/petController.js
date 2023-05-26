const Pet = require("../models/petsModel");
const User = require("../models/userModel");

exports.getAllPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.status(200).send(pets);
  } catch (error) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

exports.getFilteredPets = async (req, res) => {
  const filters = {};

  if (req.query.petType) {
    filters.type = req.query.petType;
  }

  if (req.query.name) {
    filters.name = new RegExp(req.query.name, "i");
  }

  if (req.query.height) {
    filters.height = parseInt(req.query.height);
  }

  if (req.query.weight) {
    filters.weight = parseInt(req.query.weight);
  }

  if (req.query.adoptionStatus) {
    filters.adoptionStatus = req.query.adoptionStatus;
  }
  try {
    const pets = await Pet.find(filters);
    res.json(pets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id });
    res.status(200).send(pet);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

exports.updatePet = async (req, res) => {
  const { userId, petId } = req.body;
  if (!petId) {
    return res.status(400).send("Missing petId");
  }
  try {
    const pet = await Pet.findOne({ _id: petId });
    if (!pet) {
      return res.status(404).send({ message: "Pet not found" });
    }
    if (pet.savedBy.includes(userId)) {
      return res.status(400).send("Pet already saved");
    }
    const isSaved = pet.savedBy.length === 0;
    await Pet.updateOne(
      { _id: petId },
      {
        $push: { savedBy: userId },
        $set: { isSaved: isSaved },
      }
    );
    const updatedUser = await User.findOne({ _id: userId });
    res
      .status(200)
      .json({ isSaved: false, message: "Pet saved successfully", updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).send(error.message);
  }
};

exports.deletePet = async (req, res) => {
  const { petId, userId } = req.body;
  if (!petId) {
    res.status(400).send("Missing petId");
  }
  try {
    await Pet.updateOne(
      { _id: petId },
      { $pull: { savedBy: userId }, $set: { isSaved: false } }
    );
    const updatedUser = await User.findOne({ _id: userId });
    res.status(200).json({
      isSaved: true,
      message: "Pet removed successfully",
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

exports.adoptPet = async (req, res) => {
  const { userId, petId } = req.body;
  let { status } = req.body;
  if (status === "foster") {
    status = "Fostered";
  }
  if (status === "adopt") {
    status = "Adopted";
  }
  try {
    const updatedPet = await Pet.updateOne(
      { _id: petId },
      {
        $set: {
          adoptionStatus: status,
          [status === "Fostered" ? "fosteredBy" : "adoptedBy"]: userId,
        },
      }
    );
    res.status(200).json({
      status,
      message: `Pet ${status} successfully`,
      updatedPet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

exports.returnPet = async (req, res) => {
  const { userId, petId } = req.body;

  try {
    const pet = await Pet.findOne({ _id: petId });
    if (!pet) return res.status(404).send({ message: "Pet not found" });
    const status = pet.adoptionStatus;
    const updatedPet = await Pet.updateOne(
      { _id: petId },
      {
        $set: {
          adoptionStatus: "Available",
        },
        $unset: { fosteredBy: "", adoptedBy: "" },
      }
    );
    return res.status(200).json({
      message: "Pet returned to the adoption center",
      updatedPet,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ message: "Error returning pet to the adoption center" });
  }
};

exports.addPet = async (req, res) => {
  const pet = req.body;
  pet.picture = req.file.path;
  try {
    const addedPet = await Pet.create(pet);
    res
      .status(200)
      .json({ status: true, message: "Pet added successfully", addedPet });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

exports.editPet = async (req, res) => {
  const { petId } = req.body;
  const petObj = req.body;
  if (!petId) return res.status(400).send({ message: "Missing petId" });
  delete petObj[petId];
  if (req.file) {
    petObj.picture = req.file.path;
  }
  try {
    const updatedPet = await Pet.updateOne({ _id: petId }, { $set: petObj });
    res.status(200).json({
      status: true,
      message: "Pet updated successfully",
      updatedPet,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};
