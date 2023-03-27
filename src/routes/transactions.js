const express = require('express');
const { validateToken } = require('../middlewares');
const { User, Product, Transaction } = require('../models');

const router = express.Router();

// Deposit coin (requires 'buyer' role)
router.post('/deposit', validateToken(['buyer']), async (req, res) =>
{
    const { coin } = req.body;
    const validCoins = [5, 10, 20, 50, 100];

    if (!validCoins.includes(coin))
    {
        return res.status(400).json({ error: 'Invalid coin value. Only 5, 10, 20, 50 and 100 cents coins are accepted.' });
    }

    try
    {
        const user = await User.findById(req.user.id);
        user.deposit += coin;
        await user.save();
        res.json({ deposit: user.deposit });
    } catch (error)
    {
        console.error(error);
        res.status(500).json({ error: 'Could not deposit coin.' });
    }
});

// Buy product (requires 'buyer' role)
router.post('/buy', validateToken(['buyer']), async (req, res) =>
{
    const { productId, amount } = req.body;

    try
    {
        const product = await Product.findById(productId);

        if (!product)
        {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (amount <= 0 || !Number.isInteger(amount))
        {
            return res.status(400).json({ error: 'Amount should be a positive integer' });
        }

        const user = await User.findById(req.user.id);

        if (user.deposit < product.cost * amount)
        {
            return res.status(400).json({ error: 'Not enough deposit to complete the transaction' });
        }

        let change = user.deposit - product.cost * amount;
        const coins = [100, 50, 20, 10, 5];
        const changeCoins = [];

        for (let coin of coins)
        {
            while (change >= coin)
            {
                changeCoins.push(coin);
                change -= coin;
            }
        }

        // Reduce buyer deposit
        user.deposit -= product.cost * amount
        await user.save();

        const transaction = new Transaction({
            userId: req.user.id,
            productId,
            amount,
            totalSpent: product.cost * amount,
            change: changeCoins
        });

        await transaction.save();

        return res.status(200).json({ transaction });
    } catch (err)
    {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /reset (WARNING: This will reset all users' deposit to 0)
router.post('/reset', validateToken(['buyer']), async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id);
        if (!user)
        {
            return res.status(404).json({ message: 'User not found' });
        }

        // Reset user's deposit to 0
        user.deposit = 0;
        await user.save();

        return res.status(200).json({ message: 'Deposit reset successfully' });
    } catch (err)
    {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;