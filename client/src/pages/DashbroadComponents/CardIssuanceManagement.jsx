import React, { useEffect, useMemo, useState } from 'react';
import { Table, Button, Tag, Modal, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import {
    requestGetRequestLoan,
    requestConfirmIdStudent,
    requestCancelIdStudentRequest,
    requestUpdateStudentCardStatus,
    requestRemoveStudentCard,
} from '../../config/request';

const buildAvatarCandidates = (avatarPath) => {
    if (!avatarPath) return [];

    const raw = String(avatarPath).trim();
    if (!raw) return [];
    if (raw.startsWith('http://') || raw.startsWith('https://')) return [encodeURI(raw)];

    const baseUrl = String(import.meta.env.VITE_API_URL_IMAGE || '').replace(/\/+$/, '');
    if (!baseUrl) return [];

    const normalized = raw.replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, '');
    const candidates = [];

    if (normalized.startsWith('src/uploads/')) {
        candidates.push(`${baseUrl}/${normalized.replace(/^src\//, '')}`);
    }
    if (normalized.startsWith('uploads/')) {
        candidates.push(`${baseUrl}/${normalized}`);
    }
    if (normalized.includes('/')) {
        candidates.push(`${baseUrl}/${normalized}`);
    } else {
        candidates.push(`${baseUrl}/uploads/avatars/${normalized}`);
        candidates.push(`${baseUrl}/${normalized}`);
    }

    return [...new Set(candidates.map((url) => encodeURI(url)))];
};

const AvatarCell = ({ avatarPath, fullName }) => {
    const candidates = useMemo(() => buildAvatarCandidates(avatarPath), [avatarPath]);
    const [candidateIndex, setCandidateIndex] = useState(0);

    useEffect(() => {
        setCandidateIndex(0);
    }, [avatarPath]);

    const displayName = String(fullName || '').trim();
    const initial = displayName ? displayName.charAt(0).toUpperCase() : null;
    const src = candidates[candidateIndex];

    return (
        <Avatar
            size={70}
            src={src}
            icon={!initial ? <UserOutlined /> : null}
            style={{ backgroundColor: '#d9d9d9', color: '#595959' }}
            onError={() => {
                if (candidateIndex < candidates.length - 1) {
                    setCandidateIndex((prev) => prev + 1);
                    return false;
                }
                return true;
            }}
        >
            {initial}
        </Avatar>
    );
};

const CardIssuanceManagement = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isIssueModalVisible, setIsIssueModalVisible] = useState(false);
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await requestGetRequestLoan();
            setData(Array.isArray(res?.metadata) ? res.metadata : []);
        } catch (error) {
            message.error(error?.response?.data?.message || 'Không thể tải danh sách yêu cầu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Xử lý Modal Cấp thẻ ---
    const showIssueModal = (user) => {
        setSelectedUser(user);
        setIsIssueModalVisible(true);
    };

    const handleIssueCancel = () => {
        setIsIssueModalVisible(false);
        setSelectedUser(null);
    };

    const handleIssueOk = async () => {
        setLoading(true);
        try {
            const payload = {
                userId: selectedUser?.id || selectedUser?._id,
            };
            const res = await requestConfirmIdStudent(payload);
            const generatedId = res?.metadata?.idStudent;
            message.success(
                generatedId
                    ? `Đã cấp thẻ cho ${selectedUser.fullName}. Mã sinh viên: ${generatedId}`
                    : `Đã cấp thẻ cho ${selectedUser.fullName}`,
            );
            handleIssueCancel();
            fetchData();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Cấp thẻ thất bại');
        } finally {
            setLoading(false);
        }
    };

    // --- Xử lý Modal Hủy ---
    const showCancelModal = (user) => {
        setSelectedUser(user);
        setIsCancelModalVisible(true);
    };

    const handleCancelCancel = () => {
        setIsCancelModalVisible(false);
        setSelectedUser(null);
    };

    const handleCancelOk = async () => {
        setLoading(true);
        try {
            await requestCancelIdStudentRequest({ userId: selectedUser?.id || selectedUser?._id });
            message.success(`Đã hủy yêu cầu cấp thẻ cho ${selectedUser.fullName}`);
            handleCancelCancel();
            fetchData();
        } catch (error) {
            message.error(error?.response?.data?.message || 'Hủy yêu cầu thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleCardLock = (record, shouldLock) => {
        Modal.confirm({
            title: shouldLock ? 'Xác nhận khóa thẻ' : 'Xác nhận mở khóa thẻ',
            content: shouldLock
                ? `Bạn có chắc chắn muốn khóa thẻ của ${record?.fullName}?`
                : `Bạn có chắc chắn muốn mở khóa thẻ của ${record?.fullName}?`,
            okText: shouldLock ? 'Khóa thẻ' : 'Mở khóa',
            cancelText: 'Hủy',
            okButtonProps: shouldLock ? { danger: true } : {},
            onOk: async () => {
                setLoading(true);
                try {
                    await requestUpdateStudentCardStatus({
                        userId: record?.id || record?._id,
                        cardStatus: shouldLock ? 'locked' : 'active',
                    });
                    message.success(shouldLock ? 'Đã khóa thẻ sinh viên' : 'Đã mở khóa thẻ sinh viên');
                    fetchData();
                } catch (error) {
                    message.error(error?.response?.data?.message || 'Cập nhật trạng thái thẻ thất bại');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleDeleteCard = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa thẻ',
            content: `Bạn có chắc chắn muốn xóa thẻ sinh viên của ${record?.fullName}?`,
            okText: 'Xóa thẻ',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                setLoading(true);
                try {
                    await requestRemoveStudentCard({ userId: record?.id || record?._id });
                    message.success('Đã xóa thẻ sinh viên');
                    fetchData();
                } catch (error) {
                    message.error(error?.response?.data?.message || 'Xóa thẻ thất bại');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const isPendingCardIssuance = (idStudent) => !idStudent || idStudent === '0';
    const isCardLocked = (record) => record?.cardStatus === 'locked';

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (text, record) => <span>{String(text || record?._id || '').slice(0, 10) || '-'}</span>,
        },
        {
            title: 'Ảnh đại diện',
            dataIndex: 'avatar',
            key: 'avatar',
            render: (text, record) => <AvatarCell avatarPath={text} fullName={record?.fullName} />,
        },
        { title: 'Họ và tên', dataIndex: 'fullName', key: 'fullName' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Số điện thoại', dataIndex: 'phone', key: 'phone' },
        {
            title: 'Trạng thái',
            dataIndex: 'idStudent',
            key: 'idStudent',
            render: (idStudent, record) => (
                <Tag color={isPendingCardIssuance(idStudent) ? 'blue' : isCardLocked(record) ? 'orange' : 'green'}>
                    {isPendingCardIssuance(idStudent) ? 'Chờ cấp' : isCardLocked(record) ? 'Thẻ bị tạm khóa' : 'Đã cấp'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <div className="flex gap-2">
                    {isPendingCardIssuance(record?.idStudent) ? (
                        <>
                            <Button type="primary" onClick={() => showIssueModal(record)}>
                                Cấp thẻ
                            </Button>
                            <Button type="primary" danger onClick={() => showCancelModal(record)}>
                                Hủy
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                type="primary"
                                danger={!isCardLocked(record)}
                                onClick={() => handleToggleCardLock(record, !isCardLocked(record))}
                            >
                                {isCardLocked(record) ? 'Mở khóa thẻ' : 'Khóa thẻ'}
                            </Button>
                            <Button danger onClick={() => handleDeleteCard(record)}>
                                Xóa thẻ
                            </Button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <h2 className="text-2xl mb-4 font-bold">Quản lý cấp thẻ sinh viên</h2>
            <Table
                columns={columns}
                dataSource={data}
                rowKey={(record) => record?.id || record?._id}
                loading={loading}
            />

            {/* Modal Cấp thẻ */}
            <Modal
                title={`Cấp thẻ cho: ${selectedUser?.fullName}`}
                open={isIssueModalVisible}
                onOk={handleIssueOk}
                onCancel={handleIssueCancel}
                confirmLoading={loading}
                okText="Cấp thẻ"
                cancelText="Hủy"
            >
                <p>
                    Hệ thống sẽ tự động tạo mã sinh viên gồm <b>10 chữ số</b> cho người dùng này sau khi bạn xác nhận.
                </p>
            </Modal>

            {/* Modal Hủy yêu cầu */}
            <Modal
                title="Xác nhận hủy yêu cầu"
                open={isCancelModalVisible}
                onOk={handleCancelOk}
                onCancel={handleCancelCancel}
                confirmLoading={loading}
                okText="Xác nhận hủy"
                cancelText="Không"
                okButtonProps={{ danger: true }}
            >
                <p>
                    Bạn có chắc chắn muốn hủy yêu cầu cấp thẻ của <b>{selectedUser?.fullName}</b> không?
                </p>
            </Modal>
        </div>
    );
};

export default CardIssuanceManagement;
