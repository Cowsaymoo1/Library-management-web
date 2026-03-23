const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        avatar: {
            type: String,
            default: null,
        },
        fullName: {
            type: String,
            required: true,
        },
        phone: String,
        address: String,
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        password: String,
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        typeLogin: {
            type: String,
            enum: ['google', 'email'],
            required: true,
        },
        idStudent: String,
        cardStatus: {
            type: String,
            enum: ['active', 'locked'],
            default: 'active',
        },
    },
    {
        timestamps: true,
        collection: 'users',
    },
);

module.exports = mongoose.model('User', userSchema);
