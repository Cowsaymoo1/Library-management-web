const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        publicKey: {
            type: String,
            required: true,
        },
        privateKey: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: 'apiKeys',
    },
);

// Index
apiKeySchema.index({ userId: 1 });

module.exports = mongoose.model('ApiKey', apiKeySchema);
