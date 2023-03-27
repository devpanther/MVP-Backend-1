const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    deposit: { type: Number, default: 0 },
    role: { type: String, enum: ['seller', 'buyer'], default: 'buyer' },
    activeSessions: [{ type: String }]
});


// Hash the password before saving the user
userSchema.pre('save', async function (next)
{
    const user = this;
    if (user.isModified('password'))
    {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

// Remove sensitive data before sending the user object to the client
userSchema.methods.toJSON = function ()
{
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};

const User = mongoose.model('User', userSchema);


module.exports = User;