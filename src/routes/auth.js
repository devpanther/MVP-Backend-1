const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../middlewares');
const { User } = require('../models');

const router = express.Router();

// Import dotenv
require('dotenv').config()

// Get user by ID (requires 'seller' role)
router.get('/user/:id', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        const sanitizedUser = User.toJSON(user);
        res.json(sanitizedUser);
    } catch (err)
    {
        res.status(500).json({ message: err?.message });
    }
});


// Update user by ID (requires 'seller' role)
router.put('/user', validateToken(['seller']), async (req, res) =>
{
    const { username, password, role } = req.body;

    // check if at least one field is provided
    if (!username && !password && !role)
    {
        return res.status(400).json({ message: 'At least one field is required' });
    }

    try
    {
        const user = await User.findByIdAndUpdate(req.user.id, { username, password, role });
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        const sanitizedUser = User.toJSON(user);
        res.json(sanitizedUser);
    } catch (err)
    {
        if (err.code === 11000)
        {
            res.status(400).json({ message: 'Username already taken' });
        } else
        {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// Delete user by ID (requires 'seller' role)
router.delete('/user', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const user = await User.findByIdAndDelete(req.user.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err)
    {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (does not require authentication)
router.post('/user', async (req, res) =>
{
    const { username, password, role } = req.body;
    if ((!username || !password))
    {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const user = await User.findOne({ username });
    if (user)
    {
        // Check if password is correct
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
        {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

        // Check if there is an active session using the user's account
        if (user.activeSessions.length > 0)
        {
            return res.status(400).json({ error: 'There is already an active session using your account' });
        }

        // Generate JWT token and add it to activeSessions
        const token = jwt.sign({ id: user.id, role: user.role, exp: Date.now() + 900000 }, process.env.JWT_SECRET); // 15 minutes
        user.activeSessions.push(token);
        await User.save(user);

        // Return success response with token
        return res.json({ token, id: user.id });
    }

    try
    {
        // Needs role to be 'seller' or 'buyer'
        if (role !== 'seller' && role !== 'buyer')
        {
            return res.status(400).json({ message: 'New user, Invalid role' });
        }

        const user = await User.createUser({ username, password, role });

        // Generate JWT token and add it to activeSessions
        const token = jwt.sign({ id: user.id, role: user.role, exp: Date.now() + 900000 }, process.env.JWT_SECRET); // 15 minutes
        user.activeSessions.push(token);
        await User.save(user);

        res.json({ token, id: user.id });
    } catch (err)
    {
        if (err.code === 11000)
        {
            res.status(400).json({ message: 'Username already taken' });
        } else
        {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// Logout from all user accounts (requires authentication)
router.post('/logout/all', validateToken(), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if there is an active session using the user's account
        if (user.activeSessions.length === 0)
        {
            return res.status(400).json({ error: 'There is no active session using your account' });
        }

        // Check if the token is valid
        const token = req.headers.authorization.split(' ')[1];
        if (!user.activeSessions.includes(token))
        {
            return res.status(400).json({ error: 'Invalid token' });
        }

        // Remove token from activeSessions
        user.activeSessions = [];
        await User.save(user);

        // Return success response
        res.json({ message: 'Successfully logged out' });
    } catch (err)
    {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;