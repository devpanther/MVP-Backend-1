// Import bcrypt for password hashing
const bcrypt = require('bcrypt');
const { v4 } = require('uuid');

// Define a class for the user model
class UserClass
{
    constructor()
    {
        this.users = []; // array to hold users
    }

    // Hash the password before saving the user
    async hashPassword(password)
    {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword;
    }

    // Method to create a new user
    async createUser({ username, password, role })
    {
        // Check if the user already exists
        const userExists = this.users.some(user => user.username === username);
        if (userExists)
        {
            // throw an error if the user already exists with code 11000
            const error = new Error('User already exists');
            error.code = 11000;
            throw error;
        }

        // Hash the password before saving the user
        const hashedPassword = await this.hashPassword(password);

        // Create a new user object
        const user = {
            username,
            password: hashedPassword,
            deposit: 0,
            role: role || 'buyer',
            activeSessions: [],
            id: v4()
        };

        // Add the user to the array of users
        this.users.push(user);

        // Return the user object
        return user;
    }

    // Method to find a user by id
    async findById(id)
    {
        let user = this.users.find(user => user.id === id);

        if (!user)
        {
            throw new Error('User not found');
        }

        return user;
    }

    // Method to find all users
    async find()
    {
        return this.users;
    }

    // Method to find a user by id, update it and return the updated user
    async findByIdAndUpdate(id, update)
    {
        const user = await this.findById(id);

        const index = this.users.findIndex(u => u.id === id);
        if (index === -1)
        {
            throw new Error('User not found');
        }

        // if username is not changed, check if the new username is already taken
        if (update.username && update.username !== user.username)
        {
            const userExists = this.users.some(user => user.username === update.username);
            if (userExists)
            {
                // throw an error if the user already exists with code 11000
                const error = new Error('Username already taken');
                error.code = 11000;
                throw error;
            }
        }
        // if password is changed, hash it
        if (update.password)
        {
            update.password = await this.hashPassword(update.password);
        }

        if (update.deposit)
        {
            update.deposit = Number(update.deposit);
        }

        if (update.role)
        {
            update.role = update.role.toLowerCase();
        }

        // Update the user object with the new values
        this.users[index] = { ...user, ...update };
        return { ...user, ...update };
    }

    // Method to find a user by id and delete it
    async findByIdAndDelete(id)
    {
        const user = await this.findById(id);
        this.users = this.users.filter(user => user.id !== id);
        return user;
    }

    // Method to find a user by username
    async findOne({ username })
    {
        return this.users.find(user => user.username === username);
    }

    // .save() method to save the user to the database - UPDATE
    async save(user)
    {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index === -1)
        {
            throw new Error('User not found');
        }
        this.users[index] = user;
        return user;
    }

    // Method to validate a user's password
    async validatePassword(password, hash)
    {
        return await bcrypt.compare(password, hash);
    }

    // Method to remove sensitive data before sending the user object to the client
    toJSON(user)
    {
        const { password, activeSessions, ...userObject } = user;
        return userObject;
    }
}

module.exports = UserClass;