const mongoose = require("mongoose");
const petSchema = new mongoose.Schema({
  type: String,
  name: String,
  adoptionStatus: String,
  picture: String,
  height: Number,
  weight: Number,
  color: String,
  bio: String,
  hypoallergnic: Boolean,
  dietery: Array,
  breed: String,
  id: String,
  isSaved: {
    type: Boolean,
    default: false,
  },
  savedBy: [],
  fosteredBy: String,
  adoptedBy: String,
});

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;
