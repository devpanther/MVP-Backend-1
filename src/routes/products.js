const express = require('express');
const { validateToken } = require('../middlewares');
const { User, Product } = require('../models');

const router = express.Router();

// Get all products
router.get('/products', async (req, res) =>
{
    try
    {
        const products = await Product.find();
        res.json(products);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get product by ID
router.get('/products/:id', async (req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.id);

        if (!product)
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.json(product);
    } catch (err)
    {
        console.error(err.message);

        if (err.kind === 'ObjectId')
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(500).send('Server Error');
    }
});

// Create a product
router.post('/products', validateToken(['seller']), async (req, res) =>
{
    const { productName, cost, amountAvailable } = req.body;

    try
    {
        const user = await User.findById(req.user.id);

        if (!user)
        {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        if (user.role !== 'seller')
        {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        const product = new Product({
            productName,
            cost,
            amountAvailable,
            sellerId: req.user.id,
        });

        await product.save();

        res.json(product);
    } catch (err)
    {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update a product
router.put('/products/:id', validateToken(['seller']), async (req, res) =>
{
    const { productName, cost, amountAvailable } = req.body;

    try
    {
        const product = await Product.findById(req.params.id);

        if (!product)
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user.id)
        {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        product.productName = productName;
        product.cost = cost;
        product.amountAvailable = amountAvailable;

        await product.save();

        res.json(product);
    } catch (err)
    {
        console.error(err.message);

        if (err.kind === 'ObjectId')
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(500).send('Server Error');
    }
});

// Delete a product
router.delete('/products/:id', validateToken(['seller']), async (req, res) =>
{
    try
    {
        const product = await Product.findById(req.params.id);

        if (!product)
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user.id)
        {
            return res.status(401).json({ msg: 'Authorization denied' });
        }

        await product.remove();

        res.json({ msg: 'Product removed' });
    } catch (err)
    {
        console.error(err.message);

        if (err.kind === 'ObjectId')
        {
            return res.status(404).json({ msg: 'Product not found' });
        }

        res.status(500).send('Server Error');
    }
});

module.exports = router;