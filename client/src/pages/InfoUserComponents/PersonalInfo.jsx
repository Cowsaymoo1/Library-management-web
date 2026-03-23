import React, { useState } from 'react';
import { Card, Avatar, Descriptions, Button, message, Form, Input, Upload, Tag } from 'antd';
import { UserOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { requestIdStudent, requestUpdateUser, requestUploadImage } from '../../config/request';
import { toast } from 'react-toastify';
import { useStore } from '../../hooks/useStore';

const PersonalInfo = ({ title = 'Thông tin cá nhân' }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSendingStudentRequest, setIsSendingStudentRequest] = useState(false);
    const [hasSentStudentRequest, setHasSentStudentRequest] = useState(false);

    const { dataUser } = useStore();

    const handleRequestStudentId = async () => {
        setIsSendingStudentRequest(true);
        try {
            const res = await requestIdStudent();
            toast.success(res?.message || 'Đã gửi yêu cầu cấp mã sinh viên thành công!');
            setHasSentStudentRequest(true);
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Gửi yêu cầu thất bại!');
        } finally {
            setIsSendingStudentRequest(false);
        }
    };

    const handleUpdateProfile = async (values) => {
        try {
            await requestUpdateUser(values);
            toast.success('Cập nhật thông tin thành công');
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleBeforeUpload = async (file) => {
        const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
            message.error('Bạn chỉ có thể tải lên file JPG/PNG!');
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Hình ảnh phải nhỏ hơn 2MB!');
        }
        if (isJpgOrPng && isLt2M) {
            const formData = new FormData();
            formData.append('image', file);

            try {
                await requestUploadImage(formData);
                message.success('Đổi ảnh thành công!');
                window.location.reload();
            } catch (error) {
                console.log(error);
                message.error(error?.response?.data?.message || 'Đổi ảnh thất bại!');
            }
        }
        // Ngăn chặn việc tự động tải lên
        return false;
    };

    const effectiveIdStudent = hasSentStudentRequest ? '0' : dataUser?.idStudent;

    const viewItems = [
        { key: '1', label: 'Họ và tên', children: dataUser.fullName },
        { key: '2', label: 'Email', children: dataUser.email },
        { key: '3', label: 'Số điện thoại', children: dataUser.phone || 'Chưa cập nhật' },
        { key: '4', label: 'Địa chỉ', children: dataUser.address || 'Chưa cập nhật' },
        {
            key: '5',
            label: 'Mã sinh viên',
            children: effectiveIdStudent === '0' ? 'Đang chờ duyệt' : effectiveIdStudent || 'Chưa có',
        },
    ];

    const canRequestStudentId = !effectiveIdStudent;
    const avatarSrc = dataUser?.avatar
        ? String(dataUser.avatar).startsWith('http')
            ? String(dataUser.avatar)
            : `${String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/${String(dataUser.avatar).replace(/^\/+/, '')}`
        : undefined;
    const userInitial =
        String(dataUser?.fullName || '')
            .trim()
            ?.charAt(0)
            ?.toUpperCase() || 'U';
    const isCardLocked = Boolean(effectiveIdStudent && effectiveIdStudent !== '0' && dataUser?.cardStatus === 'locked');
    const studentStatus =
        effectiveIdStudent === '0'
            ? 'Đang chờ duyệt'
            : effectiveIdStudent
              ? isCardLocked
                  ? 'Thẻ bị tạm khóa'
                  : 'Đã cấp mã sinh viên'
              : 'Chưa có mã sinh viên';
    const studentStatusColor =
        effectiveIdStudent === '0'
            ? 'processing'
            : effectiveIdStudent
              ? isCardLocked
                  ? 'warning'
                  : 'success'
              : 'default';

    return (
        <Card
            title={title}
            variant="borderless"
            className="rounded-2xl shadow-sm border border-slate-100"
            styles={{ body: { paddingTop: 20 } }}
            extra={
                !isEditing && (
                    <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)} className="rounded-lg">
                        Chỉnh sửa
                    </Button>
                )
            }
        >
            <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <div className="w-full md:w-auto">
                    <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-b from-sky-50 to-blue-50 border border-blue-100">
                        <div className="p-[3px] rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 shadow-sm">
                            <Avatar
                                size={108}
                                src={avatarSrc}
                                icon={<UserOutlined />}
                                style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)', fontSize: 32 }}
                            >
                                {userInitial}
                            </Avatar>
                        </div>
                        <Tag color={studentStatusColor} className="rounded-full px-3 py-1 text-xs font-medium">
                            {studentStatus}
                        </Tag>
                    </div>
                    {isEditing && (
                        <div className="mt-3 text-center">
                            <Upload name="avatar" showUploadList={false} beforeUpload={handleBeforeUpload}>
                                <Button icon={<UploadOutlined />} className="rounded-lg">
                                    Đổi ảnh
                                </Button>
                            </Upload>
                        </div>
                    )}
                </div>
                <div className="flex-1 w-full">
                    {isEditing ? (
                        <Form
                            layout="vertical"
                            onFinish={handleUpdateProfile}
                            initialValues={dataUser}
                            className="rounded-2xl bg-slate-50/60 p-4"
                        >
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại">
                                <Input />
                            </Form.Item>
                            <Form.Item name="address" label="Địa chỉ">
                                <Input />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit" className="mr-2 rounded-lg">
                                    Lưu thay đổi
                                </Button>
                                <Button onClick={() => setIsEditing(false)} className="rounded-lg">
                                    Hủy
                                </Button>
                            </Form.Item>
                        </Form>
                    ) : (
                        <>
                            <Descriptions
                                bordered
                                column={1}
                                layout="horizontal"
                                items={viewItems}
                                className="rounded-2xl overflow-hidden"
                            />
                            {canRequestStudentId && (
                                <Button
                                    type="primary"
                                    onClick={handleRequestStudentId}
                                    loading={isSendingStudentRequest}
                                    className="mt-4 rounded-lg"
                                >
                                    Gửi yêu cầu cấp mã sinh viên
                                </Button>
                            )}
                            {effectiveIdStudent === '0' && (
                                <Button type="default" disabled className="mt-4 rounded-lg">
                                    Yêu cầu đang chờ admin duyệt
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default PersonalInfo;
