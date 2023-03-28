const UserClass = require('./user');
const Product = require('./product');
const Transaction = require('./transaction');

const User = new UserClass();

module.exports = {
    User,
    Product,
    Transaction
};