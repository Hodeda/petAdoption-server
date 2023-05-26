const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userMiddleware = require("../middleware/userMiddleware");
const { findPets } = require("../middleware/petMiddleware");

router.get(
  "/",
  userMiddleware.verifyToken,
  userMiddleware.isAdmin,
  userController.getAllUsers
);
router.post("/signup", userController.addNewUser);
router.post("/login", userMiddleware.isAuth, userController.login);
router.get(
  "/verify",
  userMiddleware.verifyToken,
  userController.sendUserDetails
);
router.put(
  "/update",
  userMiddleware.authenticateUser,
  userMiddleware.filterValues,
  userController.updateUser
);

router.post(
  "/passchange",
  userMiddleware.authenticateUser,
  userMiddleware.checkCurrPassword,
  userController.changePassword
);

router.get(
  "/mypets",
  userMiddleware.verifyToken,
  findPets,
  userController.getMyPets
);

module.exports = router;
