//[SECTION] Dependencies and Modules
const express = require('express');
const userController = require('../controllers/userController');
const { verify } = require("../auth");
// const passport = require("passport");

//[SECTION] Routing Component
const router = express.Router();

// Register User
router.post("/register", userController.registerUser);

// Login User
router.post("/login", userController.loginUser);

// Retrieve User Details
router.get("/details", verify, userController.retrieveUserDetails);

// Set as Admin
router.patch("/:userId/set-as-admin", verify, userController.setAsAdmin);

// Update Password
router.patch("/update-password", verify, userController.updatePassword);

module.exports = router;


