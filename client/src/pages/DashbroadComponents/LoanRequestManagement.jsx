import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, message } from 'antd';
import { requestDeleteHistoryBook, requestGetAllHistoryBook, requestUpdateStatusBook } from '../../config/request';
import dayjs from 'dayjs';

const LoanRequestManagement = () => {
    const [data, setData] = useState([]);

    const getBookRecord = (record) => record?.product || record?.bookId || null;

    const getUserIdValue = (record) => {
        if (!record) return null;
        if (typeof record.userId === 'string') return record.userId;
        return record.userId?.id || record.userId?._id || record.user?._id || null;
    };

    const getBookIdValue = (record) => {
        const book = getBookRecord(record);
        return book?.id || book?._id || null;
    };

    const fetchData = async () => {
        const res = await requestGetAllHistoryBook();
        setData(res.metadata);
    };
    useEffect(() => {
        fetchData();
    }, []);
    const handleUpdateStatus = async (id, status, productId, userId) => {
        try {
            const data = {
                idHistory: id,
                status,
                productId,
                userId,
            };
            await requestUpdateStatusBook(data);
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const handleDeleteRejectedRequest = (id) => {
        Modal.confirm({
            title: 'Xóa yêu cầu mượn sách',
            content: 'Bạn có chắc chắn muốn xóa yêu cầu đã bị từ chối này không?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            async onOk() {
                try {
                    await requestDeleteHistoryBook({ idHistory: id });
                    message.success('Đã xóa yêu cầu mượn sách');
                    fetchData();
                } catch (error) {
                    message.error(error?.response?.data?.message || 'Không thể xóa yêu cầu');
                }
            },
        });
    };

    const columns = [
        {
            title: 'ID Yêu cầu',
            dataIndex: 'id',
            key: 'id',
            render: (text, record) => <span>{String(text || record?._id || '').slice(0, 10) || '-'}</span>,
        },
        { title: 'Người mượn', dataIndex: 'fullName', key: 'fullName' },
        {
            title: 'Ảnh',
            dataIndex: 'bookId',
            key: 'product',
            render: (_, record) => {
                const book = getBookRecord(record);
                const imagePath = book?.image;
                const imageSrc = imagePath
                    ? imagePath.startsWith('http')
                        ? imagePath
                        : `${import.meta.env.VITE_API_URL_IMAGE}/${imagePath}`
                    : '/vite.svg';

                return (
                    <img
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                        src={imageSrc}
                        alt=""
                        onError={(e) => {
                            e.currentTarget.src = '/vite.svg';
                        }}
                    />
                );
            },
        },
        {
            title: 'Tên sách',
            dataIndex: 'bookId',
            key: 'product-name',
            render: (_, record) => getBookRecord(record)?.nameProduct || '-',
        },
        { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
        {
            title: 'Ngày mượn',
            dataIndex: 'borrowDate',
            key: 'borrowDate',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày trả',
            dataIndex: 'returnDate',
            key: 'returnDate',
            render: (text) => dayjs(text).format('DD/MM/YYYY'),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status) => {
                let color = status === 'pending' ? 'green' : status === 'success' ? 'geekblue' : 'volcano';
                return (
                    <Tag color={color}>
                        {status === 'pending' ? 'Chờ duyệt' : status === 'success' ? 'Đã duyệt' : 'Từ chối'}
                    </Tag>
                );
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <div className="flex flex-wrap gap-2">
                    {record.status === 'pending' && (
                        <Button
                            onClick={() =>
                                handleUpdateStatus(
                                    record.id || record._id,
                                    'success',
                                    getBookIdValue(record),
                                    getUserIdValue(record),
                                )
                            }
                            type="primary"
                        >
                            Duyệt
                        </Button>
                    )}
                    {record.status === 'pending' && (
                        <Button
                            onClick={() =>
                                handleUpdateStatus(
                                    record.id || record._id,
                                    'cancel',
                                    getBookIdValue(record),
                                    getUserIdValue(record),
                                )
                            }
                            type="primary"
                            danger
                        >
                            Từ chối
                        </Button>
                    )}
                    {record.status === 'cancel' && (
                        <Button onClick={() => handleDeleteRejectedRequest(record.id || record._id)} danger>
                            Xóa yêu cầu
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl mb-4 font-bold">Quản lý yêu cầu mượn sách</h2>
            <Table columns={columns} dataSource={data} rowKey={(record) => record?.id || record?._id} />
        </div>
    );
};

export default LoanRequestManagement;
