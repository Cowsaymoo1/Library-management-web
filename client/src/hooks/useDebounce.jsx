import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
    const [debounceValue, setDebounceValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebounceValue(value), delay); // xét thời gian gọi API
        return () => clearTimeout(handler); // clear timeout
    }, [value, delay]); // xét lại value hoặc delay, nếu thay đổi thì set code useEffect
    return debounceValue; // trả về value để gọi api
}

export default useDebounce;
