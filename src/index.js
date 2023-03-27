const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Set the content type to "application/json"
app.use(express.json());

// Middleware for validating tokens
const validateToken = (req, res, next) =>
{
    const authHeader = req.headers.authorization;
    if (authHeader)
    {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, user) =>
        {
            if (err)
            {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else
    {
        res.sendStatus(401);
    }
};

app.listen(3000, () =>
{
    console.log('Server listening on port 3000');
});