//[SECTION] Dependencies and Modules
const bcrypt = require("bcrypt");
const User = require('../models/User');
const auth = require("../auth");
const { errorHandler } = auth;


//User Registration
module.exports.registerUser = (req, res) => {

    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        return res.status(400).send({ message: 'Email invalid' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        return res.status(400).send({ message: 'Mobile number invalid' });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        return res.status(400).send({ message: 'Password must be atleast 8 characters' });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};


//User Login
module.exports.loginUser = (req, res) => {
    if(req.body.email.includes("@")){
        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                return res.status(404).send({ message: 'No email found' });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    return res.status(200).send({ 
                        message: 'User logged in successfully',
                        access : auth.createAccessToken(result)
                        });
                } else {
                    return res.status(401).send({ message: 'Email and password do not match' });
                }
            }
        })
        .catch(error => errorHandler(error, req, res)); 
    } else {
        res.status(400).send({ message: 'Invalid email' });
    }
    
};

// Retrieve User Details
module.exports.retrieveUserDetails = (req, res) => {
    return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(404).send({ message: 'user not found' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

// Set as Admin
module.exports.setAsAdmin = (req, res) => {
    // Check if the requesting user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const userId = req.params.userId;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
    }

    // Find the user and update their isAdmin status
    User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            // Ensure password is hidden before sending response
            updatedUser.password = "";

            return res.status(200).json({ updatedUser });
        })
        .catch(error => {
            res.status(500).json({
                error: "Failed in Find",
                details: {
                    stringValue: error.stringValue || "",
                    valueType: typeof userId,
                    kind: error.kind || "ObjectId",
                    path: error.path || "_id",
                    reason: error.reason || {},
                    name: error.name || "Error",
                    message: error.message
                }
            });
        });
};

// Update Password
module.exports.updatePassword = (req, res) => {
    const userId = req.user.id;
    const { newPassword } = req.body;

    // Check if the new password is provided and meets requirements
    if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Hash the new password
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Update the user's password in the database
    User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true })
        .then(updatedUser => {
            if (!updatedUser) {
                return res.status(404).json({ error: "User not found" });
            }

            res.status(201).json({ message: "Password reset successfully" });
        })
        .catch(error => {
            res.status(500).json({ error: "Failed to update password", details: error.message });
        });
};
