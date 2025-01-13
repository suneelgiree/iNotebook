const jwt = require('jsonwebtoken');// Import jsonwebtoken


const fetchuser = (req, res, next) => {
    // Get the user from the JWT and add id to req object
    const token = req.header('auth-token');// Get the token from the header
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" });// Check if no token is provided
    }

    try {
        const data = jwt.verify(token, 'shhhhh');// Verify the token
        console.log('Data:', data);
        req.user = {id: data.user};// Add user id to req object
        next(); // Move to the next middleware
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token" }); // Check if token is invalid
    }
}

module.exports = fetchuser;
