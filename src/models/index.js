const UserClass = require('./user');
const ProductClass = require('./product');
const TransactionClass = require('./transaction');

const User = new UserClass();
const Product = new ProductClass();
const Transaction = new TransactionClass();

module.exports = {
    User,
    Product,
    Transaction
};