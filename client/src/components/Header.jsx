import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { Dropdown, Avatar, Button, Modal, message } from 'antd';
import { UserOutlined, LogoutOutlined, HistoryOutlined, SendOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import useDebounce from '../hooks/useDebounce';
import { requestLogout, requestSearchProduct } from '../config/request';

const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return undefined;
    const value = String(avatarPath).trim();
    if (!value) return undefined;
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    return `${String(import.meta.env.VITE_API_URL_IMAGE || '').replace(/\/+$/, '')}/${value.replace(/^\/+/, '')}`;
};

const getUserInitial = (fullName) => {
    const normalized = String(fullName || '').trim();
    return normalized ? normalized.charAt(0).toUpperCase() : 'U';
};

function Header() {
    const { dataUser } = useStore();
    const navigate = useNavigate();

    const [valueSearch, setValueSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isResultVisible, setIsResultVisible] = useState(false);

    const debounce = useDebounce(valueSearch, 500);

    const isStudentPending = dataUser?.idStudent === '0';
    const isStudentIssued = Boolean(dataUser?.idStudent && dataUser?.idStudent !== '0');

    const userMenuItems = [
        {
            key: 'account-head',
            disabled: true,
            label: (
                <div className="py-1">
                    <p className="text-xs text-gray-500">Đăng nhập với</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">{dataUser.email}</p>
                </div>
            ),
        },
        {
            type: 'divider',
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: <span className="font-medium">Thông tin cá nhân</span>,
            onClick: () => navigate('/infoUser'),
        },
        {
            key: 'history',
            icon: <HistoryOutlined />,
            label: <span className="font-medium">Lịch sử mượn sách</span>,
            onClick: () => navigate('/infoUser'),
        },
        {
            key: 'request-student-id',
            icon: <SendOutlined />,
            label: (
                <div className="leading-tight">
                    <p className="font-medium">Yêu cầu cấp mã sinh viên</p>
                    <p className="text-xs text-gray-500">
                        {isStudentIssued
                            ? 'Đã có mã sinh viên'
                            : isStudentPending
                              ? 'Đang chờ admin duyệt'
                              : 'Gửi yêu cầu mới'}
                    </p>
                </div>
            ),
            disabled: isStudentIssued || isStudentPending,
            onClick: () => navigate('/infoUser'),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            danger: true,
            onClick: () => handleLogout(),
        },
    ];

    const handleLogout = async () => {
        Modal.confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn đăng xuất không?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    await requestLogout();
                    navigate('/');
                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                } catch (error) {
                    console.error('Failed to logout:', error);
                    message.error('Đăng xuất thất bại, vui lòng thử lại.');
                }
            },
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!debounce.trim()) {
                setSearchResults([]);
                setIsResultVisible(false);
                return;
            }
            try {
                const res = await requestSearchProduct(debounce);
                setSearchResults(res.metadata);
                setIsResultVisible(res.metadata.length > 0);
            } catch (error) {
                console.error('Failed to search for products:', error);
                setSearchResults([]);
                setIsResultVisible(false);
            }
        };
        fetchData();
    }, [debounce]);

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link to={'/'}>
                            <div className="flex items-center gap-3 rounded-lg ">
                                <img
                                    src="/thiet-ke-logo-thu-vien-thiet-ke-phang_23-2149324476.avif"
                                    alt="Library logo"
                                    className="h-16 w-16 rounded-md object-contain shadow-sm"
                                />
                                <div className="min-w-0 leading-tight">
                                    <p className="truncate text-sm sm:text-base font-bold text-blue-800">Thư viện số</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to={'/'}
                            className="text-sm sm:text-base font-semibold text-gray-700 hover:text-blue-700 transition-colors px-3 py-1.5 rounded-full hover:bg-blue-50"
                        >
                            Trang chủ
                        </Link>
                    </div>

                    {/* Search Bar */}
                    <div className="hidden md:block flex-1 max-w-xl mx-4 lg:mx-8 relative">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={valueSearch}
                                onChange={(e) => setValueSearch(e.target.value)}
                                onFocus={() => setIsResultVisible(true)}
                                onBlur={() => setTimeout(() => setIsResultVisible(false), 200)} // Delay to allow click on results
                                placeholder="Tìm kiếm sách, tác giả..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {isResultVisible && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul className="max-h-80 overflow-y-auto">
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                                            >
                                                {(() => {
                                                    const productImageSrc = product?.image?.startsWith('http')
                                                        ? product.image
                                                        : `${import.meta.env.VITE_API_URL_IMAGE}/${product.image}`;
                                                    return (
                                                        <img
                                                            src={productImageSrc}
                                                            alt={product.nameProduct}
                                                            className="w-12 h-16 object-cover rounded-md mr-4"
                                                        />
                                                    );
                                                })()}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{product.nameProduct}</p>
                                                    <p className="text-sm text-gray-500">{product.publisher}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Auth Buttons / User Info */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {dataUser && (dataUser.id || dataUser._id) ? (
                            // User Info Dropdown
                            <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-blue-50 transition-all">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-semibold text-gray-900 leading-5">
                                        {dataUser.fullName || 'Người dùng'}
                                    </p>
                                    <p className="text-xs text-gray-500 leading-5">{dataUser.email}</p>
                                </div>

                                <Dropdown
                                    menu={{
                                        items: userMenuItems,
                                        className: 'min-w-[270px] rounded-xl',
                                    }}
                                    placement="bottomRight"
                                    arrow={{ pointAtCenter: true }}
                                    trigger={['hover', 'click']}
                                >
                                    <div className="flex items-center gap-2 cursor-pointer rounded-full pl-1 pr-2 py-1 hover:bg-blue-100/70 transition-colors">
                                        <div className="relative">
                                            <div className="p-[2px] rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 shadow-sm">
                                                <Avatar
                                                    size={34}
                                                    src={getAvatarUrl(dataUser.avatar)}
                                                    icon={<UserOutlined />}
                                                    style={{ background: 'linear-gradient(135deg, #2563eb, #0ea5e9)' }}
                                                >
                                                    {getUserInitial(dataUser.fullName)}
                                                </Avatar>
                                            </div>
                                            <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                                        </div>
                                    </div>
                                </Dropdown>
                            </div>
                        ) : (
                            // Login/Register Buttons
                            <>
                                <Link to={'/login'}>
                                    <Button className="text-gray-700 hover:text-blue-700 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to={'/register'}>
                                    <button className="bg-blue-700 hover:bg-blue-800 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                        Đăng ký
                                    </button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="md:hidden pb-3">
                    <div className="relative">
                        <input
                            type="text"
                            value={valueSearch}
                            onChange={(e) => setValueSearch(e.target.value)}
                            onFocus={() => setIsResultVisible(true)}
                            onBlur={() => setTimeout(() => setIsResultVisible(false), 200)}
                            placeholder="Tìm kiếm sách..."
                            className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {isResultVisible && searchResults.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul className="max-h-72 overflow-y-auto">
                                    {searchResults.map((product) => (
                                        <li key={product.id}>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                                            >
                                                {(() => {
                                                    const productImageSrc = product?.image?.startsWith('http')
                                                        ? product.image
                                                        : `${import.meta.env.VITE_API_URL_IMAGE}/${product.image}`;
                                                    return (
                                                        <img
                                                            src={productImageSrc}
                                                            alt={product.nameProduct}
                                                            className="w-10 h-14 object-cover rounded-md mr-3"
                                                        />
                                                    );
                                                })()}
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm">
                                                        {product.nameProduct}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{product.publisher}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

export default Header;
