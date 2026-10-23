const domain = process.env.MY_DOMAIN;

const params = {
    grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
    realm: 'Username-Password-Authentication',
    username: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
    client_id: process.env.MY_LOGIN_CLIENT_ID,
    client_secret: process.env.MY_LOGIN_CLIENT_SECRET,
    audience: process.env.MY_API_AUDIENCE,
    scope: 'openid profile email offline_access',
};
console.log(`POST https://${domain}/oauth/token`);
console.log({ ...params, password: '***', client_secret: '***' });

const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
});

const result = await response.json();
console.log('\nResponse:', response.status);
console.log(result);
