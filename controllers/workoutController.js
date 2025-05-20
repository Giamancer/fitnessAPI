// Dependencies and Modules
const bcrypt = require("bcrypt");
const Workout = require("../models/Workout");
const auth = require("../auth");
const { errorHandler } = auth; 

// [POST] Add Workout - /workouts/addWorkout
module.exports.addWorkout = (req, res) => {
    const { name, duration } = req.body;

    if (!name || !duration) {
        return res.status(400).json({ error: "Name and duration are required." });
    }

    const newWorkout = new Workout({
        name,
        duration,
        userId: req.user.id, // Assuming auth middleware attaches user object
        isCompleted: false
    });

    newWorkout.save()
        .then(workout => {
            res.status(201).json({
                success: true,
                data: workout
            });
        })
        .catch(error => errorHandler(error, req, res));
};

// [GET] Get My Workouts - /workouts/getMyWorkouts
module.exports.getMyWorkouts = (req, res) => {
    Workout.find({ userId: req.user.id })
        .then(workouts => {
            res.status(200).json({ success: true, data: workouts });
        })
        .catch(error => errorHandler(error, req, res));
};

// [PATCH] Update Workout - /workouts/updateWorkout/:id
module.exports.updateWorkout = (req, res) => {
    const { name, duration } = req.body;

    Workout.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { name, duration },
        { new: true }
    )
        .then(updatedWorkout => {
            if (!updatedWorkout) {
                return res.status(404).json({ error: "Workout not found or unauthorized." });
            }
            res.status(200).json({ success: true, message: "Workout updated successfully.", data: updatedWorkout });
        })
        .catch(error => errorHandler(error, req, res));
};

// [DELETE] Delete Workout - /workouts/deleteWorkout/:id
module.exports.deleteWorkout = (req, res) => {
    Workout.findOneAndDelete({ _id: req.params.id, userId: req.user.id })
        .then(deletedWorkout => {
            if (!deletedWorkout) {
                return res.status(404).json({ error: "Workout not found or unauthorized." });
            }
            res.status(200).json({ success: true, message: "Workout deleted successfully." });
        })
        .catch(error => errorHandler(error, req, res));
};

// [PATCH] Complete Workout - /workouts/completeWorkoutStatus/:id
module.exports.completeWorkoutStatus = (req, res) => {
    Workout.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { status: "complete" },
        { new: true }
    )
        .then(completedWorkout => {
            if (!completedWorkout) {
                return res.status(404).json({ error: "Workout not found or unauthorized." });
            }
            res.status(200).json({ success: true, message: "Workout marked as completed.", data: completedWorkout });
        })
        .catch(error => errorHandler(error, req, res));
};
