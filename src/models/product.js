const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    amountAvailable: {
        type: Number,
        required: true,
        default: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function (v)
            {
                return v % 5 === 0; // cost should be in multiples of 5
            },
            message: props => `${props.value} is not a multiple of 5!`
        }
    },
    productName: {
        type: String,
        required: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);