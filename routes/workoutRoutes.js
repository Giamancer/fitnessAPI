const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController");
const { verify } = require("../auth");

// Add Workout
router.post("/addWorkout", verify, workoutController.addWorkout);

// Get My Workouts
router.get("/getMyWorkouts", verify, workoutController.getMyWorkouts);

// Update Workout
router.patch("/updateWorkout/:id", verify, workoutController.updateWorkout);

// Delete Workout
router.delete("/deleteWorkout/:id", verify, workoutController.deleteWorkout);

// Complete Workout
router.patch("/completeWorkoutStatus/:id", verify, workoutController.completeWorkoutStatus);

module.exports = router;
