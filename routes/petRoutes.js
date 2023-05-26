const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const userMiddleware = require("../middleware/userMiddleware");
const {
  findUser,
  updateUsersSavedPets,
  updateUsersAdoptedPets,
  removeUsersAdoptedPets,
} = require("../middleware/petMiddleware");

const { upload } = require("../middleware/imageMiddleware");

router.get("/", petController.getAllPets);
router.get("/advanced", petController.getFilteredPets);
router.get("/:id", petController.getPetById);
router.put(
  "/:id/save",
  userMiddleware.authenticateUser,
  findUser,
  petController.updatePet
);
router.put(
  "/:id/unsave",
  userMiddleware.authenticateUser,
  updateUsersSavedPets,
  petController.deletePet
);

router.put(
  "/:id/adopt",
  userMiddleware.authenticateUser,
  updateUsersAdoptedPets,
  petController.adoptPet
);

router.put(
  "/:id/return",
  userMiddleware.authenticateUser,
  removeUsersAdoptedPets,
  petController.returnPet
);

router.post(
  "/addpet",
  userMiddleware.verifyToken,
  userMiddleware.isAdmin,
  upload.single("picture"),
  petController.addPet
);

router.put(
  "/editpet",
  userMiddleware.verifyToken,
  userMiddleware.isAdmin,
  upload.single("picture"),
  petController.editPet
);

module.exports = router;
