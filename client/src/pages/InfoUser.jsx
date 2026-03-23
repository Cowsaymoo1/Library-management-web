import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from './InfoUserComponents/Sidebar';
import PersonalInfo from './InfoUserComponents/PersonalInfo';
import BorrowingHistory from './InfoUserComponents/BorrowingHistory';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Sider, Content } = Layout;

const INFO_USER_TITLES = {
    info: 'Thông tin cá nhân',
    history: 'Lịch sử mượn sách',
};

function InfoUser() {
    const [activeComponent, setActiveComponent] = useState('info'); // 'info' or 'history'

    const renderComponent = () => {
        switch (activeComponent) {
            case 'info':
                return <PersonalInfo title={INFO_USER_TITLES.info} />;
            case 'history':
                return <BorrowingHistory title={INFO_USER_TITLES.history} />;
            default:
                return <PersonalInfo title={INFO_USER_TITLES.info} />;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <header>
                <Header />
            </header>
            <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Layout style={{ width: '100%' }}>
                    <Sider
                        width={250}
                        theme="light"
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
                    >
                        <Sidebar
                            titles={INFO_USER_TITLES}
                            activeComponent={activeComponent}
                            setActiveComponent={setActiveComponent}
                        />
                    </Sider>
                    <Content style={{ paddingLeft: '20px', margin: 0 }}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-full">
                            {renderComponent()}
                        </div>
                    </Content>
                </Layout>
            </div>
            <footer>
                <Footer />
            </footer>
        </Layout>
    );
}

export default InfoUser;
