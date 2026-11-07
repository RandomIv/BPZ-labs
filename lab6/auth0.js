const env = process.env;
const domain = env.MY_DOMAIN;
const redirectUri = 'http://localhost:3000';

async function requestToken(params) {
    const response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
    });
    return { ok: response.ok, body: await response.json() };
}

function authorizeUrl() {
    const params = new URLSearchParams({
        client_id: env.MY_LOGIN_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        response_mode: 'query',
        scope: 'openid profile email offline_access',
        audience: env.MY_API_AUDIENCE,
    });
    return `https://${domain}/authorize?${params}`;
}

function exchangeCode(code) {
    return requestToken({
        grant_type: 'authorization_code',
        client_id: env.MY_LOGIN_CLIENT_ID,
        client_secret: env.MY_LOGIN_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
    });
}

function refresh(refreshToken) {
    return requestToken({
        grant_type: 'refresh_token',
        client_id: env.MY_LOGIN_CLIENT_ID,
        client_secret: env.MY_LOGIN_CLIENT_SECRET,
        refresh_token: refreshToken,
    });
}

module.exports = { authorizeUrl, exchangeCode, refresh };
