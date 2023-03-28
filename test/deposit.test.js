const request = require('supertest');
const app = require('../src');
// Import dotenv
require('dotenv').config();

let firstSellerToken;
let secondSellerToken;
let buyerToken;

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
                amount: 10
            });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Deposit successful');
        expect(res.body.deposit).toBe(10);
    });
});

// After all, end the server
afterAll(async () =>
{
    await app.close();
});