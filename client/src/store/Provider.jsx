import Context from './Context';
import CryptoJS from 'crypto-js';

import { useEffect, useRef, useState } from 'react';
import { requestAuth, requestRefreshToken } from '../config/request';
import { ToastContainer } from 'react-toastify';
import ModalBuyBook from '../components/ModalBuyBook';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const bootstrappedRef = useRef(false);

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            if (!res || !res.metadata) {
                console.error('Invalid auth response:', res);
                return false;
            }
            const bytes = CryptoJS.AES.decrypt(res.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return false;
            }
            const user = JSON.parse(originalText);
            // Normalize id shape from Mongo documents.
            if (!user.id && user._id) {
                user.id = user._id;
            }
            setDataUser(user);
            return true;
        } catch (error) {
            // User chưa đăng nhập là trường hợp bình thường khi vào app.
            if (error?.response?.status !== 401) {
                console.error('Auth error:', error);
            }
            setDataUser({});
            return false;
        }
    };

    // Silently refresh token before it expires
    const setupTokenRefresh = () => {
        // Token expires in 1 hour, refresh after 55 minutes
        const refreshInterval = 55 * 60 * 1000; // 55 minutes

        const intervalId = setInterval(async () => {
            try {
                await requestRefreshToken();
                console.log('Token refreshed silently in background');
            } catch (error) {
                console.error('Silent token refresh failed:', error);
                // Don't logout on refresh failure, let the next API call handle it
            }
        }, refreshInterval);

        return intervalId;
    };

    useEffect(() => {
        if (bootstrappedRef.current) {
            return;
        }
        bootstrappedRef.current = true;

        let refreshIntervalId;

        const bootstrapAuth = async () => {
            const isAuthenticated = await fetchAuth();
            if (isAuthenticated) {
                refreshIntervalId = setupTokenRefresh();
            }
        };

        bootstrapAuth();

        // Cleanup interval on unmount
        return () => {
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }
        };
    }, []);

    return (
        <>
            <Context.Provider
                value={{
                    dataUser,
                }}
            >
                {children}
                <ModalBuyBook />
                <ToastContainer />
            </Context.Provider>
        </>
    );
}
