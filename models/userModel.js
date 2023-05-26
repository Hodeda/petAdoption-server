const mongoose = require("mongoose");

const usersSchema = new mongoose.Schema({
  userFirstName: String,
  userLastName: String,
  userEmail: {
    type: String,
    unique: true,
  },
  userPassword: {
    type: String,
    select: false,
  },
  userPhone: String,
  savedPets: [],
  bio: String,
  adoptedPets: [],
  fosteredPets: [],
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("User", usersSchema);
module.exports = User;
