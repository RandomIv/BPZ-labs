const env = process.env;
const domain = env.MY_DOMAIN;

async function requestToken(params) {
    const response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params),
    });
    return { ok: response.ok, body: await response.json() };
}

function login(email, password) {
    return requestToken({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: email,
        password,
        client_id: env.MY_LOGIN_CLIENT_ID,
        client_secret: env.MY_LOGIN_CLIENT_SECRET,
        audience: env.MY_API_AUDIENCE,
        scope: 'openid profile email offline_access',
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

async function createUser(email, password) {
    const management = await requestToken({
        grant_type: 'client_credentials',
        client_id: env.MY_M2M_CLIENT_ID,
        client_secret: env.MY_M2M_CLIENT_SECRET,
        audience: `https://${domain}/api/v2/`,
    });

    const response = await fetch(`https://${domain}/api/v2/users`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${management.body.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ connection: 'Username-Password-Authentication', email, password }),
    });
    return { ok: response.ok, status: response.status, body: await response.json() };
}

let publicKey;

async function getPublicKey() {
    if (!publicKey) {
        const response = await fetch(`https://${domain}/pem`);
        publicKey = await response.text();
    }
    return publicKey;
}

module.exports = { login, refresh, createUser, getPublicKey };
