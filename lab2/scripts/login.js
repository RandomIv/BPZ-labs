const domain = process.env.MY_DOMAIN;

const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        realm: 'Username-Password-Authentication',
        username: process.env.USER_EMAIL,
        password: process.env.USER_PASSWORD,
        client_id: process.env.MY_LOGIN_CLIENT_ID,
        client_secret: process.env.MY_LOGIN_CLIENT_SECRET,
        scope: 'openid profile email',
    }),
});

const result = await response.json();
if (!response.ok) {
    console.log(response.status, result);
    process.exit(1);
}

const idTokenPayload = JSON.parse(Buffer.from(result.id_token.split('.')[1], 'base64url').toString());
console.log('Login time:', new Date().toLocaleString('uk-UA'));
console.log('ID token payload:');
console.log(idTokenPayload);
