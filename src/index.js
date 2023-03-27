const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Connect to the database
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch(err => console.error(err));

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
