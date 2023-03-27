const express = require('express');
const mongoose = require('mongoose');
// Import dotenv
require('dotenv').config()

const app = express();

// Set the content type to "application/json"
app.use(express.json());

// Connect to the database
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Database connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/trade', require('./routes/products'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));

app.listen(process.env.PORT, () =>
{
    console.log(`Server listening on port ${process.env.PORT}`);
});