const { v4 } = require("uuid");

class TransactionClass
{
    constructor()
    {
        this.transactions = []; // array to hold transactions
    }

    async create({ userId, productId, amount, totalSpent, change = [] })
    {
        const transaction = { userId, productId, amount, totalSpent, change, timestamp: new Date(), id: v4() };

        // Validate transaction data
        if (!userId || !productId || !amount || !totalSpent || !Array.isArray(change))
        {
            throw new Error("Transaction data is invalid");
        }

        if (isNaN(amount) || amount < 0)
        {
            throw new Error("Amount should be a positive number");
        }

        if (isNaN(totalSpent) || totalSpent < 0)
        {
            throw new Error("Total spent should be a positive number");
        }

        // Add transaction to local array
        this.transactions.push(transaction);

        return transaction;
    }

    async getAllById(id)
    {
        return this.transactions.filter(transaction => transaction.userId === id);
    }
}

module.exports = TransactionClass;