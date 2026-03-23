const modelHistoryBook = require('../models/historyBook.model');
const modelUser = require('../models/users.model');
const modelProduct = require('../models/product.model');

const { BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');
const SendMailBookBorrowConfirmation = require('../utils/SendMailSuccess');
const SendMailBookBorrowFailed = require('../utils/SendMailFail');
const mongoose = require('mongoose');

class historyBookController {
    async createHistoryBook(req, res) {
        const { id } = req.user;

        try {
            const findUser = await modelUser.findById(id);

            if (!findUser) {
                throw new BadRequestError('Người dùng không tồn tại');
            }

            if (!findUser.idStudent || findUser.idStudent === '0' || findUser.idStudent === '') {
                throw new BadRequestError('Bạn chưa có ID sinh viên !!!');
            }

            if (findUser.cardStatus === 'locked') {
                throw new BadRequestError('Thẻ sinh viên của bạn đang bị tạm khóa, không thể mượn sách');
            }

            const { fullName, phoneNumber, address, bookId, borrowDate, returnDate, quantity } = req.body;

            if (!fullName || !phoneNumber || !address || !bookId || !borrowDate || !returnDate || !quantity) {
                throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
            }

            if (!mongoose.Types.ObjectId.isValid(bookId)) {
                throw new BadRequestError('ID sách không hợp lệ');
            }

            const historyBook = await modelHistoryBook.create({
                fullName,
                phone: phoneNumber,
                address,
                bookId,
                borrowDate,
                returnDate,
                quantity,
                userId: id,
            });

            const findProduct = await modelProduct.findById(bookId);
            if (!findProduct) {
                throw new BadRequestError('Sách không tồn tại');
            }

            await modelProduct.findByIdAndUpdate(bookId, { $inc: { stock: -quantity } }, { new: true });

            new Created({
                message: 'Create history book success',
                metadata: historyBook,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async getHistoryUser(req, res) {
        const { id } = req.user;

        try {
            const historyBooks = await modelHistoryBook.find({ userId: id }).populate('bookId');

            new OK({
                message: 'Get history book success',
                metadata: historyBooks,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async cancelBook(req, res) {
        const { id } = req.user;
        const { idHistory } = req.body;

        try {
            if (!mongoose.Types.ObjectId.isValid(idHistory)) {
                throw new BadRequestError('ID lịch sử không hợp lệ');
            }

            const findHistory = await modelHistoryBook.findById(idHistory);

            if (!findHistory || findHistory.userId.toString() !== id) {
                throw new BadRequestError('Lịch sử mươn không tồn tại');
            }

            const findProduct = await modelProduct.findById(findHistory.bookId);

            if (!findProduct) {
                throw new BadRequestError('Sách không tồn tại');
            }

            await modelHistoryBook.findByIdAndUpdate(idHistory, { status: 'cancel' }, { new: true });

            await modelProduct.findByIdAndUpdate(
                findHistory.bookId,
                { $inc: { stock: findHistory.quantity } },
                { new: true },
            );

            new OK({
                message: 'Cancel book success',
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async getAllHistoryBook(req, res) {
        try {
            const historyBooks = await modelHistoryBook
                .find()
                .sort({ createdAt: -1 })
                .populate('bookId')
                .populate('userId');

            new OK({
                message: 'Get all history book success',
                metadata: historyBooks,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async updateStatusBook(req, res) {
        const { idHistory, status, productId, userId } = req.body;

        try {
            if (!mongoose.Types.ObjectId.isValid(idHistory)) {
                throw new BadRequestError('ID lịch sử không hợp lệ');
            }

            const findHistory = await modelHistoryBook.findById(idHistory);

            if (!findHistory) {
                throw new BadRequestError('Lịch sử mượn không tồn tại');
            }

            const findProduct = await modelProduct.findById(productId);
            const findUser = await modelUser.findById(userId);

            if (!findProduct || !findUser) {
                throw new BadRequestError('Sản phẩm hoặc người dùng không tồn tại');
            }

            await modelHistoryBook.findByIdAndUpdate(idHistory, { status }, { new: true });

            if (status === 'success') {
                await SendMailBookBorrowConfirmation(
                    findUser.email,
                    findProduct,
                    findHistory.borrowDate,
                    findHistory.returnDate,
                );
            }

            if (status === 'cancel') {
                await SendMailBookBorrowFailed(findUser.email, findProduct);
            }

            new OK({
                message: 'Update status book success',
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async deleteHistoryBook(req, res) {
        const { idHistory } = req.body;

        try {
            if (!mongoose.Types.ObjectId.isValid(idHistory)) {
                throw new BadRequestError('ID lịch sử không hợp lệ');
            }

            const findHistory = await modelHistoryBook.findById(idHistory);

            if (!findHistory) {
                throw new BadRequestError('Yêu cầu mượn không tồn tại');
            }

            if (findHistory.status !== 'cancel') {
                throw new BadRequestError('Chỉ có thể xóa yêu cầu ở trạng thái từ chối');
            }

            await modelHistoryBook.findByIdAndDelete(idHistory);

            new OK({ message: 'Đã xóa yêu cầu mượn sách' }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
}

module.exports = new historyBookController();
