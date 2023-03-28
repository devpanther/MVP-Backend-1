// Import uuid for generating unique ids
const { v4 } = require('uuid');

// Define a class for the product model
class ProductClass
{
    constructor()
    {
        this.products = []; // array to hold products
    }

    validateCost(cost)
    {
        // Validate cost, should only accept 5, 10, 20, 50 and 100 cent coins
        const validCoins = [5, 10, 20, 50, 100];
        if (!validCoins.includes(cost))
        {
            const error = new Error('Invalid cost. Only 5, 10, 20, 50 and 100 cents coins are accepted.');
            error.code = 11000;
            throw error;
        }
    }

    // Method to create a new product
    async createProduct({ amountAvailable, cost, productName, sellerId })
    {
        // Check if the product already exists
        const productExists = this.products.some(product => product.productName === productName);
        if (productExists)
        {
            // throw an error if the product already exists with code 11000
            const error = new Error('Product already exists');
            error.code = 11000;
            throw error;
        }

        // Validate cost
        this.validateCost(cost);

        // Create a new product object
        const product = {
            amountAvailable,
            cost,
            productName,
            sellerId,
            id: v4()
        };

        // Add the product to the array of products
        this.products.push(product);

        // Return the product object
        return product;
    }

    // Method to find a product by id
    async findById(id)
    {
        let product = this.products.find(product => product.id === id);

        if (!product)
        {
            throw new Error('Product not found');
        }

        return product;
    }

    // Method to find all products
    async find()
    {
        return this.products;
    }

    // Method to find a product by id, update it and return the updated product
    async findByIdAndUpdate(id, update)
    {
        const product = await this.findById(id);
        // if product name is not changed, check if the new product name is already taken
        if (update.productName && update.productName !== product.productName)
        {
            const productExists = this.products.some(product => product.productName === update.productName);
            if (productExists)
            {
                // throw an error if the product already exists with code 11000
                const error = new Error('Product name already taken');
                error.code = 11000;
                throw error;
            }
        }

        if (product?.cost)
        {
            // Validate cost
            this.validateCost(product.cost);
        }

        // Update the product object with the new values
        Object.keys(update).forEach(key => product[key] = update[key]);
        return product;
    }

    // .save() method to save the user to the database - UPDATE
    async save(product)
    {
        const index = this.products.findIndex(p => p.id === product.id);
        if (index === -1)
        {
            throw new Error('Product not found');
        }

        if (product?.cost)
        {
            // Validate cost
            this.validateCost(product.cost);
        }

        this.products[index] = product;
        return product;
    }

    // Method to find a product by id and delete it
    async findByIdAndDelete(id)
    {
        const product = await this.findById(id);
        this.products = this.products.filter(product => product.id !== id);
        return product;
    }

    // Method to find all products for a given seller
    async findBySeller(sellerId)
    {
        return this.products.filter(product => product.sellerId === sellerId);
    }

    // Method to remove sensitive data before sending the product object to the client
    toJSON(product)
    {
        const { sellerId, ...productObject } = product;
        return productObject;
    }
}

module.exports = ProductClass;