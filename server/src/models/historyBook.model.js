const mongoose = require('mongoose');

const historyBookSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        phone: String,
        address: String,
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        borrowDate: {
            type: Date,
            required: true,
        },
        returnDate: Date,
        status: {
            type: String,
            enum: ['pending', 'success', 'cancel'],
            default: 'pending',
        },
        quantity: {
            type: Number,
            default: 1,
        },
    },
    {
        timestamps: true,
        collection: 'historyBooks',
    },
);

// Index
historyBookSchema.index({ userId: 1 });
historyBookSchema.index({ bookId: 1 });

module.exports = mongoose.model('HistoryBook', historyBookSchema);
