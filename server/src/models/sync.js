// MongoDB không cần sync schema giống Sequelize
// Mongoose tự động tạo collection khi insert dữ liệu đầu tiên

const sync = async () => {
    console.log('Collections will be created automatically by Mongoose');
};

module.exports = sync;
