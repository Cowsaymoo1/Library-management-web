import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer id="lien-he" className="mt-auto bg-slate-900 text-slate-100">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold mb-3">Thư viện số</h3>
                        <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
                            Nền tảng quản lý thư viện giúp bạn tìm sách nhanh, mượn sách trực tuyến và theo dõi lịch sử
                            sử dụng một cách rõ ràng.
                        </p>
                        <div className="mt-5 flex items-center gap-3 text-xs text-slate-400">
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                                Hỗ trợ 24/7
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                                Bảo mật thông tin
                            </span>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold mb-4 text-white">Liên kết nhanh</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link to="/" className="text-slate-300 hover:text-cyan-300 transition-colors">
                                    Trang chủ
                                </Link>
                            </li>
                            <li>
                                <Link to="/" className="text-slate-300 hover:text-cyan-300 transition-colors">
                                    Danh mục sách
                                </Link>
                            </li>
                            <li>
                                <Link to="/infoUser" className="text-slate-300 hover:text-cyan-300 transition-colors">
                                    Lịch sử mượn
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/forgot-password"
                                    className="text-slate-300 hover:text-cyan-300 transition-colors"
                                >
                                    Hỗ trợ tài khoản
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-base font-semibold mb-4 text-white">Thông tin liên hệ</h3>
                        <div className="space-y-2 text-sm text-slate-300">
                            <p>Địa chỉ: 123 Đường ABC, Quận Birmingham, Hà Nội</p>
                            <p>Điện thoại: (028) 1234 5678</p>
                            <p>Email: info@thuvien.edu.vn</p>
                            <p>Thời gian: 08:00 - 20:00 (Thứ 2 - Chủ nhật)</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-slate-400 text-sm">© 2026 Hệ thống Quản lý Thư viện. Đã đăng ký bản quyền.</p>
                    <p className="text-slate-500 text-xs">Xây dựng với React và Tailwind CSS</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
