const jwt = require('jsonwebtoken');

const validateToken = (roles = []) => (req, res, next) =>
{
    const token = req.headers.authorization?.split(' ')[1]; // extract token from header

    if (!token)
    {
        return res.status(401).json({ message: 'Token not found' });
    }

    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (roles.length && !roles.includes(decoded.role))
        {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = decoded;
        next();
    } catch (error)
    {
        console.error(error);
        res.status(401).json({ message: 'Token invalid' });
    }
};

module.exports = validateToken;