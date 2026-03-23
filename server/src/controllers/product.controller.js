const { AuthFailureError, BadRequestError } = require('../core/error.response');
const { OK, Created } = require('../core/success.response');
const modelProduct = require('../models/product.model');
const mongoose = require('mongoose');
const { uploadImageToCloudinary } = require('../utils/cloudinaryUpload');

class controllerProduct {
    async uploadImage(req, res) {
        const { file } = req;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = await uploadImageToCloudinary(file.path, 'quan-ly-thu-vien/products');

        new Created({
            message: 'Upload image success',
            metadata: imageUrl,
        }).send(res);
    }

    async createProduct(req, res) {
        const {
            nameProduct,
            image,
            description,
            stock,
            covertType,
            publishYear,
            pages,
            language,
            publisher,
            publishingCompany,
        } = req.body;

        if (
            !nameProduct ||
            !image ||
            !description ||
            !stock ||
            !covertType ||
            !publishYear ||
            !pages ||
            !language ||
            !publisher ||
            !publishingCompany
        ) {
            throw new BadRequestError('Vui lòng nhập đầy đủ thông tin');
        }

        try {
            const product = await modelProduct.create({
                nameProduct,
                image,
                description,
                stock,
                covertType,
                publishYear,
                pages,
                language,
                publisher,
                publishingCompany,
            });

            new Created({
                message: 'Create product success',
                metadata: product,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async getAllProduct(req, res) {
        try {
            const products = await modelProduct.find();
            new OK({
                message: 'Get all product success',
                metadata: products,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async getOneProduct(req, res) {
        const { id } = req.query;
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new BadRequestError('ID không hợp lệ');
            }

            const product = await modelProduct.findById(id);
            if (!product) {
                throw new BadRequestError('Sản phẩm không tồn tại');
            }

            new OK({
                message: 'Get one product success',
                metadata: product,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async searchProduct(req, res) {
        const { keyword } = req.query;
        try {
            const products = await modelProduct.find({
                nameProduct: { $regex: keyword, $options: 'i' },
            });

            new OK({
                message: 'Search product success',
                metadata: products,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async updateProduct(req, res) {
        const { id } = req.query;
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new BadRequestError('ID không hợp lệ');
            }

            const product = await modelProduct.findByIdAndUpdate(id, req.body, {
                returnDocument: 'after',
                runValidators: true,
            });

            if (!product) {
                throw new BadRequestError('Sản phẩm không tồn tại');
            }

            new OK({
                message: 'Update product success',
                metadata: product,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }

    async deleteProduct(req, res) {
        const { id } = req.body;
        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new BadRequestError('ID không hợp lệ');
            }

            const product = await modelProduct.findByIdAndDelete(id);

            if (!product) {
                throw new BadRequestError('Sản phẩm không tồn tại');
            }

            new OK({
                message: 'Delete product success',
                metadata: product,
            }).send(res);
        } catch (error) {
            throw new BadRequestError(error.message);
        }
    }
}

module.exports = new controllerProduct();
