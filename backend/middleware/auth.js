const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ code: 401, message: 'Unauthorised. No token provided.'}) 

    try {
        const decryptedToken = jwt.verify(token, config.get('jwtPrivatKey'));
        req.userID = decryptedToken.id;

        next();
    } catch (err) {
        return res.status(400).json({code: 400, message: 'Bad request. Invalid token.'})
    }

}