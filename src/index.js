const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// Set the content type to "application/json"
app.use(express.json());


app.listen(3000, () =>
{
    console.log('Server listening on port 3000');
});