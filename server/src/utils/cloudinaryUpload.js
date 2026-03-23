const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const hasCloudinaryConfig = () =>
    Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const removeTempFile = async (filePath) => {
    if (!filePath) return;
    try {
        await fs.promises.unlink(filePath);
    } catch (error) {
        // Ignore cleanup errors for temporary files.
    }
};

const uploadImageToCloudinary = async (filePath, folder) => {
    if (!hasCloudinaryConfig()) {
        throw new Error('Cloudinary chua duoc cau hinh day du trong file .env');
    }

    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder,
            resource_type: 'image',
        });

        return result.secure_url;
    } finally {
        await removeTempFile(filePath);
    }
};

module.exports = {
    uploadImageToCloudinary,
};
