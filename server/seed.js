require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/product.model');

const seedData = [
    {
        nameProduct: 'Sapiens: Lược sử loài người',
        description: 'Một cuốn sách tinh thần tuyệt vời về lịch sử của loài người',
        covertType: 'hard',
        publishYear: 2011,
        pages: 500,
        language: 'en',
        publisher: 'NXB Thế Giới',
        publishingCompany: 'Penguin Books',
        image: 'uploads/products/1753791729643.webp',
        stock: 10,
    },
    {
        nameProduct: 'Thế giới phẳng',
        description: 'Khám phá cách toàn cầu hóa thay đổi thế giới',
        covertType: 'soft',
        publishYear: 2005,
        pages: 600,
        language: 'en',
        publisher: 'NXB Lao Động',
        publishingCompany: 'Farrar, Straus and Giroux',
        image: 'uploads/products/1753791733603.webp',
        stock: 8,
    },
    {
        nameProduct: 'Dám bước đầu tiên',
        description: 'Tự truyện của cựu Tổng thống Mỹ',
        covertType: 'hard',
        publishYear: 2020,
        pages: 768,
        language: 'en',
        publisher: 'NXB Trẻ',
        publishingCompany: 'Crown Publishing',
        image: 'uploads/products/1753791775074.webp',
        stock: 12,
    },
    {
        nameProduct: 'Sức mạnh của thói quen',
        description: 'Cách thay đổi cuộc sống bằng cách thay đổi thói quen',
        covertType: 'soft',
        publishYear: 2012,
        pages: 448,
        language: 'en',
        publisher: 'NXB Hà Nội',
        publishingCompany: 'Random House',
        image: 'uploads/products/1753791783113.webp',
        stock: 15,
    },
    {
        nameProduct: 'Eragon',
        description: 'Cuộc phiêu lưu kỳ ảo của một chàng trai và con rồng',
        covertType: 'hard',
        publishYear: 2003,
        pages: 662,
        language: 'en',
        publisher: 'NXB Kim Đồng',
        publishingCompany: 'Knopf Books',
        image: 'uploads/products/1753791830999.webp',
        stock: 7,
    },
    {
        nameProduct: 'Kiến thức về tài chính',
        description: 'Những điều giàu có dạy con cái về tiền bạc',
        covertType: 'soft',
        publishYear: 1997,
        pages: 336,
        language: 'en',
        publisher: 'NXB Thế Giới',
        publishingCompany: 'TechBooks',
        image: 'uploads/products/1753791873669.webp',
        stock: 20,
    },
    {
        nameProduct: 'Nhà lãnh đạo thầm lặng',
        description: 'Những bài học lãnh đạo từ các tính cách nội tâm',
        covertType: 'soft',
        publishYear: 2008,
        pages: 256,
        language: 'en',
        publisher: 'NXB Hà Nội',
        publishingCompany: 'Crown Publishing',
        image: 'uploads/products/1753791913601.webp',
        stock: 11,
    },
    {
        nameProduct: 'Tư duy nhanh và chậm',
        description: 'Khám phá hai hệ thống tư duy của bộ não người',
        covertType: 'hard',
        publishYear: 2011,
        pages: 499,
        language: 'en',
        publisher: 'NXB Trẻ',
        publishingCompany: 'Farrar, Straus and Giroux',
        image: 'uploads/products/1753791957345.webp',
        stock: 9,
    },
    {
        nameProduct: 'Atomic Habits',
        description: 'Xây dựng thói quen tốt và loại bỏ thói quen xấu mỗi ngày',
        covertType: 'soft',
        publishYear: 2018,
        pages: 320,
        language: 'en',
        publisher: 'NXB Lao Động',
        publishingCompany: 'Avery',
        image: 'uploads/products/1753791783113.webp',
        stock: 14,
    },
    {
        nameProduct: 'Deep Work',
        description: 'Tập trung sâu để tạo ra kết quả vượt trội trong công việc',
        covertType: 'soft',
        publishYear: 2016,
        pages: 304,
        language: 'en',
        publisher: 'NXB Hà Nội',
        publishingCompany: 'Grand Central Publishing',
        image: 'uploads/products/1753791913601.webp',
        stock: 10,
    },
    {
        nameProduct: 'The Lean Startup',
        description: 'Phương pháp xây dựng sản phẩm và doanh nghiệp tinh gọn',
        covertType: 'hard',
        publishYear: 2011,
        pages: 336,
        language: 'en',
        publisher: 'NXB Thế Giới',
        publishingCompany: 'Crown Business',
        image: 'uploads/products/1753791775074.webp',
        stock: 13,
    },
    {
        nameProduct: 'Thinking in Systems',
        description: 'Nhập môn tư duy hệ thống để phân tích vấn đề phức tạp',
        covertType: 'soft',
        publishYear: 2008,
        pages: 240,
        language: 'en',
        publisher: 'NXB Trẻ',
        publishingCompany: 'Chelsea Green Publishing',
        image: 'uploads/products/1753791957345.webp',
        stock: 8,
    },
    {
        nameProduct: 'Zero to One',
        description: 'Bài học khởi nghiệp để tạo ra giá trị mới từ số 0',
        covertType: 'hard',
        publishYear: 2014,
        pages: 224,
        language: 'en',
        publisher: 'NXB Kim Đồng',
        publishingCompany: 'Crown Business',
        image: 'uploads/products/1753791830999.webp',
        stock: 11,
    },
    {
        nameProduct: 'The Psychology of Money',
        description: 'Hiểu hành vi tài chính để quản lý tiền hiệu quả hơn',
        covertType: 'soft',
        publishYear: 2020,
        pages: 256,
        language: 'en',
        publisher: 'NXB Thế Giới',
        publishingCompany: 'Harriman House',
        image: 'uploads/products/1753791873669.webp',
        stock: 17,
    },
    {
        nameProduct: 'The Almanack of Naval Ravikant',
        description: 'Tổng hợp tư duy về giàu có, hạnh phúc và cuộc sống',
        covertType: 'soft',
        publishYear: 2020,
        pages: 242,
        language: 'en',
        publisher: 'NXB Lao Động',
        publishingCompany: 'Magrathea Publishing',
        image: 'uploads/products/1753791729643.webp',
        stock: 12,
    },
    {
        nameProduct: 'Hooked',
        description: 'Thiết kế sản phẩm tạo thói quen sử dụng cho người dùng',
        covertType: 'hard',
        publishYear: 2014,
        pages: 256,
        language: 'en',
        publisher: 'NXB Hà Nội',
        publishingCompany: 'Portfolio',
        image: 'uploads/products/1753791733603.webp',
        stock: 9,
    },
    {
        nameProduct: 'Made to Stick',
        description: 'Cách truyền đạt ý tưởng dễ nhớ và có sức lan tỏa',
        covertType: 'soft',
        publishYear: 2007,
        pages: 336,
        language: 'en',
        publisher: 'NXB Trẻ',
        publishingCompany: 'Random House',
        image: 'uploads/products/1753791783113.webp',
        stock: 10,
    },
    {
        nameProduct: 'The Goal',
        description: 'Tiểu thuyết kinh doanh kinh điển về tối ưu vận hành',
        covertType: 'hard',
        publishYear: 1984,
        pages: 384,
        language: 'en',
        publisher: 'NXB Thế Giới',
        publishingCompany: 'North River Press',
        image: 'uploads/products/1753791913601.webp',
        stock: 7,
    },
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Kết nối MongoDB thành công');

        // Xóa dữ liệu cũ
        await Product.deleteMany({});
        console.log('✅ Xóa dữ liệu cũ thành công');

        // Insert dữ liệu mới
        await Product.insertMany(seedData);
        console.log(`✅ Thêm ${seedData.length} sách vào database`);

        // Hiển thị dữ liệu
        const products = await Product.find();
        console.log('\n📚 Dữ liệu hiện tại:');
        console.log(JSON.stringify(products, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}

seedDatabase();
