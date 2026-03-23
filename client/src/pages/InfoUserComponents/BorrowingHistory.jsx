import React, { useEffect, useState } from 'react';
import { Card, Empty, List, Tag, Image, Typography, Space, Spin, Button } from 'antd';
import { requestCancelBook, requestGetHistoryUser } from '../../config/request';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

const { Text, Title } = Typography;

// Mapping for status colors and texts for better readability and maintenance
const statusConfig = {
    pending: { text: 'Đang chờ duyệt', color: 'gold' },
    success: { text: 'Thành công', color: 'green' },
    cancel: { text: 'Đã hủy', color: 'red' },
};

const BorrowingHistory = ({ title = 'Lịch sử mượn sách' }) => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const getBookRecord = (item) => item?.product || item?.bookId || null;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await requestGetHistoryUser();
                setBorrowedBooks(res.metadata);
            } catch (error) {
                toast.error(error.response.data.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const handleCancelBook = async (idHistory) => {
        try {
            await requestCancelBook({ idHistory });
            toast.success('Huỷ mượn sách thành công');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    return (
        <Card title={title} variant="borderless">
            {borrowedBooks.length > 0 ? (
                <List
                    itemLayout="vertical"
                    dataSource={borrowedBooks}
                    pagination={{
                        pageSize: 3,
                        showSizeChanger: false,
                        hideOnSinglePage: true,
                    }}
                    renderItem={(item) => {
                        const book = getBookRecord(item);
                        const imagePath = book?.image;
                        const imageSrc = imagePath
                            ? imagePath.startsWith('http')
                                ? imagePath
                                : `${String(import.meta.env.VITE_API_URL_IMAGE || '').replace(/\/+$/, '')}/${String(imagePath).replace(/^\/+/, '')}`
                            : '/vite.svg';
                        const statusInfo = statusConfig[item.status] || { text: item.status, color: 'default' };
                        return (
                            <List.Item key={item.id || item._id} className="!p-0 mb-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <Image
                                            width={100}
                                            className="rounded object-cover self-center sm:self-start"
                                            src={imageSrc}
                                            alt={book?.nameProduct || 'Sách'}
                                            preview={false}
                                        />
                                        <div className="flex-grow">
                                            <Title level={5} className="mb-1">
                                                {book?.nameProduct || 'Sách không còn tồn tại'}
                                            </Title>
                                            <Space direction="vertical" size="small" className="w-full text-sm">
                                                <Text type="secondary">Số lượng: {item.quantity}</Text>
                                                <Text type="secondary">
                                                    Ngày mượn: {dayjs(item.borrowDate).format('DD/MM/YYYY')}
                                                </Text>
                                                <Text type="secondary">
                                                    Ngày trả: {dayjs(item.returnDate).format('DD/MM/YYYY')}
                                                </Text>
                                                {item.status === 'success' && (
                                                    <p className="text-red-500">
                                                        Số ngày còn lại : {dayjs(item.returnDate).diff(dayjs(), 'day')}{' '}
                                                        ngày
                                                    </p>
                                                )}
                                            </Space>
                                        </div>
                                        <div className="flex flex-col items-start sm:items-end justify-between mt-2 sm:mt-0">
                                            <Tag color={statusInfo.color} className="mb-2">
                                                {statusInfo.text}
                                            </Tag>
                                            <Text type="secondary" className="text-xs">
                                                Mã mượn: {String(item.id || item._id || '-').substring(0, 8)}
                                            </Text>
                                            {item.status === 'pending' && (
                                                <Button
                                                    danger
                                                    type="primary"
                                                    onClick={() => handleCancelBook(item.id || item._id)}
                                                >
                                                    Huỷ mượn
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </List.Item>
                        );
                    }}
                />
            ) : (
                <Empty description="Bạn chưa mượn cuốn sách nào." />
            )}
        </Card>
    );
};

export default BorrowingHistory;
