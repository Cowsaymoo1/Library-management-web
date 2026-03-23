const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            lowercase: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 phút
        },
    },
    {
        timestamps: true,
        collection: 'otps',
    },
);

// TTL Index - MongoDB sẽ tự động xóa OTP sau khi hết hạn
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
