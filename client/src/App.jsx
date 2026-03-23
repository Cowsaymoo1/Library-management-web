import { useEffect } from 'react';
import CardBody from './components/Cardbody';
import Footer from './components/Footer';
import Header from './components/Header';
import { requestGetAllProduct } from './config/request';
import { useState } from 'react';

function App() {
    const [dataProduct, setDataProduct] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await requestGetAllProduct();
                // Handle response safely - metadata might not exist
                if (res && res.metadata && Array.isArray(res.metadata)) {
                    setDataProduct(res.metadata);
                } else if (res && Array.isArray(res)) {
                    setDataProduct(res);
                } else {
                    console.error('Invalid product response:', res);
                    setDataProduct([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                setDataProduct([]);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />

            <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(56,189,248,0.3),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.35),transparent_30%)]"></div>
                <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                    <p className="text-sm uppercase tracking-[0.24em] text-cyan-200 mb-3">Thư viện số</p>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl">
                        Khám phá kho sách chất lượng cao cho học tập và nghiên cứu
                    </h1>
                    <p className="mt-4 text-slate-200 max-w-2xl text-sm sm:text-base">
                        Mượn sách nhanh, theo dõi lịch sử và quản lý tài khoản ngay trên một giao diện gọn gàng, dễ sử
                        dụng.
                    </p>
                </div>
            </section>

            <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Danh mục sách</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Hiện có {dataProduct.length} đầu sách trong hệ thống
                        </p>
                    </div>
                </div>

                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6">
                    {dataProduct.map((item) => (
                        <CardBody key={item._id} data={item} />
                    ))}
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default App;
