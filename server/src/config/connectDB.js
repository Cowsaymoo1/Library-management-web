require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri =
            process.env.MONGODB_URI || `mongodb://${process.env.DB_HOST}:${process.env.MONGODB_PORT || 27017}/books`;

        await mongoose.connect(mongoUri);
        console.log('MongoDB Connection Success!');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
