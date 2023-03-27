const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validateToken } = require('../middlewares');
const { User } = require('../models');

const router = express.Router();

// Import dotenv
require('dotenv').config()

// Get all users (requires 'seller' role)
router.get('/users', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const users = await User.find();
        res.json(users);
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user by ID (requires 'seller' role)
router.get('/users/:id', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (requires 'seller' role)
router.post('/users', validateToken(['seller']), async (req, res) =>
{
    const { username, password, deposit, role } = req.body;
    if (!username || !password || !deposit || !role)
    {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try
    {
        const user = new User({ username, password, deposit, role });
        await user.save();
        res.json(user);
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user by ID (requires 'seller' role)
router.put('/users/:id', validateToken(['seller']), async (req, res) =>
{
    const { username, password, deposit, role } = req.body;
    if (!username || !password || !deposit || !role)
    {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try
    {
        const user = await User.findByIdAndUpdate(req.params.id, { username, password, deposit, role }, { new: true });
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete user by ID (requires 'seller' role)
router.delete('/users/:id', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new user (does not require authentication)
router.post('/user', async (req, res) =>
{
    const { username, password, role } = req.body;
    if (!username || !password || !role)
    {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try
    {
        const user = new User({ username, password, deposit: 0, role });
        await user.save();
        res.json(user);
    } catch (err)
    {
        if (err.code === 11000 && err.keyPattern.username)
        {
            res.status(400).json({ message: 'Username already taken' });
        } else
        {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// Login to user account (does not require authentication)
router.post('/login', async (req, res) =>
{
    try
    {
        const { username, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ username });
        if (!user)
        {
            return res.status(400).json({ error: 'Invalid username or password' });
        }

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
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        user.activeSessions.push(token);
        await user.save();

        // Return success response with token
        res.json({ token });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout from user account (requires authentication)
router.post('/logout', validateToken(), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.userId);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove token from activeSessions
        user.activeSessions = user.activeSessions.filter((token) => token !== req.token);
        await user.save();

        // Return success response
        res.json({ message: 'Successfully logged out' });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout from all user accounts (requires authentication)
router.post('/logout/all', validateToken(), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.userId);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove token from activeSessions
        user.activeSessions = [];
        await user.save();

        // Return success response
        res.json({ message: 'Successfully logged out' });
    } catch (err)
    {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;