const jwt = require('jsonwebtoken');
// Import dotenv
require('dotenv').config()
const { User } = require('../models');

const validateToken = (roles = []) => async (req, res, next) =>
{
    const token = req.headers.authorization?.split(' ')[1]; // extract token from header

    if (!token)
    {
        return res.status(401).json({ message: 'Token not found' });
    }

    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        /// Check if token is expired
        if (decoded.exp < Date.now())
        {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Check if user has the required role

        if (roles.length && !roles.includes(decoded.role))
        {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const user = await User.findById(decoded.id);

        // check if token matches any of the user's active sessions
        if (!user.activeSessions.includes(token))
        {
            return res.status(401).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    } catch (error)
    {
        res.status(401).json({ message: 'Token invalid' });
    }
};

module.exports = validateToken;