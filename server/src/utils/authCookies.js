const ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000; // 1 hour
const REFRESH_TOKEN_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

// Support local HTTP and reverse-proxy HTTPS deployments.
const clientUrl = process.env.URL_CLIENT || '';
const isHttpsClient = /^https:\/\//i.test(clientUrl);
const forceSecureCookie = process.env.COOKIE_SECURE === 'true';
const useSecureCookies = forceSecureCookie || isHttpsClient;
const sameSite = useSecureCookies ? 'None' : 'Lax';

const baseCookieOptions = {
    secure: useSecureCookies,
    sameSite,
    path: '/',
};

const authCookieOptions = {
    token: { ...baseCookieOptions, httpOnly: true, maxAge: ACCESS_TOKEN_MAX_AGE },
    refreshToken: { ...baseCookieOptions, httpOnly: true, maxAge: REFRESH_TOKEN_MAX_AGE },
    logged: { ...baseCookieOptions, httpOnly: false, maxAge: REFRESH_TOKEN_MAX_AGE },
};

const clearCookieOptions = {
    token: { ...baseCookieOptions, httpOnly: true },
    refreshToken: { ...baseCookieOptions, httpOnly: true },
    logged: { ...baseCookieOptions, httpOnly: false },
};

function setAuthCookies(res, { token, refreshToken }) {
    res.cookie('token', token, authCookieOptions.token);
    res.cookie('logged', 1, authCookieOptions.logged);

    if (refreshToken) {
        res.cookie('refreshToken', refreshToken, authCookieOptions.refreshToken);
    }
}

function clearAuthCookies(res) {
    res.clearCookie('token', clearCookieOptions.token);
    res.clearCookie('refreshToken', clearCookieOptions.refreshToken);
    res.clearCookie('logged', clearCookieOptions.logged);
}

module.exports = {
    setAuthCookies,
    clearAuthCookies,
};
