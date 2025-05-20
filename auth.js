const jwt = require("jsonwebtoken");
// [SECTION] Environment Setup
// import our .env for environment variables
require('dotenv').config();

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

//[Section] Token Creation
/*
Analogy
    Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {
    // The data will be received from the registration form
    // When the user logs in, a token will be created with user's information
    const data = {
        id : user._id,
        email : user.email,
        isAdmin : user.isAdmin
    };

    // Generate a JSON web token using the jwt's sign method
    // Generates the token using the form data and the secret code with no additional options provided
    // SECRET_KEY is a User defined string data that will be used to create our JSON web tokens
    // Used in the algorithm for encrypting our data which makes it difficult to decode the information without the defined secret keyword
    //Since this is a critical data, we will use the .env to secure the secret key. "Keeping your secrets secret".
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
    
};

//[SECTION] Token Verification
/*
Analogy
    Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function. Middlewares will be further elaborated on later sessions.
*/

module.exports.verify = (req, res, next) => {
    console.log("Authorization header:", req.headers.authorization);

    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        console.log("No token provided in the request.");
        return res.send({ auth: "Failed. No Token" });
    } else {
        console.log("Received token:", token);     
        token = token.slice(7, token.length); // Remove the 'Bearer ' prefix
        console.log("Token after slicing:", token);

        // Validate the token using JWT_SECRET_KEY
        jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {
            if (err) {
                console.error("JWT verification failed:", err.message); // Log error message
                return res.status(403).send({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                console.log("Decoded token data:", decodedToken); // Log the decoded token

                // Add the decoded token data to the request object for further use
                req.user = decodedToken;

                // Proceed to the next middleware or route handler
                next();
            }
        });
    }
};

//[SECTION] Verify Admin

// The "verifyAdmin" method will only be used to check if the user is an admin or not.
// The "verify" method should be used before "verifyAdmin" because it is used to check the validity of the jwt. Only when the token has been validated should we check if the user is an admin or not.
// The "verify" method is also the one responsible for updating the "req" object to include the "user" details/decoded token in the request body.
// Being an ExpressJS middleware, it should also be able to receive the next() method.

module.exports.verifyAdmin = (req, res, next) => {

    // console.log("result from verifyAdmin method");
    // console.log(req.user);

    // Checks if the owner of the token is an admin.
    if(req.user.isAdmin){
        // If it is, move to the next middleware/controller using next() method.
        next();
    } else {
        // Else, end the request-response cycle by sending the appropriate response and status code.
        return res.status(403).send({
            auth: "Failed",
            message: "Action Forbidden"
        })
    }
}


// [SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {
    // Log the error
    console.error(err);

    // it ensures there's always a clear error message, either from the error itself or a fallback
    const statusCode = err.status || 500;
    const errorMessage = err.message || 'Internal Server Error';

    // Send a standardized error response
    //We construct a standardized error response JSON object with the appropriate error message, status code, error code, and any additional details provided in the error object.
    res.status(statusCode).json({
        error: {
            message: errorMessage,
            errorCode: err.code || 'SERVER_ERROR',
            details: err.details || null
        }
    });
};