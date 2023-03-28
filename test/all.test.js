const request = require('supertest');
const app = require('../src');
// Import dotenv
require('dotenv').config();

let firstSellerToken;
let secondSellerToken;
let buyerToken;

// Products
let firstSellerProduct;
let secondSellerProduct;

beforeAll(async () =>
{
    const res = await request(app)
        .post('/api/auth/user')
        .send({
            username: 'giftie',
            password: 'Hello123',
            role: 'buyer'
        });

    buyerToken = res.body.token;

    const res2 = await request(app)
        .post('/api/auth/user')
        .send({
            username: 'giftie2',
            password: 'Hello123',
            role: 'seller'
        });

    firstSellerToken = res2.body.token;

    const res3 = await request(app)
        .post('/api/auth/user')
        .send({
            username: 'giftie3',
            password: 'Hello123',
            role: 'seller'
        });

    secondSellerToken = res3.body.token;
});

// Seller product test
describe('Seller product test', () =>
{
    describe('Create product test', () =>
    {
        it('should return 400 if product name is not provided', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    cost: 100,
                    quantity: 10
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Product name is required');
        });

        it('should return 400 if cost is not provided', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    productName: 'Giftie',
                    quantity: 10
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Cost is required');
        });

        it('should return 400 if cost is less than 0', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    productName: 'Giftie',
                    cost: -100,
                    quantity: 10
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Cost must be a number greater than 0');
        });

        it('should return 400 if quantity is not provided', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    productName: 'Giftie',
                    cost: 100
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Quantity is required');
        });

        it('should return 400 if quantity is less than 0', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    productName: 'Giftie',
                    cost: 100,
                    quantity: -10
                });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Quantity must be a number greater than 0');
        });

        it('should return 200 if product is successfully created', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    productName: 'Giftie',
                    cost: 100,
                    quantity: 10
                });

            firstSellerProduct = res.body.product;

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Product successfully created');
            expect(res.body.product.productName).toBe('Giftie');
            expect(res.body.product.cost).toBe(100);
            expect(res.body.product.amountAvailable).toBe(10);
        });

        it('should return 200 if product is successfully created', async () =>
        {
            const res = await request(app)
                .post('/api/trade/products')
                .set('Authorization', `Bearer ${secondSellerToken}`)
                .send({
                    productName: 'Giftie 2',
                    cost: 100,
                    quantity: 10
                });

            secondSellerProduct = res.body.product;

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Product successfully created');
            expect(res.body.product.productName).toBe('Giftie 2');
            expect(res.body.product.cost).toBe(100);
            expect(res.body.product.amountAvailable).toBe(10);
        });
    });

    // Update product test
    describe('Update product test', () =>
    {
        // Update product name
        it('should return 200 if product is successfully updated', async () =>
        {
            const res = await request(app)
                .put(`/api/trade/products/${firstSellerProduct.id}`)
                .set('Authorization', `Bearer ${firstSellerToken}`)
                .send({
                    cost: 100,
                    quantity: 1
                });

            expect(res.status).toBe(200)
            expect(res.body.message).toBe('Product successfully updated');
            expect(res.body.product.productName).toBe('Giftie');
            expect(res.body.product.cost).toBe(100);
            expect(res.body.product.amountAvailable).toBe(1);
        });

        // Make sure seller can't update other seller's product
        it('should return 403 if seller is not authorized to update product', async () =>
        {
            const res = await request(app)
                .put(`/api/trade/products/${firstSellerProduct.id}`)
                .set('Authorization', `Bearer ${secondSellerToken}`)
                .send({
                    productName: 'Giftie',
                    cost: 100,
                    quantity: 10
                });

            expect(res.status).toBe(401);
            expect(res.body.msg).toBe('Authorization denied');
        });
    });
});

describe('Buyer deposit test', () =>
{
    it('should return 400 if amount is not a valid coin value', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/deposit')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 15
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid coin value. Only 5, 10, 20, 50 and 100 cents coins are accepted.');
    });

    it('should return 200 if deposit is successful', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/deposit')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 100
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Deposit successful');
        expect(res.body.deposit).toBe(100);
    });

    it('should return 200 if deposit is successful', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/deposit')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 100
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Deposit successful');
        expect(res.body.deposit).toBe(200);
    });
});

describe('Buyer purchase test', () =>
{
    it('should return 400 if product id is not provided', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                amount: 1
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Product ID is required');
    });

    it('should return 400 if quantity is not provided', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: firstSellerProduct.id
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Amount is required');
    });

    it('should return 400 if quantity is less than 1', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: firstSellerProduct.id,
                amount: 0
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Amount is required');
    });

    it('should return 400 if product is not found', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: 100,
                amount: 1
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Product not found');
    });

    it('should return 400 if not enough products is available', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: firstSellerProduct.id,
                amount: 100
            });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Not enough products available');
    });

    it('should return 200 if purchase is successful', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: firstSellerProduct.id,
                amount: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Purchase successful');
        expect(res.body.transaction.totalSpent).toBe(100);
        expect(res.body.transaction.change).toHaveLength(1);
    });

    it('should return 400 if product is out of stock', async () =>
    {
        const res = await request(app)
            .post('/api/transactions/buy')
            .set('Authorization', `Bearer ${buyerToken}`)
            .send({
                productId: firstSellerProduct.id,
                amount: 1
            });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Not enough products available');
    });
});

// After all, end the server
afterAll(async () =>
{
    await app.close();
});