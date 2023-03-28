const express = require('express');
const { validateToken } = require('../middlewares');
const { User, Product } = require('../models');

const router = express.Router();

// Get all products
router.get('/products', validateToken(), async (req, res) =>
{
    try
    {
        const products = await Product.find();
        res.json(products);
    } catch (err)
    {
        res.status(500).send('Server Error');
    }
});

// Get product by ID
router.get('/products/:id', validateToken(), async (req, res) =>
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
        if (err.code === 11000)
        {
            res.status(400).json({ message: err?.message });
        } else
        {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// Create a product
router.post('/products', validateToken(['seller']), async (req, res) =>
{
    const { productName, cost, quantity } = req.body;

    // Simple validation
    if (!productName)
    {
        return res.status(400).json({ error: 'Product name is required' });
    }

    if (!cost)
    {
        return res.status(400).json({ error: 'Cost is required' });
    }

    // Check if cost is a number and greater than 0
    if (isNaN(cost) || cost <= 0)
    {
        return res.status(400).json({ error: 'Cost must be a number greater than 0' });
    }

    if (!quantity)
    {
        return res.status(400).json({ error: 'Quantity is required' });
    }

    // Check if amount available is a number and greater than 0
    if (isNaN(quantity) || quantity <= 0)
    {
        return res.status(400).json({ error: 'Quantity must be a number greater than 0' });
    }

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

        const product = await Product.createProduct({
            productName,
            cost,
            amountAvailable: quantity,
            sellerId: req.user.id,
        });

        res.json({ product, message: 'Product successfully created' });
    } catch (err)
    {
        if (err.code === 11000)
        {
            res.status(400).json({ message: err?.message });
        } else
        {
            res.status(500).json({ message: 'Something went wrong' });
        }
    }
});

// Update a product
router.put('/products/:id', validateToken(['seller']), async (req, res) =>
{
    const { productName, cost, quantity } = req.body;

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

        // Simple validation

        if (productName)
        {
            product.productName = productName;
        }

        if (cost)
        {
            // Check if cost is a number and greater than 0
            if (isNaN(cost) || cost <= 0)
            {
                return res.status(400).json({ error: 'Cost must be a number greater than 0' });
            }

            product.cost = cost;
        }

        if (quantity)
        {
            // Check if amount available is a number and greater than 0
            if (isNaN(quantity) || quantity <= 0)
            {
                return res.status(400).json({ error: 'Quantity must be a number greater than 0' });
            }

            product.amountAvailable = quantity;
        };

        let newProduct = await Product.findByIdAndUpdate(req.params.id, product);

        res.json({ product: newProduct, message: 'Product successfully updated' });
    } catch (err)
    {
        if (err.code === 11000)
        {
            return res.status(400).json({ message: err?.message });
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

        await Product.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Product removed' });
    } catch (err)
    {
        if (err.code === 11000)
        {
            return res.status(400).json({ message: err?.message });
        }

        res.status(500).send('Server Error');
    }
});

module.exports = router;