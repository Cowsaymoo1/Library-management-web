const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
        },
        nameProduct: {
            type: String,
            required: true,
        },
        description: String,
        stock: {
            type: Number,
            required: true,
        },
        covertType: {
            type: String,
            enum: ['hard', 'soft'],
            required: true,
        },
        publishYear: {
            type: Number,
            required: true,
        },
        pages: {
            type: Number,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        publisher: {
            type: String,
            required: true,
        },
        publishingCompany: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'products',
    },
);

// Index để tìm kiếm
productSchema.index({ nameProduct: 'text' });

module.exports = mongoose.model('Product', productSchema);
