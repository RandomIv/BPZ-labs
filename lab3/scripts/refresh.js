const domain = process.env.MY_DOMAIN;

const params = {
    grant_type: 'refresh_token',
    client_id: process.env.MY_LOGIN_CLIENT_ID,
    client_secret: process.env.MY_LOGIN_CLIENT_SECRET,
    refresh_token: process.argv[2],
};
console.log(`POST https://${domain}/oauth/token`);
console.log({ ...params, client_secret: '***' });

const response = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
});

const result = await response.json();
console.log('\nResponse:', response.status);
console.log(result);
