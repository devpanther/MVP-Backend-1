const express = require('express');
const mongoose = require('mongoose');
// Import dotenv
require('dotenv').config()

const app = express();

// Set the content type to "application/json"
app.use(express.json());

// Connect to the database


// Routes
app.use('/api/trade', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

const server = app.listen(process.env.PORT, () =>
{
    console.log(`Server listening on port ${process.env.PORT}`);
});

module.exports = server;
