const modelUser = require('../models/users.model');
const modelApiKey = require('../models/apiKey.model');
const modelOtp = require('../models/otp.model');

const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK } = require('../core/success.response');
const User = require('../models/users.model');
const Product = require('../models/product.model');
const HistoryBook = require('../models/historyBook.model');
const { createApiKey, createRefreshToken, createToken, verifyToken } = require('../services/tokenServices');

const sendMailForgotPassword = require('../utils/sendMailForgotPassword');

const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const { jwtDecode } = require('jwt-decode');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { uploadImageToCloudinary } = require('../utils/cloudinaryUpload');

const { setAuthCookies, clearAuthCookies } = require('../utils/authCookies');

require('dotenv').config();

class controllerUser {
    async registerUser(req, res) {
        const { fullName, phone, address, email, password } = req.body;
        if (!fullName || !phone || !email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ email });

        if (findUser) {
            throw new BadRequestError('Email đã tồn tại');
        }

        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        const dataUser = await modelUser.create({
            fullName,
            phone,
            address,
            email,
            password: passwordHash,
            typeLogin: 'email',
        });

        await dataUser.save();
        await createApiKey(dataUser.id);
        const token = await createToken({
            id: dataUser.id,
            isAdmin: dataUser.isAdmin,
            address: dataUser.address,
            phone: dataUser.phone,
        });
        const refreshToken = await createRefreshToken({ id: dataUser.id });
        setAuthCookies(res, { token, refreshToken });

        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async loginUser(req, res) {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }
        const findUser = await modelUser.findOne({ email });
        if (!findUser) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        const isPasswordValid = bcrypt.compareSync(password, findUser.password);
        if (!isPasswordValid) {
            throw new AuthFailureError('Tài khoản hoặc mật khẩu không chính xác');
        }
        await createApiKey(findUser.id);
        const token = await createToken({ id: findUser.id, isAdmin: findUser.isAdmin });
        const refreshToken = await createRefreshToken({ id: findUser.id });
        setAuthCookies(res, { token, refreshToken });
        new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
    }

    async authUser(req, res) {
        const { id } = req.user;

        const findUser = await modelUser.findById(id).select('-password');

        if (!findUser) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }

        // Convert Mongoose document to plain object
        const userObject = findUser.toObject ? findUser.toObject() : JSON.parse(JSON.stringify(findUser));
        const auth = CryptoJS.AES.encrypt(JSON.stringify(userObject), process.env.SECRET_CRYPTO).toString();

        new OK({ message: 'success', metadata: auth }).send(res);
    }

    async refreshToken(req, res) {
        const refreshToken = req.cookies.refreshToken;

        const decoded = await verifyToken(refreshToken);

        const user = await modelUser.findById(decoded.id);
        if (!user) {
            throw new AuthFailureError('Tài khoản không tồn tại');
        }

        const token = await createToken({ id: user.id, isAdmin: user.isAdmin });
        setAuthCookies(res, { token, refreshToken });

        new OK({ message: 'Refresh token thành công', metadata: { token } }).send(res);
    }

    async logout(req, res) {
        const { id } = req.user;
        clearAuthCookies(res);

        new OK({ message: 'Đăng xuất thành công' }).send(res);
    }

    async updateInfoUser(req, res, next) {
        const { id } = req.user;
        const { fullName, address, phone, sex } = req.body;

        const user = await modelUser.findById(id);

        let image = '';
        if (req.file) {
            image = await uploadImageToCloudinary(req.file.path, 'quan-ly-thu-vien/avatars');
        } else {
            image = user.avatar;
        }

        if (!user) {
            throw new BadRequestError('Không tìm thấy tài khoản');
        }
        await modelUser.findByIdAndUpdate(
            id,
            { fullName, address, phone, sex, avatar: image },
            { returnDocument: 'after', runValidators: true },
        );

        new OK({ message: 'Cập nhật thông tin tài khoản thành cong' }).send(res);
    }

    async loginGoogle(req, res) {
        const { credential } = req.body;
        const dataToken = jwtDecode(credential);
        const user = await modelUser.findOne({ email: dataToken.email });
        if (user) {
            await createApiKey(user.id);
            const token = await createToken({ id: user.id });
            const refreshToken = await createRefreshToken({ id: user.id });
            setAuthCookies(res, { token, refreshToken });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        } else {
            const newUser = await modelUser.create({
                fullName: dataToken.name,
                email: dataToken.email,
                typeLogin: 'google',
            });
            await newUser.save();
            await createApiKey(newUser.id);
            const token = await createToken({ id: newUser.id });
            const refreshToken = await createRefreshToken({ id: newUser.id });
            setAuthCookies(res, { token, refreshToken });
            new OK({ message: 'Đăng nhập thành công', metadata: { token, refreshToken } }).send(res);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                throw new BadRequestError('Vui lòng nhập email');
            }

            const user = await modelUser.findOne({ email });
            if (!user) {
                throw new AuthFailureError('Email không tồn tại');
            }

            const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
            const otp = await otpGenerator.generate(6, {
                digits: true,
                lowerCaseAlphabets: false,
                upperCaseAlphabets: false,
                specialChars: false,
            });

            const saltRounds = 10;
            const hash = await bcrypt.hash(otp, saltRounds);

            await modelOtp.create({
                email: user.email,
                otp: hash,
            });

            await sendMailForgotPassword(email, otp);

            return res
                .setHeader('Set-Cookie', [`tokenResetPassword=${token};  Secure; Max-Age=300; Path=/; SameSite=Strict`])
                .status(200)
                .json({ message: 'Gửi thành công !!!' });
        } catch (error) {
            console.error('Error forgot password:', error);
            return res.status(500).json({ message: 'Có lỗi xảy ra' });
        }
    }

    async resetPassword(req, res) {
        try {
            const token = req.cookies.tokenResetPassword;
            const { otp, newPassword } = req.body;

            if (!token) {
                throw new BadRequestError('Vui lòng gửi yêu cầu quên mật khẩu');
            }

            const decode = jwt.verify(token, process.env.JWT_SECRET);
            if (!decode) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            const findOTP = await modelOtp.findOne({ email: decode.email }).sort({ createdAt: -1 });
            if (!findOTP) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // So sánh OTP
            const isMatch = await bcrypt.compare(otp, findOTP.otp);
            if (!isMatch) {
                throw new AuthFailureError('Sai mã OTP hoặc đã hết hạn, vui lòng lấy OTP mới');
            }

            // Hash mật khẩu mới
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Tìm người dùng
            const findUser = await modelUser.findOne({ email: decode.email });
            if (!findUser) {
                throw new AuthFailureError('Người dùng không tồn tại');
            }

            findUser.password = hashedPassword;
            await findUser.save();

            await modelOtp.deleteMany({ email: decode.email });
            res.clearCookie('tokenResetPassword');
            return res.status(200).json({ message: 'Đặt lại mật khẩu thành công' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng liên hệ ADMIN !!' });
        }
    }

    async getUsers(req, res) {
        const users = await modelUser.find();
        new OK({ message: 'Lấy danh sách người dùng thành công', metadata: users }).send(res);
    }

    async updateUser(req, res) {
        const { userId, fullName, phone, email, role, address } = req.body;

        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await modelUser.findByIdAndUpdate(
            userId,
            { fullName, phone, email, role, address },
            { returnDocument: 'after', runValidators: true },
        );
        new OK({ message: 'Cập nhật người dùng thành công' }).send(res);
    }

    async changeAvatar(req, res) {
        const { file } = req;
        const { id } = req.user;
        if (!file) {
            throw new BadRequestError('Vui lòng chọn file');
        }
        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        const avatarUrl = await uploadImageToCloudinary(file.path, 'quan-ly-thu-vien/avatars');

        await modelUser.findByIdAndUpdate(id, { avatar: avatarUrl }, { returnDocument: 'after', runValidators: true });
        new OK({
            message: 'Upload thành công',
            metadata: avatarUrl,
        }).send(res);
    }

    async deleteUser(req, res) {
        const { userId } = req.body;
        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        await modelUser.findByIdAndDelete(userId);
        new OK({ message: 'Xóa người dùng thành công' }).send(res);
    }

    async updatePassword(req, res) {
        const { userId, password } = req.body;
        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }
        const saltRounds = 10;
        const salt = bcrypt.genSaltSync(saltRounds);
        const passwordHash = bcrypt.hashSync(password, salt);
        user.password = passwordHash;
        await user.save();
        new OK({ message: 'Cập nhật mật khẩu thành công' }).send(res);
    }

    async requestIdStudent(req, res) {
        const { id } = req.user;
        const user = await modelUser.findById(id);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        if (user.idStudent === '0' || (user.idStudent && user.idStudent.trim() !== '')) {
            throw new BadRequestError('Vui lòng chờ xác nhận ID sinh viên');
        }

        user.idStudent = '0';
        await user.save();
        new OK({ message: 'Yêu cầu thành công' }).send(res);
    }

    async confirmIdStudent(req, res) {
        const { userId } = req.body;
        if (!userId) {
            throw new BadRequestError('Thiếu userId');
        }

        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        if (user.idStudent !== '0') {
            throw new BadRequestError('Người dùng không ở trạng thái chờ cấp thẻ');
        }

        const generateStudentId = () => String(Math.floor(1000000000 + Math.random() * 9000000000));

        let generatedIdStudent = null;
        for (let i = 0; i < 20; i++) {
            const candidate = generateStudentId();
            const duplicatedStudentId = await modelUser.findOne({
                _id: { $ne: userId },
                idStudent: candidate,
            });
            if (!duplicatedStudentId) {
                generatedIdStudent = candidate;
                break;
            }
        }

        if (!generatedIdStudent) {
            throw new BadRequestError('Không thể tạo mã sinh viên, vui lòng thử lại');
        }

        await modelUser.findByIdAndUpdate(
            userId,
            { idStudent: generatedIdStudent, cardStatus: 'active' },
            { returnDocument: 'after', runValidators: true },
        );
        new OK({ message: 'Xác nhận thành công', metadata: { idStudent: generatedIdStudent } }).send(res);
    }

    async updateStudentCardStatus(req, res) {
        const { userId, cardStatus } = req.body;

        if (!userId || !['active', 'locked'].includes(cardStatus)) {
            throw new BadRequestError('Dữ liệu không hợp lệ');
        }

        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        if (!user.idStudent || user.idStudent === '0') {
            throw new BadRequestError('Người dùng chưa có thẻ sinh viên để cập nhật trạng thái');
        }

        await modelUser.findByIdAndUpdate(userId, { cardStatus }, { returnDocument: 'after', runValidators: true });
        new OK({ message: cardStatus === 'locked' ? 'Đã khóa thẻ sinh viên' : 'Đã mở khóa thẻ sinh viên' }).send(res);
    }

    async removeStudentCard(req, res) {
        const { userId } = req.body;

        if (!userId) {
            throw new BadRequestError('Thiếu userId');
        }

        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        if (!user.idStudent || user.idStudent === '0') {
            throw new BadRequestError('Người dùng chưa có thẻ để xóa');
        }

        await modelUser.findByIdAndUpdate(
            userId,
            { idStudent: null, cardStatus: 'active' },
            { returnDocument: 'after', runValidators: true },
        );

        new OK({ message: 'Đã xóa thẻ sinh viên' }).send(res);
    }

    async cancelIdStudentRequest(req, res) {
        const { userId } = req.body;
        if (!userId) {
            throw new BadRequestError('Thiếu userId');
        }

        const user = await modelUser.findById(userId);
        if (!user) {
            throw new BadRequestError('Người dùng không tồn tại');
        }

        if (user.idStudent !== '0') {
            throw new BadRequestError('Yêu cầu cấp thẻ không còn ở trạng thái chờ');
        }

        await modelUser.findByIdAndUpdate(
            userId,
            { idStudent: null, cardStatus: 'active' },
            { returnDocument: 'after', runValidators: true },
        );
        new OK({ message: 'Đã hủy yêu cầu cấp thẻ' }).send(res);
    }

    async getRequestLoan(req, res) {
        // Card management should keep both pending and issued cards for tracking.
        const pendingUsers = await modelUser.find({ idStudent: '0', role: 'user' }).sort({ updatedAt: -1 });
        const issuedUsers = await modelUser
            .find({
                role: 'user',
                idStudent: {
                    $nin: [null, '', '0'],
                },
            })
            .sort({ updatedAt: -1 });

        const findRequestLoan = [...pendingUsers, ...issuedUsers];
        new OK({
            message: 'Lấy danh sách quản lý thẻ sinh viên thành công',
            metadata: findRequestLoan,
        }).send(res);
    }

    async getStatistics(req, res) {
        try {
            const totalUsers = await User.countDocuments();
            const totalBooks = await Product.countDocuments();
            const pendingRequests = await HistoryBook.countDocuments({ status: 'pending' });

            const booksInStock = await Product.countDocuments({ stock: { $gt: 0 } });
            const booksOutOfStock = totalBooks - booksInStock;

            const bookStatusData = [
                { type: 'Còn sách', value: booksInStock },
                { type: 'Hết sách', value: booksOutOfStock },
            ];

            const approvedLoans = await HistoryBook.countDocuments({ status: 'success' });
            const pendingLoans = pendingRequests;
            const rejectedLoans = await HistoryBook.countDocuments({ status: 'cancel' });

            const fourteenDaysAgo = new Date();
            fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
            const overdueLoans = await HistoryBook.countDocuments({
                status: 'success',
                returnDate: null,
                borrowDate: { $lt: fourteenDaysAgo },
            });

            const loanStatusData = [
                { status: 'Đã duyệt', count: approvedLoans },
                { status: 'Chờ duyệt', count: pendingLoans },
                { status: 'Từ chối', count: rejectedLoans },
                { status: 'Quá hạn', count: overdueLoans },
            ];

            res.status(200).json({
                totalUsers,
                totalBooks,
                pendingRequests,
                bookStatusData,
                loanStatusData,
            });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi server: ' + error.message });
        }
    }
}

module.exports = new controllerUser();
